import { supabase } from '../config/supabase';

// Vincular filho ao pai
export const linkParentToStudent = async (parentId, studentId, relationship = 'responsável') => {
  try {
    const { data, error } = await supabase
      .from('parent_student_relation')
      .insert({
        parent_id: parentId,
        student_id: studentId,
        relationship: relationship,
        can_view_reports: true,
        can_set_goals: true,
        can_limit_time: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { relation: data, error: null };
  } catch (error) {
    console.error('Erro ao vincular filho ao pai:', error);
    return { relation: null, error: error.message };
  }
};

// Desvincular filho do pai
export const unlinkParentFromStudent = async (parentId, studentId) => {
  try {
    const { error } = await supabase
      .from('parent_student_relation')
      .delete()
      .eq('parent_id', parentId)
      .eq('student_id', studentId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Erro ao desvincular filho do pai:', error);
    return { error: error.message };
  }
};

// Buscar alunos disponíveis para vincular (por email ou nome)
export const searchAvailableStudents = async (searchTerm) => {
  try {
    // Buscar alunos por nome ou email
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        grade,
        school,
        users (
          id,
          name,
          email
        )
      `)
      .or(`users.name.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%`)
      .limit(20);

    if (error) throw error;

    return { students: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return { students: [], error: error.message };
  }
};

// Atualizar permissões da relação pai-filho
export const updateParentStudentRelation = async (relationId, permissions) => {
  try {
    const { data, error } = await supabase
      .from('parent_student_relation')
      .update({
        can_view_reports: permissions.canViewReports !== undefined ? permissions.canViewReports : true,
        can_set_goals: permissions.canSetGoals !== undefined ? permissions.canSetGoals : true,
        can_limit_time: permissions.canLimitTime !== undefined ? permissions.canLimitTime : true,
      })
      .eq('id', relationId)
      .select()
      .single();

    if (error) throw error;

    return { relation: data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar relação:', error);
    return { relation: null, error: error.message };
  }
};

