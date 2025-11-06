import { supabase } from '../config/supabase';
import logger from '../utils/logger';
import { handleSupabaseError } from '../utils/errorHandler';

// Buscar coordenador por user_id
export const getCoordinatorByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('coordinators')
      .select(`
        *,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { coordinator: null, error: null };
    }

    const coordinator = {
      ...data,
      name: data.users?.name || '',
      email: data.users?.email || '',
      avatar_url: data.users?.avatar_url || null,
    };

    return { coordinator, error: null };
  } catch (error) {
    logger.error('Erro ao buscar coordenador:', error);
    handleSupabaseError(error, 'getCoordinatorByUserId');
    return { coordinator: null, error: error.message };
  }
};

// Listar todas as turmas (coordenador tem acesso a todas)
export const getAllClassrooms = async () => {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`
        *,
        subjects (
          id,
          name,
          icon,
          color
        ),
        teachers!classrooms_teacher_id_fkey (
          id,
          users (
            name
          )
        ),
        coordinators (
          id,
          users (
            name
          )
        ),
        classroom_teachers (
          teacher_id,
          is_primary,
          is_active,
          teachers (
            id,
            users (
              name,
              email
            )
          )
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { classrooms: data || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar turmas:', error);
    handleSupabaseError(error, 'getAllClassrooms');
    return { classrooms: [], error: error.message };
  }
};

// Listar todos os professores
export const getAllTeachers = async () => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        user_id,
        school,
        specialization,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const teachers = (data || []).map(teacher => ({
      id: teacher.id,
      user_id: teacher.user_id,
      name: teacher.users?.name || '',
      email: teacher.users?.email || '',
      avatar_url: teacher.users?.avatar_url || null,
      school: teacher.school || '',
      specialization: teacher.specialization || [],
    }));

    return { teachers, error: null };
  } catch (error) {
    logger.error('Erro ao buscar professores:', error);
    handleSupabaseError(error, 'getAllTeachers');
    return { teachers: [], error: error.message };
  }
};

// Atribuir professor à turma
export const assignTeacherToClassroom = async (classroomId, teacherId, isPrimary = false, assignedBy) => {
  try {
    // Verificar se já existe um registro (ativo ou inativo)
    const { data: existing, error: checkError } = await supabase
      .from('classroom_teachers')
      .select('id, is_active')
      .eq('classroom_id', classroomId)
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (checkError) throw checkError;

    let data;
    
    if (existing) {
      // Se existe, apenas ativar
      const { data: updated, error: updateError } = await supabase
        .from('classroom_teachers')
        .update({
          is_active: true,
          is_primary: isPrimary,
          assigned_by: assignedBy,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      data = updated;
    } else {
      // Se não existe, inserir novo
      const { data: inserted, error: insertError } = await supabase
        .from('classroom_teachers')
        .insert({
          classroom_id: classroomId,
          teacher_id: teacherId,
          is_primary: isPrimary,
          is_active: true,
          assigned_by: assignedBy,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      data = inserted;
    }

    return { assignment: data, error: null };
  } catch (error) {
    logger.error('Erro ao atribuir professor:', error);
    handleSupabaseError(error, 'assignTeacherToClassroom');
    return { assignment: null, error: error.message };
  }
};

// Remover professor da turma
export const removeTeacherFromClassroom = async (classroomId, teacherId) => {
  try {
    const { error } = await supabase
      .from('classroom_teachers')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('teacher_id', teacherId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    logger.error('Erro ao remover professor:', error);
    handleSupabaseError(error, 'removeTeacherFromClassroom');
    return { error: error.message };
  }
};

// Definir professor principal da turma
export const setPrimaryTeacher = async (classroomId, teacherId) => {
  try {
    // Primeiro, remover is_primary de todos os professores da turma
    await supabase
      .from('classroom_teachers')
      .update({ is_primary: false })
      .eq('classroom_id', classroomId);

    // Depois, definir o professor como principal
    const { data, error } = await supabase
      .from('classroom_teachers')
      .update({ is_primary: true })
      .eq('classroom_id', classroomId)
      .eq('teacher_id', teacherId)
      .select()
      .single();

    if (error) throw error;

    return { assignment: data, error: null };
  } catch (error) {
    logger.error('Erro ao definir professor principal:', error);
    handleSupabaseError(error, 'setPrimaryTeacher');
    return { assignment: null, error: error.message };
  }
};

// Criar turma (coordenador)
export const createClassroomAsCoordinator = async (classroomData, coordinatorId) => {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        teacher_id: classroomData.teacher_id || null, // Professor criador (opcional)
        coordinator_id: coordinatorId,
        name: classroomData.name,
        grade_level: classroomData.grade_level,
        school: classroomData.school || '',
        subject_id: classroomData.subject_id || null,
        description: classroomData.description || '',
      })
      .select()
      .single();

    if (error) throw error;

    // Se houver professores para atribuir, fazer isso agora
    if (classroomData.teacher_ids && classroomData.teacher_ids.length > 0) {
      const assignments = classroomData.teacher_ids.map((teacherId, index) => ({
        classroom_id: data.id,
        teacher_id: teacherId,
        is_primary: index === 0, // Primeiro é o principal
        assigned_by: classroomData.assigned_by,
      }));

      await supabase
        .from('classroom_teachers')
        .insert(assignments);
    }

    return { classroom: data, error: null };
  } catch (error) {
    logger.error('Erro ao criar turma:', error);
    handleSupabaseError(error, 'createClassroomAsCoordinator');
    return { classroom: null, error: error.message };
  }
};

// Atualizar turma (coordenador)
export const updateClassroomAsCoordinator = async (classroomId, updates) => {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', classroomId)
      .select()
      .single();

    if (error) throw error;

    return { classroom: data, error: null };
  } catch (error) {
    logger.error('Erro ao atualizar turma:', error);
    handleSupabaseError(error, 'updateClassroomAsCoordinator');
    return { classroom: null, error: error.message };
  }
};

// Deletar turma (coordenador)
export const deleteClassroomAsCoordinator = async (classroomId) => {
  try {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', classroomId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    logger.error('Erro ao deletar turma:', error);
    handleSupabaseError(error, 'deleteClassroomAsCoordinator');
    return { error: error.message };
  }
};

// Listar professores de uma turma
export const getClassroomTeachers = async (classroomId) => {
  try {
    const { data, error } = await supabase
      .from('classroom_teachers')
      .select(`
        *,
        teachers (
          id,
          user_id,
          school,
          users (
            id,
            name,
            email,
            avatar_url
          )
        )
      `)
      .eq('classroom_id', classroomId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    const teachers = (data || []).map(item => ({
      ...item.teachers,
      name: item.teachers?.users?.name || '',
      email: item.teachers?.users?.email || '',
      avatar_url: item.teachers?.users?.avatar_url || null,
      isPrimary: item.is_primary,
      assignedAt: item.assigned_at,
    }));

    return { teachers, error: null };
  } catch (error) {
    logger.error('Erro ao buscar professores da turma:', error);
    handleSupabaseError(error, 'getClassroomTeachers');
    return { teachers: [], error: error.message };
  }
};

