import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTeacherByUserId, getTeacherDashboard } from '../services/teachersService';

export const useTeacher = () => {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'teacher') {
      loadTeacherData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar professor por user_id
      const { teacher: teacherData, error: teacherError } = await getTeacherByUserId(user.id);
      
      if (teacherError) throw teacherError;

      if (teacherData) {
        setTeacher(teacherData);

        // Buscar dashboard
        const dashboardData = await getTeacherDashboard(teacherData.id);
        setDashboard(dashboardData);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do professor:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    if (teacher) {
      const dashboardData = await getTeacherDashboard(teacher.id);
      setDashboard(dashboardData);
    }
  };

  return {
    teacher,
    dashboard,
    classrooms: dashboard?.classrooms || [],
    students: dashboard?.students || [],
    subjects: dashboard?.subjects || [],
    loading,
    error,
    refreshDashboard,
  };
};

