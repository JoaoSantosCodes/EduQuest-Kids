import { supabase } from '../config/supabase';
import logger from '../utils/logger';

/**
 * Busca dados completos do dashboard do pai/mãe
 */
export const getParentDashboard = async (userId) => {
  try {
    // 1. Buscar dados do pai/mãe
    const { data: parents, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (parentError) {
      logger.error('Erro ao buscar pai/mãe:', parentError);
      return { error: parentError.message };
    }

    if (!parents) {
      logger.warn('Pai/mãe não encontrado para user_id:', userId);
      return { error: 'Pai/mãe não encontrado' };
    }

    // 2. Buscar filhos vinculados
    const { data: relations, error: relationsError } = await supabase
      .from('parent_student_relation')
      .select(`
        student_id,
        relationship_type,
        students (
          id,
          user_id,
          enrollment_number,
          grade_level,
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
        )
      `)
      .eq('parent_id', parents.id);

    if (relationsError) {
      logger.error('Erro ao buscar filhos:', relationsError);
    }

    const children = relations?.map(rel => ({
      ...rel.students,
      relationship_type: rel.relationship_type,
    })) || [];

    // 3. Para cada filho, buscar turma, notas, frequência
    const childrenWithDetails = await Promise.all(
      children.map(async (child) => {
        // Buscar turma do aluno
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
          .eq('student_id', child.id)
          .single();

        // Buscar notas do aluno
        const { data: grades } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', child.id);

        // Calcular média geral
        const validGrades = grades?.filter(g => g.grade !== null && g.max_grade !== null) || [];
        const averageGrade = validGrades.length > 0
          ? validGrades.reduce((sum, g) => sum + (g.grade / g.max_grade) * 10, 0) / validGrades.length
          : null;

        // Buscar frequência do aluno
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', child.id);

        // Calcular percentual de presença
        const totalAttendance = attendance?.length || 0;
        const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
        const attendancePercentage = totalAttendance > 0
          ? (presentCount / totalAttendance) * 100
          : null;

        // Buscar atividades pendentes
        const { data: assignments } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            status,
            grade,
            assignments (
              id,
              title,
              due_date,
              assignment_type
            )
          `)
          .eq('student_id', child.id);

        const pendingAssignments = assignments?.filter(a => a.status === 'pending').length || 0;

        return {
          ...child,
          classroom: classroomStudent?.classrooms || null,
          averageGrade: averageGrade ? Math.round(averageGrade * 10) / 10 : null,
          attendancePercentage: attendancePercentage ? Math.round(attendancePercentage) : null,
          totalGrades: validGrades.length,
          totalAttendance,
          pendingAssignments,
        };
      })
    );

    // 4. Buscar avisos recentes (da escola e dos professores dos filhos)
    const classroomIds = childrenWithDetails
      .map(c => c.classroom?.id)
      .filter(id => id !== null && id !== undefined);

    let recentAnnouncements = [];
    if (classroomIds.length > 0) {
      const { data: announcements } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          priority,
          publish_date,
          expires_at,
          classroom_id,
          classrooms (
            name,
            grade
          )
        `)
        .in('classroom_id', classroomIds)
        .eq('is_published', true)
        .gte('expires_at', new Date().toISOString())
        .order('publish_date', { ascending: false })
        .limit(5);

      recentAnnouncements = announcements || [];
    }

    // 5. Buscar próximos eventos
    let upcomingEvents = [];
    if (classroomIds.length > 0) {
      const { data: events } = await supabase
        .from('calendar_events')
        .select(`
          id,
          title,
          event_type,
          start_date,
          end_date,
          location,
          classroom_id,
          classrooms (
            name,
            grade
          )
        `)
        .in('classroom_id', classroomIds)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      upcomingEvents = events || [];
    }

    // 6. Calcular estatísticas gerais
    const totalChildren = childrenWithDetails.length;
    const overallAverage = childrenWithDetails.reduce((sum, c) => sum + (c.averageGrade || 0), 0) / totalChildren || 0;
    const overallAttendance = childrenWithDetails.reduce((sum, c) => sum + (c.attendancePercentage || 0), 0) / totalChildren || 0;
    const totalPendingAssignments = childrenWithDetails.reduce((sum, c) => sum + c.pendingAssignments, 0);

    return {
      parent: parents,
      children: childrenWithDetails,
      stats: {
        totalChildren,
        overallAverage: Math.round(overallAverage * 10) / 10,
        overallAttendance: Math.round(overallAttendance),
        totalPendingAssignments,
      },
      recentAnnouncements,
      upcomingEvents,
      error: null,
    };
  } catch (error) {
    logger.error('Erro ao buscar dashboard do pai/mãe:', error);
    return { error: error.message };
  }
};

/**
 * Busca notas detalhadas de um filho específico
 */
export const getChildGrades = async (studentId) => {
  try {
    const { data: grades, error } = await supabase
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
          id,
          users (
            name
          )
        )
      `)
      .eq('student_id', studentId)
      .order('evaluation_date', { ascending: false });

    if (error) throw error;

    return { grades: grades || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar notas do filho:', error);
    return { grades: [], error: error.message };
  }
};

/**
 * Busca frequência detalhada de um filho específico
 */
export const getChildAttendance = async (studentId, startDate = null, endDate = null) => {
  try {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        classrooms (
          name,
          grade
        ),
        teachers (
          users (
            name
          )
        )
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: attendance, error } = await query;

    if (error) throw error;

    return { attendance: attendance || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar frequência do filho:', error);
    return { attendance: [], error: error.message };
  }
};

/**
 * Busca atividades de um filho específico
 */
export const getChildAssignments = async (studentId) => {
  try {
    const { data: submissions, error } = await supabase
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
          classrooms (
            name,
            grade
          ),
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
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return { assignments: submissions || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar atividades do filho:', error);
    return { assignments: [], error: error.message };
  }
};

/**
 * Busca avisos para os filhos
 */
export const getAnnouncementsForChildren = async (classroomIds) => {
  try {
    if (!classroomIds || classroomIds.length === 0) {
      return { announcements: [], error: null };
    }

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`
        *,
        classrooms (
          name,
          grade
        ),
        teachers (
          users (
            name
          )
        )
      `)
      .in('classroom_id', classroomIds)
      .eq('is_published', true)
      .gte('expires_at', new Date().toISOString())
      .order('publish_date', { ascending: false });

    if (error) throw error;

    return { announcements: announcements || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar avisos:', error);
    return { announcements: [], error: error.message };
  }
};

/**
 * Busca eventos do calendário para os filhos
 */
export const getEventsForChildren = async (classroomIds) => {
  try {
    if (!classroomIds || classroomIds.length === 0) {
      return { events: [], error: null };
    }

    const { data: events, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        classrooms (
          name,
          grade
        ),
        teachers (
          users (
            name
          )
        )
      `)
      .in('classroom_id', classroomIds)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;

    return { events: events || [], error: null };
  } catch (error) {
    logger.error('Erro ao buscar eventos:', error);
    return { events: [], error: error.message };
  }
};
