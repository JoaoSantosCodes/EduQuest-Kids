// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Headers padrão
export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Função genérica para requisições
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer requisição');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Mensagem mais clara para o usuário
    if (error.message === 'Failed to fetch' || error.message.includes('ERR_CONNECTION_REFUSED')) {
      const errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando ou configure o Supabase.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};

