import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCoordinatorByUserId, getAllClassrooms, getAllTeachers } from '../services/coordinatorsService';

export const useCoordinator = () => {
  const { user } = useAuth();
  const [coordinator, setCoordinator] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'coordinator') {
      loadCoordinatorData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCoordinatorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar coordenador por user_id
      const { coordinator: coordinatorData, error: coordinatorError } = await getCoordinatorByUserId(user.id);
      
      if (coordinatorError) throw coordinatorError;

      if (coordinatorData) {
        setCoordinator(coordinatorData);

        // Buscar todas as turmas
        const { classrooms: classroomsData, error: classroomsError } = await getAllClassrooms();
        
        if (classroomsError) {
          console.warn('Erro ao buscar turmas:', classroomsError);
        } else {
          setClassrooms(classroomsData || []);
        }

        // Buscar todos os professores
        const { teachers: teachersData, error: teachersError } = await getAllTeachers();
        
        if (teachersError) {
          console.warn('❌ Erro ao buscar professores:', teachersError);
        } else {
          console.log('✅ Professores carregados no hook:', teachersData?.length || 0, teachersData);
          setTeachers(teachersData || []);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do coordenador:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshClassrooms = async () => {
    const { classrooms: classroomsData, error: classroomsError } = await getAllClassrooms();
    
    if (!classroomsError && classroomsData) {
      setClassrooms(classroomsData);
    }
  };

  const refreshTeachers = async () => {
    const { teachers: teachersData, error: teachersError } = await getAllTeachers();
    
    if (!teachersError && teachersData) {
      setTeachers(teachersData);
    }
  };

  return {
    coordinator,
    classrooms,
    teachers,
    loading,
    error,
    refreshClassrooms,
    refreshTeachers,
  };
};

