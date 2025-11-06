import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas!');
  console.warn('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

// Criar cliente Supabase apenas se as variáveis estiverem configuradas
let supabase = null;
if (supabaseUrl && supabaseAnonKey && supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.warn('Erro ao criar cliente Supabase:', error);
    supabase = null;
  }
}

export { supabase };

// Função para testar conexão
export const testConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        error: 'Variáveis do Supabase não configuradas'
      };
    }

    // Testar conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('subjects')
      .select('count')
      .limit(1);

    if (error) {
      // Se a tabela não existe, ainda é uma conexão válida
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Conexão com Supabase estabelecida! Tabelas ainda não criadas.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Erro ao conectar com Supabase'
    };
  }
};

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export default supabase;

