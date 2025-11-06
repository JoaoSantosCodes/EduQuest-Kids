import { useState, useEffect } from 'react';
import { getSubjects } from '../services/subjectsService';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { subjects: data, error: err } = await getSubjects();

      if (err) throw new Error(err);

      setSubjects(data || []);
    } catch (err) {
      console.error('Erro ao carregar matérias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    loading,
    error,
    refresh: loadSubjects,
  };
};

