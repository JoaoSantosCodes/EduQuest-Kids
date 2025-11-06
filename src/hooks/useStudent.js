import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentDashboard } from '../services/studentsService';
import logger from '../utils/logger';

/**
 * Hook customizado para gerenciar dados do aluno
 */
export const useStudent = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadStudentData();
    }
  }, [user?.id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Carregando dados do aluno:', user?.id);

      const data = await getStudentDashboard(user.id);

      if (data.error) {
        throw new Error(data.error);
      }

      setStudent(data.student);
      setClassroom(data.classroom);
      setDashboard(data);

      logger.info('Dados do aluno carregados:', {
        student: data.student?.id,
        classroom: data.classroom?.name,
      });
    } catch (err) {
      logger.error('Erro ao carregar dados do aluno:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadStudentData();
  };

  // Alias para compatibilidade com EduQuizApp
  const refreshStats = refreshDashboard;

  // Extrair stats do dashboard
  const stats = dashboard?.stats || null;

  return {
    student,
    classroom,
    dashboard,
    stats,
    loading,
    error,
    refreshDashboard,
    refreshStats,
  };
};
