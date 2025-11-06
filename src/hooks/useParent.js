import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getParentDashboard } from '../services/parentsService';
import logger from '../utils/logger';

/**
 * Hook customizado para gerenciar dados do pai/mãe
 */
export const useParent = () => {
  const { user } = useAuth();
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadParentData();
    }
  }, [user?.id]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Carregando dados do pai/mãe:', user?.id);

      const data = await getParentDashboard(user.id);

      if (data.error) {
        throw new Error(data.error);
      }

      setParent(data.parent);
      setChildren(data.children || []);
      setDashboard(data);

      logger.info('Dados do pai/mãe carregados:', {
        parent: data.parent?.id,
        children: data.children?.length || 0,
      });
    } catch (err) {
      logger.error('Erro ao carregar dados do pai/mãe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadParentData();
  };

  return {
    parent,
    children,
    dashboard,
    loading,
    error,
    refreshDashboard,
  };
};
