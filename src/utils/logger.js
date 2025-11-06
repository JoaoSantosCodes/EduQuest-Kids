/**
 * Sistema de Logging Centralizado
 * 
 * Substitui console.log/error/warn por um sistema de logging
 * com níveis e controle de produção
 */

const logLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor() {
    // Em produção, apenas logs de ERROR
    // Em desenvolvimento, todos os logs
    this.level = import.meta.env.PROD ? logLevels.ERROR : logLevels.DEBUG;
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(...args) {
    if (!this.isProduction && this.level <= logLevels.DEBUG) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Log de informação (apenas em desenvolvimento)
   */
  info(...args) {
    if (!this.isProduction && this.level <= logLevels.INFO) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  warn(...args) {
    if (!this.isProduction && this.level <= logLevels.WARN) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log de erro
   * Em produção, pode enviar para serviço de monitoramento (Sentry, etc)
   */
  error(...args) {
    if (this.level <= logLevels.ERROR) {
      console.error('[ERROR]', ...args);
      
      // Em produção, enviar para serviço de monitoramento
      if (import.meta.env.PROD) {
        // TODO: Integrar com Sentry ou outro serviço
        // Sentry.captureException(new Error(args.join(' ')));
      }
    }
  }

  /**
   * Log de erro de API
   */
  apiError(error, context = '') {
    const message = context ? `[${context}]` : '';
    this.error(message, error);
    
    // Log detalhado em desenvolvimento
    if (!import.meta.env.PROD && error.response) {
      this.debug('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config?.url,
      });
    }
  }
}

// Exportar instância singleton
export default new Logger();

