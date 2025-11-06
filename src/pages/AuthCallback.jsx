import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { handleAuthCallback } from '../services/authService';
import { updateUserRole, needsRoleSelection } from '../services/userRoleService';
import RoleSelection from '../components/auth/RoleSelection';
import { Loader2 } from 'lucide-react';
import logger from '../utils/logger';

// Log FORA do componente para garantir que aparece
// FORÇAR LOGS MÚLTIPLAS VEZES PARA GARANTIR VISIBILIDADE
console.log('[DEBUG] ============================================');
console.log('[DEBUG] AuthCallback.jsx CARREGADO');
console.log('[DEBUG] ============================================');
console.warn('[DEBUG] AuthCallback.jsx CARREGADO (via warn)');
console.error('[DEBUG] AuthCallback.jsx CARREGADO (via error)');

export default function AuthCallback() {
  // Log FORÇADO no início do componente - MÚLTIPLAS VEZES
  console.log('[DEBUG] ============================================');
  console.log('[DEBUG] AuthCallback componente montado');
  console.log('[DEBUG] URL atual:', window.location.href);
  console.log('[DEBUG] Hash da URL:', window.location.hash);
  console.log('[DEBUG] ============================================');
  console.warn('[DEBUG] AuthCallback componente montado (via warn)');
  console.error('[DEBUG] AuthCallback componente montado (via error)');
  
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [needsRole, setNeedsRole] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        setLoading(true);
        
        // Log para debug - usar console.log diretamente
        console.log('[DEBUG] ============================================');
        console.log('[DEBUG] AuthCallback iniciado');
        console.log('[DEBUG] URL atual:', window.location.href);
        console.log('[DEBUG] Hash da URL:', window.location.hash);
        console.log('[DEBUG] ============================================');
        
        // Aguardar um pouco para garantir que o Supabase processou o callback
        // Isso é importante porque o Supabase precisa processar o hash da URL primeiro
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Processar callback do OAuth
        console.log('[DEBUG] Chamando handleAuthCallback...');
        const response = await handleAuthCallback();
        console.log('[DEBUG] handleAuthCallback retornou:', response ? 'Sucesso' : 'Falhou');
        
        if (response.user) {
          // Verificar se precisa selecionar role
          const needsSelection = await needsRoleSelection(response.user.id);
          
          if (needsSelection) {
            // Se não tem role definido ou é padrão, mostrar seleção
            setNeedsRole(true);
            setUserData(response.user);
            setLoading(false);
            return;
          }

          // Se já tem role, fazer login normalmente
          setAuth(response.user);
          
          // Redirecionar baseado no role
          const role = response.user.role;
          if (role === 'student') {
            navigate('/student', { replace: true });
          } else if (role === 'parent') {
            navigate('/parent', { replace: true });
          } else if (role === 'teacher') {
            navigate('/teacher', { replace: true });
          } else if (role === 'coordinator') {
            navigate('/coordinator', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } catch (err) {
        console.error('[ERROR] ============================================');
        console.error('[ERROR] Erro no AuthCallback:', err);
        console.error('[ERROR] Stack:', err.stack);
        console.error('[ERROR] ============================================');
        logger.error('Erro no AuthCallback:', err);
        setError(err.message || 'Erro ao processar autenticação');
        setLoading(false);
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [navigate, setAuth]);

  const handleRoleSelected = async (role) => {
    try {
      setLoading(true);
      setError('');

      // Atualizar role do usuário
      const { user, error: roleError } = await updateUserRole(
        userData.id,
        role,
        {
          grade: role === 'student' ? 7 : undefined,
          school: '',
        }
      );

      if (roleError) {
        throw new Error(roleError);
      }

      if (!user) {
        throw new Error('Erro ao atualizar perfil');
      }

      // Atualizar contexto de autenticação
      const updatedUser = {
        ...userData,
        ...user,
        role: user.role || role,
      };

      setAuth(updatedUser);

      // Redirecionar baseado no role
      if (role === 'student') {
        navigate('/student', { replace: true });
      } else if (role === 'parent') {
        navigate('/parent', { replace: true });
      } else if (role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else if (role === 'coordinator') {
        navigate('/coordinator', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Erro ao definir perfil');
      setLoading(false);
    }
  };

  // Se precisa selecionar role, mostrar componente de seleção
  if (needsRole && userData) {
    return (
      <RoleSelection
        onRoleSelected={handleRoleSelected}
        userEmail={userData.email}
        userName={userData.name}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-600 mb-2">Processando autenticação...</h2>
          <p className="text-gray-600">Aguarde enquanto finalizamos seu login</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro na autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecionando para a página de login...</p>
        </div>
      </div>
    );
  }

  return null;
}

