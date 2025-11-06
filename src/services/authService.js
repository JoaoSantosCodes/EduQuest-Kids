import { apiRequest } from '../config/api';
import { isSupabaseConfigured } from '../config/supabase';
import * as supabaseAuth from './supabaseAuthService';
import * as mockAuth from './mockAuthService';
import logger from '../utils/logger';

// Detectar qual método usar (Supabase ou API REST)
const useSupabase = isSupabaseConfigured();

// Login
export const login = async (email, password) => {
  if (useSupabase) {
    return await supabaseAuth.login(email, password);
  }

  // Fallback para Mock Auth (desenvolvimento sem backend)
  logger.debug('Usando autenticação MOCK para testes');
  return await mockAuth.mockLogin(email, password);
};

// Login com Google
export const loginWithGoogle = async () => {
  if (useSupabase) {
    return await supabaseAuth.loginWithGoogle();
  }

  throw new Error('Login com Google não disponível sem Supabase');
};

// Processar callback do OAuth
export const handleAuthCallback = async () => {
  if (useSupabase) {
    return await supabaseAuth.handleAuthCallback();
  }

  throw new Error('Callback OAuth não disponível sem Supabase');
};

// Registro
export const register = async (userData) => {
  if (useSupabase) {
    return await supabaseAuth.register(userData);
  }

  // Fallback para Mock Auth (desenvolvimento sem backend)
  logger.debug('Usando autenticação MOCK para testes');
  return await mockAuth.mockRegister(userData);
};

// Logout
export const logout = async () => {
  if (useSupabase) {
    await supabaseAuth.logout();
    return;
  }

  // Fallback para Mock Auth
  await mockAuth.mockLogout();
};

// Buscar usuário atual
export const getCurrentUser = async () => {
  if (useSupabase) {
    return await supabaseAuth.getCurrentUser();
  }

  // Fallback para Mock Auth
  return await mockAuth.mockGetCurrentUser();
};

// Verificar se está autenticado
export const isAuthenticated = async () => {
  if (useSupabase) {
    return await supabaseAuth.isAuthenticated();
  }

  // Verificar Mock Auth
  return !!localStorage.getItem('mock_token');
};

// Obter token
export const getToken = async () => {
  if (useSupabase) {
    const session = await supabaseAuth.getSession();
    return session?.access_token || null;
  }

  return localStorage.getItem('mock_token') || localStorage.getItem('token');
};

// Obter usuário do localStorage (apenas para API REST)
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Exportar função para escutar mudanças de auth (apenas Supabase)
export const onAuthStateChange = useSupabase ? supabaseAuth.onAuthStateChange : null;

