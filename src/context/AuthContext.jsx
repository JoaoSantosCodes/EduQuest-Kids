import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, getUser, logout as logoutService, onAuthStateChange } from '../services/authService';
import { isSupabaseConfigured } from '../config/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    checkAuth();

    // Escutar mudanças de autenticação (Supabase)
    if (isSupabaseConfigured() && onAuthStateChange) {
      const { data: { subscription } } = onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuth(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser.user || getUser());
          setIsAuth(true);
        } catch (error) {
          // Token inválido, limpar e fazer logout
          logout();
        }
      } else {
        const userData = getUser();
        if (userData) {
          setUser(userData);
          setIsAuth(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuth(true);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    setIsAuth(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuth,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

