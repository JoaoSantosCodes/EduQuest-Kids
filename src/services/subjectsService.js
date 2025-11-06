import { supabase } from '../config/supabase';

// Listar todas as matérias
export const getSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return { subjects: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar matérias:', error);
    return { subjects: [], error: error.message };
  }
};

// Buscar uma matéria por ID
export const getSubjectById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { subject: data, error: null };
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    return { subject: null, error: error.message };
  }
};

// Buscar questões de uma matéria
export const getQuestionsBySubject = async (subjectId, options = {}) => {
  try {
    const {
      grade_level,
      difficulty,
      limit = 20,
      approved = true,
    } = options;

    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true);

    if (approved) {
      query = query.eq('approved', true);
    }

    if (grade_level) {
      query = query.eq('grade_level', grade_level);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    // Embaralhar questões se necessário
    if (data && options.shuffle) {
      data.sort(() => Math.random() - 0.5);
    }

    return { questions: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    return { questions: [], error: error.message };
  }
};

