import { supabase } from '../config/supabase';
import logger from '../utils/logger';

/**
 * Busca dados completos do dashboard do aluno
 */
export const getStudentDashboard = async (userId) => {
  try {
    // 1. Buscar dados do aluno
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        users (
          id,
          name,
          email,
          avatar_url,
          phone,
          birth_date,
          gender,
          address
        )
      `)
      .eq('user_id', userId)
      .single();

    if (studentError) {
      logger.error('Erro ao buscar aluno:', studentError);
      return { error: studentError.message };
    }

    if (!students) {
      logger.warn('Aluno não encontrado para user_id:', userId);
      return { error: 'Aluno não encontrado' };
    }

    // 2. Buscar turma do aluno
    const { data: classroomStudent } = await supabase
      .from('classroom_students')
      .select(`
        classroom_id,
        classrooms (
          id,
          name,
          grade,
          shift,
          school_year
        )
      `)
      .eq('student_id', students.id)
      .single();

    const classroom = classroomStudent?.classrooms || null;

    // 3. Buscar notas do aluno
    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        subjects (
          id,
          name,
          icon,
          color
        ),
        teachers (
          users (
            name
          )
        )
      `)
      .eq('student_id', students.id)
      .order('evaluation_date', { ascending: false });

    // Calcular média geral
    const validGrades = grades?.filter(g => g.grade !== null && g.max_grade !== null) || [];
    const averageGrade = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + (g.grade / g.max_grade) * 10, 0) / validGrades.length
      : null;

    // 4. Buscar frequência do aluno
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', students.id)
      .order('date', { ascending: false });

    // Calcular percentual de presença
    const totalAttendance = attendance?.length || 0;
    const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
    const attendancePercentage = totalAttendance > 0
      ? (presentCount / totalAttendance) * 100
      : null;

    // 5. Buscar atividades do aluno
    const { data: assignments } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments (
          id,
          title,
          description,
          assignment_type,
          due_date,
          max_grade,
          classroom_id,
          subjects (
            name,
            icon,
            color
          ),
          teachers (
            users (
              name
            )
          )
        )
      `)
      .eq('student_id', students.id)
      .order('submitted_at', { ascending: false });

    const pendingAssignments = assignments?.filter(a => a.status === 'pending').length || 0;
    const gradedAssignments = assignments?.filter(a => a.status === 'graded').length || 0;

    // 6. Buscar materiais didáticos
    let materials = [];
    if (classroom) {
      const { data: classroomMaterials } = await supabase
        .from('learning_materials')
        .select(`
          *,
          subjects (
            name,
            icon,
            color
          ),
          teachers (
            users (
              name
            )
          )
        `)
        .eq('classroom_id', classroom.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      materials = classroomMaterials || [];
    }

    // 7. Buscar próximos eventos
    let upcomingEvents = [];
    if (classroom) {
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('classroom_id', classroom.id)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      upcomingEvents = events || [];
    }

    // 8. Buscar avisos
    let announcements = [];
    if (classroom) {
      const { data: classroomAnnouncements } = await supabase
        .from('announcements')
        .select(`
          *,
          teachers (
            users (
              name
            )
          )
        `)
        .eq('classroom_id', classroom.id)
        .eq('is_published', true)
        .gte('expires_at', new Date().toISOString())
        .order('publish_date', { ascending: false })
        .limit(5);

      announcements = classroomAnnouncements || [];
    }

    return {
      student: students,
      classroom,
      grades: grades || [],
      attendance: attendance || [],
      assignments: assignments || [],
      materials,
      upcomingEvents,
      announcements,
      stats: {
        averageGrade: averageGrade ? Math.round(averageGrade * 10) / 10 : null,
        attendancePercentage: attendancePercentage ? Math.round(attendancePercentage) : null,
        totalGrades: validGrades.length,
        totalAttendance,
        pendingAssignments,
        gradedAssignments,
        totalMaterials: materials.length,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Erro ao buscar dashboard do aluno:', error);
    return { error: error.message };
  }
};

/**
 * Submete uma atividade
 */
export const submitAssignment = async (assignmentId, studentId, submissionData) => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        submission_text: submissionData.text,
        submission_file_url: submissionData.fileUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      }, {
        onConflict: 'assignment_id,student_id'
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Erro ao submeter atividade:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Busca materiais didáticos da turma do aluno
 */
export const getClassroomMaterials = async (classroomId) => {
  try {
    const { data, error } = await supabase
      .from('learning_materials')
      .select(`
        *,
        subjects (
          name,
          icon,
          color
        ),
        teachers (
          users (
            name
          )
        )
      `)
      .eq('classroom_id', classroomId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { materials: data || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar materiais:', error);
    return { materials: [], error: error.message };
  }
};

/**
 * Incrementa contador de download de material
 */
export const incrementMaterialDownload = async (materialId) => {
  try {
    // Tentar usar a função RPC se existir, caso contrário, fazer update direto
    const { data: material } = await supabase
      .from('learning_materials')
      .select('download_count')
      .eq('id', materialId)
      .single();

    const newCount = (material?.download_count || 0) + 1;

    const { error } = await supabase
      .from('learning_materials')
      .update({ download_count: newCount })
      .eq('id', materialId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    logger.error('Erro ao incrementar downloads:', error);
    return { error: error.message };
  }
};

/**
 * Busca quizzes disponíveis para o aluno
 */
export const getAvailableQuizzes = async (studentId) => {
  try {
    // Buscar turma do aluno primeiro
    const { data: classroomStudent } = await supabase
      .from('classroom_students')
      .select('classroom_id')
      .eq('student_id', studentId)
      .single();

    if (!classroomStudent) {
      return { quizzes: [], error: null };
    }

    // Buscar quizzes da turma
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        subjects (
          name,
          icon,
          color
        ),
        teachers (
          users (
            name
          )
        )
      `)
      .eq('classroom_id', classroomStudent.classroom_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { quizzes: quizzes || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar quizzes:', error);
    return { quizzes: [], error: error.message };
  }
};

/**
 * Busca questões de um quiz
 */
export const getQuizQuestions = async (quizId) => {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { questions: questions || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar questões:', error);
    return { questions: [], error: error.message };
  }
};

/**
 * Salva resultado de quiz
 */
export const saveQuizResult = async (quizId, studentId, score, answers) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        score,
        answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Erro ao salvar resultado:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Inicia uma sessão de estudo
 */
export const startStudySession = async (studentId, subjectId) => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        student_id: studentId,
        subject_id: subjectId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { session: data, error: null };
  } catch (error) {
    logger.error('Erro ao iniciar sessão de estudo:', error);
    return { session: null, error: error.message };
  }
};

/**
 * Finaliza uma sessão de estudo
 */
export const endStudySession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    return { session: data, error: null };
  } catch (error) {
    logger.error('Erro ao finalizar sessão de estudo:', error);
    return { session: null, error: error.message };
  }
};
