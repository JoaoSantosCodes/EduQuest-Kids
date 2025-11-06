import { supabase } from '../config/supabase';

// Listar turmas do professor
export const getTeacherClassrooms = async (teacherId) => {
  try {
    // Buscar turmas onde o professor é o criador (teacher_id)
    const { data: createdClassrooms, error: createdError } = await supabase
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
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true);

    if (createdError) throw createdError;

    // Buscar turmas onde o professor está atribuído via classroom_teachers
    const { data: assignedClassrooms, error: assignedError } = await supabase
      .from('classroom_teachers')
      .select(`
        classroom_id,
        is_primary,
        classrooms!inner (
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
          )
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .eq('classrooms.is_active', true);

    if (assignedError) {
      console.warn('Erro ao buscar turmas atribuídas:', assignedError);
    }

    // Combinar e remover duplicatas
    const createdIds = new Set((createdClassrooms || []).map(c => c.id));
    const assigned = (assignedClassrooms || [])
      .map(item => item.classrooms)
      .filter(Boolean)
      .filter(c => !createdIds.has(c.id)); // Remover duplicatas

    const allClassrooms = [
      ...(createdClassrooms || []),
      ...assigned
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { classrooms: allClassrooms, error: null };
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return { classrooms: [], error: error.message };
  }
};

// Criar turma
export const createClassroom = async (classroomData) => {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        teacher_id: classroomData.teacher_id,
        name: classroomData.name,
        grade_level: classroomData.grade_level,
        school: classroomData.school || '',
        subject_id: classroomData.subject_id || null,
        description: classroomData.description || '',
      })
      .select()
      .single();

    if (error) throw error;

    return { classroom: data, error: null };
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return { classroom: null, error: error.message };
  }
};

// Atualizar turma
export const updateClassroom = async (classroomId, updates) => {
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
    console.error('Erro ao atualizar turma:', error);
    return { classroom: null, error: error.message };
  }
};

// Deletar turma
export const deleteClassroom = async (classroomId) => {
  try {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', classroomId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    return { error: error.message };
  }
};

// Listar alunos de uma turma
export const getClassroomStudents = async (classroomId) => {
  try {
    const { data, error } = await supabase
      .from('classroom_students')
      .select(`
        *,
        students (
          id,
          user_id,
          grade,
          school,
          total_points,
          level,
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
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    const students = data?.map(item => ({
      ...item.students,
      enrolledAt: item.enrolled_at,
    })) || [];

    return { students, error: null };
  } catch (error) {
    console.error('Erro ao buscar alunos da turma:', error);
    return { students: [], error: error.message };
  }
};

// Adicionar aluno à turma
export const addStudentToClassroom = async (classroomId, studentId) => {
  try {
    const { data, error } = await supabase
      .from('classroom_students')
      .insert({
        classroom_id: classroomId,
        student_id: studentId,
      })
      .select()
      .single();

    if (error) throw error;

    return { enrollment: data, error: null };
  } catch (error) {
    console.error('Erro ao adicionar aluno à turma:', error);
    return { enrollment: null, error: error.message };
  }
};

// Remover aluno da turma
export const removeStudentFromClassroom = async (classroomId, studentId) => {
  try {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Erro ao remover aluno da turma:', error);
    return { error: error.message };
  }
};

// Buscar turmas do aluno
export const getStudentClassrooms = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('classroom_students')
      .select(`
        *,
        classrooms (
          id,
          name,
          grade_level,
          school,
          description,
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
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (error) throw error;

    const classrooms = data?.map(item => ({
      ...item.classrooms,
      enrolledAt: item.enrolled_at,
    })) || [];

    return { classrooms, error: null };
  } catch (error) {
    console.error('Erro ao buscar turmas do aluno:', error);
    return { classrooms: [], error: error.message };
  }
};

// Buscar alunos disponíveis para adicionar à turma
export const getAvailableStudents = async (teacherId, gradeLevel) => {
  try {
    // Buscar alunos que ainda não estão na turma
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
      .eq('grade', gradeLevel)
      .order('grade', { ascending: true });

    if (error) throw error;

    return { students: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar alunos disponíveis:', error);
    return { students: [], error: error.message };
  }
};

