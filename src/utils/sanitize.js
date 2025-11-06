/**
 * Sistema de Sanitização de Dados
 * 
 * Previne XSS e sanitiza inputs do usuário
 */

/**
 * Sanitiza string HTML
 * Remove tags HTML perigosas e mantém apenas texto seguro
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Lista de tags permitidas (whitelist)
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  // Remover scripts e eventos
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');

  // Remover tags não permitidas
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });

  return sanitized;
};

/**
 * Sanitiza texto simples (remove HTML)
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove todas as tags HTML
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Sanitiza input de usuário (nome, email, etc)
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove caracteres perigosos
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

/**
 * Sanitiza URL
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Apenas URLs http/https permitidas
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  
  if (!urlPattern.test(url)) {
    return '';
  }

  // Garantir que começa com http:// ou https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
};

/**
 * Sanitiza objeto completo
 */
export const sanitizeObject = (obj, options = {}) => {
  const {
    allowHTML = false,
    allowedFields = null,
    maxLength = null,
  } = options;

  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Filtrar campos permitidos
    if (allowedFields && !allowedFields.includes(key)) {
      continue;
    }

    if (typeof value === 'string') {
      // Sanitizar string
      let sanitizedValue = allowHTML ? sanitizeHTML(value) : sanitizeText(value);
      
      // Limitar tamanho
      if (maxLength && sanitizedValue.length > maxLength) {
        sanitizedValue = sanitizedValue.substring(0, maxLength);
      }

      sanitized[key] = sanitizedValue;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursão para objetos
      sanitized[key] = sanitizeObject(value, options);
    } else if (Array.isArray(value)) {
      // Sanitizar array
      sanitized[key] = value.map(item => {
        if (typeof item === 'string') {
          return allowHTML ? sanitizeHTML(item) : sanitizeText(item);
        }
        return item;
      });
    } else {
      // Manter outros tipos (number, boolean, etc)
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeInput,
  sanitizeURL,
  sanitizeObject,
};

