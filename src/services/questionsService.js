import { supabase } from '../config/supabase';
import logger from '../utils/logger';

// Listar questões com filtros
export const getQuestions = async (filters = {}) => {
  try {
    const {
      subject_id,
      difficulty,
      grade_level,
      approved = true,
      teacher_id,
      search,
      limit = 50,
      offset = 0,
    } = filters;

    let query = supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          icon,
          color
        ),
        teachers!questions_teacher_id_fkey (
          id,
          users (
            name
          )
        )
      `)
      .eq('is_active', true);

    if (approved !== undefined) {
      query = query.eq('approved', approved);
    }

    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (grade_level) {
      query = query.eq('grade_level', grade_level);
    }

    if (teacher_id) {
      query = query.eq('teacher_id', teacher_id);
    }

    if (search) {
      query = query.or(`question_text.ilike.%${search}%,tags.cs.{${search}}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Contar total
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return {
      questions: data || [],
      total: count || 0,
      limit,
      offset,
      error: null,
    };
  } catch (error) {
    logger.error('Erro ao buscar questões:', error);
    return { questions: [], total: 0, error: error.message };
  }
};

// Criar questão
export const createQuestion = async (questionData) => {
  try {
    // Buscar teacher_id do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (teacherError || !teacher) {
      throw new Error('Professor não encontrado');
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        ...questionData,
        teacher_id: teacher.id,
        options: JSON.stringify(questionData.options),
        tags: questionData.tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    return { question: data, error: null };
  } catch (error) {
    logger.error('Erro ao criar questão:', error);
    return { question: null, error: error.message };
  }
};

// Atualizar questão
export const updateQuestion = async (questionId, updates) => {
  try {
    const updateData = { ...updates };

    if (updateData.options) {
      updateData.options = JSON.stringify(updateData.options);
    }

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;

    return { question: data, error: null };
  } catch (error) {
    logger.error('Erro ao atualizar questão:', error);
    return { question: null, error: error.message };
  }
};

// Deletar questão (soft delete)
export const deleteQuestion = async (questionId) => {
  try {
    const { error } = await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('id', questionId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    logger.error('Erro ao deletar questão:', error);
    return { success: false, error: error.message };
  }
};

// Buscar questão por ID
export const getQuestionById = async (questionId) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          icon,
          color
        ),
        teachers!questions_teacher_id_fkey (
          id,
          users (
            name
          )
        )
      `)
      .eq('id', questionId)
      .single();

    if (error) throw error;

    return { question: data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar questão:', error);
    return { question: null, error: error.message };
  }
};

