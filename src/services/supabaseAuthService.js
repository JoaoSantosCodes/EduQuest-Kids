import { supabase } from '../config/supabase';
import { toast } from 'sonner';
import logger from '../utils/logger';

// Login com Supabase
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Buscar dados do usuário da tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      logger.warn('Usuário não encontrado na tabela users:', userError);
    }

    const user = {
      id: data.user.id,
      email: data.user.email,
      ...userData,
      role: userData?.role || null, // NÃO forçar 'student' - manter null se não tiver
    };

    return {
      user,
      token: data.session?.access_token,
      session: data.session,
    };
  } catch (error) {
    logger.error('Erro no login:', error);
    
    // Tratar erro específico de email não confirmado
    if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
      throw new Error('Email não confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação. Se não recebeu o email, verifique se a confirmação de email está desabilitada no Supabase ou tente reenviar o email de confirmação.');
    }
    
    throw new Error(error.message || 'Erro ao fazer login');
  }
};

// Login com Google
export const loginWithGoogle = async () => {
  try {
    logger.debug('Iniciando login com Google...');
    
    if (!supabase) {
      throw new Error('Supabase não configurado. Verifique o arquivo .env');
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;
    logger.debug('Redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    logger.debug('Resposta do Supabase:', { hasData: !!data, hasError: !!error });

    if (error) {
      logger.error('Erro no login com Google:', error);
      throw error;
    }

    if (!data || !data.url) {
      logger.error('Nenhuma URL retornada pelo Supabase');
      throw new Error('Falha ao obter URL de autenticação do Google. Verifique as configurações no Supabase Dashboard.');
    }

    logger.info('URL de autenticação obtida com sucesso');
    logger.debug('Redirecionando para:', data.url);

    // O redirecionamento será feito automaticamente pelo Supabase
    // O callback será tratado pela função handleAuthCallback
    return { url: data.url, error: null };
  } catch (error) {
    logger.error('Erro fatal no login com Google:', error);
    
    // Mensagens de erro mais específicas
    if (error.message?.includes('not configured') || error.message?.includes('OAuth')) {
      throw new Error('Login com Google não configurado corretamente no Supabase. Verifique: Authentication → Providers → Google');
    }
    
    throw new Error(error.message || 'Erro ao fazer login com Google');
  }
};

// Lidar com callback do OAuth
export const handleAuthCallback = async () => {
  try {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    // Logs de debug para troubleshooting
    logger.debug('handleAuthCallback iniciado', {
      url: window.location.href,
      hash: window.location.hash ? 'Presente' : 'Ausente'
    });

    // Verificar se há tokens no hash da URL primeiro
    const hash = window.location.hash.substring(1);
    logger.debug('Hash processado:', hash ? 'Presente' : 'Ausente');
    
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const errorParam = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    logger.debug('Tokens extraídos:', {
      accessToken: accessToken ? 'Presente' : 'Ausente',
      refreshToken: refreshToken ? 'Presente' : 'Ausente',
      errorParam
    });

    // Se há erro na URL, lançar imediatamente
    if (errorParam) {
      logger.error('Erro na URL:', { errorParam, errorDescription });
      throw new Error(errorDescription || `Erro na autenticação: ${errorParam}`);
    }

    // Se há tokens na URL, processar primeiro antes de tentar getSession
    if (accessToken) {
      logger.debug('Tokens encontrados na URL, processando sessão...');
      
      try {
        // Tentar definir a sessão diretamente com os tokens
        logger.debug('Chamando setSession com tokens...', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken
        });
        
        // Tentar definir a sessão diretamente com os tokens
        // O aviso de clock skew é apenas um aviso, não um erro fatal
        const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        logger.debug('setSession resultado:', {
          hasSession: !!setSessionData?.session,
          hasError: !!setSessionError,
          error: setSessionError?.message
        });

        if (setSessionError) {
          logger.error('Erro ao definir sessão com tokens da URL:', {
            code: setSessionError.code,
            message: setSessionError.message
          });
          
          // Se o erro for relacionado a clock skew, não lançar erro imediatamente
          // O aviso de clock skew geralmente não impede a sessão de ser estabelecida
          // Vamos tentar getSession mesmo assim
          if (setSessionError.message?.includes('clock') || setSessionError.message?.includes('skew')) {
            logger.warn('Erro de clock skew detectado, mas continuando...');
            logger.warn('Tentando buscar sessão via getSession...');
            // Não lançar erro, continuar para tentar getSession
          } else {
            // Para outros erros, lançar normalmente
            throw setSessionError;
          }
        }
        
        // Se setSession funcionou e temos sessão, usar ela
        if (setSessionData?.session) {
          logger.info('Sessão definida com sucesso!', {
            userId: setSessionData.session.user.id,
            userEmail: setSessionData.session.user.email
          });
          
          // Limpar hash da URL após processar
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Usar a sessão definida
          const session = setSessionData.session;
          
          // Buscar dados do usuário da tabela users
          logger.debug('Buscando dados do usuário na tabela users...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          logger.debug('Resultado da busca do usuário:', {
            hasUserData: !!userData,
            hasError: !!userError,
            error: userError?.message,
            userRole: userData?.role
          });

          if (userError) {
            logger.warn('Usuário não encontrado na tabela users:', userError);
          }

          // Se o usuário não existe na tabela users (primeiro login com Google)
          if (!userData) {
            logger.debug('Usuário não encontrado, aguardando trigger criar registro...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Aumentar tempo de espera
            
            logger.debug('Tentando buscar usuário novamente...');
            const { data: retryUserData, error: retryError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            logger.debug('Resultado da segunda busca:', {
              hasUserData: !!retryUserData,
              hasError: !!retryError,
              error: retryError?.message,
              userRole: retryUserData?.role
            });

            if (retryUserData) {
              const user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
                ...retryUserData,
                role: retryUserData.role || null,
              };

              logger.info('Usuário encontrado após retry', {
                userId: user.id,
                userEmail: user.email,
                userRole: user.role
              });

              return {
                user,
                token: session.access_token,
                session,
              };
            } else {
              logger.warn('Usuário ainda não encontrado após retry. A trigger pode não ter executado.');
            }
          }

          logger.info('Usuário encontrado, retornando dados', {
            userId: session.user.id,
            userEmail: session.user.email,
            userRole: userData?.role
          });

          const user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || userData?.name || session.user.email?.split('@')[0] || 'Usuário',
            ...userData,
            role: userData?.role || null,
          };

          return {
            user,
            token: session.access_token,
            session,
          };
        }
      } catch (setSessionErr) {
        logger.warn('Erro ao processar tokens da URL:', setSessionErr);
        // Continuar tentando outras abordagens
      }
    }

    // Se não há tokens na URL OU se o setSession falhou, tentar buscar sessão diretamente
    // Isso pode acontecer se o Supabase já processou o hash automaticamente
    logger.debug('Tentando buscar sessão diretamente via getSession...');
    
    // Aguardar um pouco para garantir que o Supabase processou o callback
    // Aumentar tempo de espera para dar mais tempo ao Supabase processar o hash
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tentar buscar a sessão várias vezes (o callback pode levar um tempo)
    let session = null;
    let sessionError = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (!session && attempts < maxAttempts) {
      logger.debug(`Tentativa ${attempts + 1}/${maxAttempts} de buscar sessão...`);
      
      // Tentar buscar a sessão
      const { data: { session: currentSession }, error: error } = await supabase.auth.getSession();
      
      logger.debug(`Tentativa ${attempts + 1} resultado:`, {
        hasSession: !!currentSession,
        hasError: !!error,
        error: error?.message,
        userId: currentSession?.user?.id,
        userEmail: currentSession?.user?.email
      });

      if (error) {
        sessionError = error;
        logger.warn(`Tentativa ${attempts + 1} de buscar sessão falhou:`, error);
        
        // Se o erro for clock skew, não considerar como erro fatal
        if (error.message?.includes('clock') || error.message?.includes('skew')) {
          logger.warn('Erro de clock skew, mas continuando...');
          // Continuar tentando
        }
      } else if (currentSession) {
        logger.info(`Sessão encontrada na tentativa ${attempts + 1}!`, {
          userId: currentSession.user.id,
          userEmail: currentSession.user.email
        });
        session = currentSession;
        break;
      } else {
        logger.warn(`Tentativa ${attempts + 1}: Sessão não encontrada`);
      }

      attempts++;
      if (attempts < maxAttempts) {
        // Aguardar antes de tentar novamente (aumentar tempo de espera)
        logger.debug('Aguardando antes da próxima tentativa...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aumentar de 500ms para 1000ms
      }
    }

    if (sessionError && !session) {
      logger.error('Erro ao buscar sessão após todas as tentativas:', sessionError);
      throw sessionError;
    }

    // Se ainda não temos sessão após todas as tentativas, lançar erro
    if (!session) {
      logger.error('Sessão não encontrada após todas as tentativas', {
        hash: window.location.hash || 'Vazio',
        url: window.location.href
      });
      
      // Limpar hash da URL se ainda houver (para evitar processamento duplicado)
      if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      throw new Error('Sessão não encontrada após autenticação. Por favor, tente fazer login novamente.');
    }

    // Buscar dados do usuário da tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (userError) {
      logger.warn('Usuário não encontrado na tabela users:', userError);
    }

    // Se o usuário não existe na tabela users (primeiro login com Google)
    // A trigger deve criar automaticamente, mas vamos aguardar um pouco
    if (!userData) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Tentar buscar novamente
      const { data: retryUserData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (retryUserData) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
          ...retryUserData,
          // Não definir role padrão aqui - deixar para seleção se necessário
          role: retryUserData.role || null,
        };

        return {
          user,
          token: session.access_token,
          session,
        };
      }
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name || userData?.name || session.user.email?.split('@')[0] || 'Usuário',
      ...userData,
      // Manter role existente ou null se não tiver
      role: userData?.role || null,
    };

    return {
      user,
      token: session.access_token,
      session,
    };
  } catch (error) {
    logger.error('Erro ao processar callback do OAuth:', error);
    throw new Error(error.message || 'Erro ao processar autenticação');
  }
};

// Registro com Supabase
export const register = async (userData) => {
  try {
    // Criar usuário no Supabase Auth
    // Incluir todos os metadados necessários para as triggers
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          grade: userData.grade || (userData.role === 'student' ? 7 : null),
          school: userData.school || '',
        },
      },
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // A trigger handle_new_user() cria automaticamente o registro na tabela users
    // e também cria o registro em students/teachers/parents
    // Aguardar um pouco para garantir que a trigger foi executada
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Buscar o registro criado pela trigger
    // A trigger deve ter criado automaticamente, então apenas buscamos
    // NÃO tentar criar manualmente - isso causa erros 401/42501 porque a sessão ainda não está totalmente autenticada
    let userRecord = null;
    let attempts = 0;
    const maxAttempts = 10; // Aumentar tentativas para dar mais tempo à trigger

    while (!userRecord && attempts < maxAttempts) {
      try {
        // Usar maybeSingle para evitar erro 406 quando não encontra
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (existingUser && !fetchError) {
          userRecord = existingUser;
          break;
        }

        // Se não encontrou, aguardar mais e tentar novamente
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        logger.warn(`Tentativa ${attempts + 1} falhou:`, error);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Se ainda não encontrou, usar dados do auth (a trigger deve ter criado mas ainda não está visível)
    // NÃO tentar criar manualmente - isso causa erros 401/42501 porque a sessão ainda não está totalmente autenticada
    if (!userRecord) {
      logger.warn('Registro ainda não encontrado na tabela users, usando dados do auth');
      // Usar dados do auth temporariamente - a trigger deve ter criado, apenas não está visível ainda
      userRecord = {
        id: authData.user.id,
        email: authData.user.email,
        name: userData.name,
        role: userData.role,
      };
    }

    // A trigger handle_new_user() cria automaticamente o registro em students/teachers/parents
    // Não tentar criar manualmente - isso causa erros 401/42501 porque a sessão ainda não está totalmente autenticada
    // Apenas aguardar um pouco mais para garantir que tudo foi criado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Se não houver sessão após signUp, pode ser que o Supabase exija confirmação de email
    // Nesse caso, não tentamos fazer login automaticamente - o usuário precisará confirmar o email primeiro
    let session = authData.session;
    
    if (!session) {
      // Se não houver sessão, pode ser que o email precise ser confirmado
      // Nesse caso, não tentamos fazer login - apenas aguardamos
      logger.warn('Sessão não disponível após registro. Pode ser necessário confirmar o email primeiro.');
      // Aguardar um pouco mais para dar tempo ao Supabase processar
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      // Se houver sessão, aguardar um pouco mais para garantir que está totalmente estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: userData.name,
      role: userData.role,
      ...userRecord,
    };

    return {
      user,
      token: session?.access_token,
      session: session,
    };
  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Tratar erro específico de usuário já registrado
    if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
      throw new Error('Este email já está cadastrado. Por favor, faça login ou use outro email.');
    }
    
    // Tratar erro de email inválido
    if (error.message?.includes('Invalid email') || error.message?.includes('invalid email')) {
      throw new Error('Email inválido. Por favor, verifique o email informado.');
    }
    
    throw new Error(error.message || 'Erro ao criar conta');
  }
};

// Logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    logger.error('Erro no logout:', error);
  }
};

// Buscar usuário atual
export const getCurrentUser = async () => {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar dados completos do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError) {
      logger.error('ERRO CRÍTICO ao buscar dados do usuário:', {
        error: userError,
        userId: authUser.id,
        email: authUser.email
      });
      // NÃO definir role padrão - lançar erro para forçar investigação
      throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        ...userData,
      },
    };
  } catch (error) {
    logger.error('Erro ao buscar usuário atual:', error);
    throw error;
  }
};

// Verificar se está autenticado
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
};

// Obter sessão atual
export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
};

// Escutar mudanças de autenticação
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

