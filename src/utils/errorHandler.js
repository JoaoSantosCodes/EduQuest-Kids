/**
 * Sistema de Tratamento de Erros Centralizado
 * 
 * Padroniza o tratamento de erros em toda a aplicação
 */

import logger from './logger';
import { toast } from 'sonner';

/**
 * Tipos de erro comuns
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Mapeia erros para tipos
 */
const getErrorType = (error) => {
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('ERR_CONNECTION_REFUSED') ||
      error.message?.includes('Network')) {
    return ErrorTypes.NETWORK;
  }
  
  if (error.message?.includes('validation') || 
      error.message?.includes('invalid') ||
      error.message?.includes('required')) {
    return ErrorTypes.VALIDATION;
  }
  
  if (error.message?.includes('auth') || 
      error.message?.includes('unauthorized') ||
      error.message?.includes('401')) {
    return ErrorTypes.AUTH;
  }
  
  if (error.message?.includes('permission') || 
      error.message?.includes('forbidden') ||
      error.message?.includes('403')) {
    return ErrorTypes.PERMISSION;
  }
  
  if (error.message?.includes('not found') || 
      error.message?.includes('404')) {
    return ErrorTypes.NOT_FOUND;
  }
  
  if (error.message?.includes('500') || 
      error.message?.includes('server')) {
    return ErrorTypes.SERVER;
  }
  
  return ErrorTypes.UNKNOWN;
};

/**
 * Mensagens amigáveis para cada tipo de erro
 */
const errorMessages = {
  [ErrorTypes.NETWORK]: {
    title: 'Erro de Conexão',
    message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
    action: 'Tentar Novamente',
  },
  [ErrorTypes.VALIDATION]: {
    title: 'Dados Inválidos',
    message: 'Por favor, verifique os dados informados e tente novamente.',
    action: 'Corrigir',
  },
  [ErrorTypes.AUTH]: {
    title: 'Não Autorizado',
    message: 'Sua sessão expirou. Por favor, faça login novamente.',
    action: 'Fazer Login',
  },
  [ErrorTypes.PERMISSION]: {
    title: 'Acesso Negado',
    message: 'Você não tem permissão para realizar esta ação.',
    action: 'Voltar',
  },
  [ErrorTypes.NOT_FOUND]: {
    title: 'Não Encontrado',
    message: 'O recurso solicitado não foi encontrado.',
    action: 'Voltar',
  },
  [ErrorTypes.SERVER]: {
    title: 'Erro no Servidor',
    message: 'Ocorreu um erro no servidor. Nossa equipe foi notificada.',
    action: 'Tentar Novamente',
  },
  [ErrorTypes.UNKNOWN]: {
    title: 'Erro Inesperado',
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    action: 'Tentar Novamente',
  },
};

/**
 * Trata erro e exibe mensagem ao usuário
 */
export const handleError = (error, context = '', options = {}) => {
  const {
    showToast = true,
    logError = true,
    customMessage = null,
    onError = null,
  } = options;

  // Log do erro
  if (logError) {
    logger.error(`[${context}]`, error);
  }

  // Determinar tipo de erro
  const errorType = getErrorType(error);
  const errorInfo = errorMessages[errorType];

  // Mensagem customizada ou padrão
  const message = customMessage || errorInfo.message;

  // Exibir toast
  if (showToast) {
    toast.error(errorInfo.title, {
      description: message,
      duration: 5000,
    });
  }

  // Callback customizado
  if (onError) {
    onError(error, errorType, errorInfo);
  }

  // Retornar informações do erro
  return {
    type: errorType,
    message,
    title: errorInfo.title,
    action: errorInfo.action,
    originalError: error,
  };
};

/**
 * Wrapper para funções assíncronas com tratamento de erro
 */
export const withErrorHandling = (fn, context = '', options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context, options);
      throw error; // Re-throw para permitir tratamento adicional
    }
  };
};

/**
 * Valida e trata erros de API
 */
export const handleApiError = (error, context = '') => {
  // Se for erro do Supabase
  if (error.code) {
    logger.apiError(error, context);
    
    // Mensagens específicas para erros do Supabase
    const supabaseMessages = {
      'PGRST116': 'Recurso não encontrado',
      '23505': 'Este registro já existe',
      '23503': 'Erro de referência (foreign key)',
      '42501': 'Você não tem permissão para esta ação',
    };

    const message = supabaseMessages[error.code] || error.message || 'Erro ao processar solicitação';
    
    toast.error('Erro', {
      description: message,
      duration: 5000,
    });

    return {
      type: ErrorTypes.SERVER,
      message,
      code: error.code,
      originalError: error,
    };
  }

  // Tratamento padrão
  return handleError(error, context);
};

/**
 * Trata erros específicos do Supabase
 */
export const handleSupabaseError = (error, context = '') => {
  return handleApiError(error, context);
};

export default {
  handleError,
  handleApiError,
  handleSupabaseError,
  withErrorHandling,
  ErrorTypes,
};

