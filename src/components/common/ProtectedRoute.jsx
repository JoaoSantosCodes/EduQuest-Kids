import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuth, loading, user } = useAuth();

  console.log('🛡️ [PROTECTED ROUTE] Verificando acesso:', {
    isAuth,
    loading,
    userRole: user?.role,
    allowedRoles,
    userEmail: user?.email
  });

  if (loading) {
    console.log('🛡️ [PROTECTED ROUTE] Aguardando autenticação...');
    return <LoadingSpinner fullScreen text="Verificando autenticação..." />;
  }

  if (!isAuth) {
    console.log('🛡️ [PROTECTED ROUTE] Não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('🛡️ [PROTECTED ROUTE] Role não permitido! User role:', user?.role, 'Allowed:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  console.log('🛡️ [PROTECTED ROUTE] ✅ Acesso permitido!');
  return children;
}

