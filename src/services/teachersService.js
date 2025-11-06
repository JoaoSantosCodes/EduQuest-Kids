import { supabase } from '../config/supabase';
import logger from '../utils/logger';

// Buscar dados do professor
export const getTeacherById = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('id', teacherId)
      .single();

    if (error) throw error;

    return { teacher: data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar professor:', error);
    return { teacher: null, error: error.message };
  }
};

// Buscar professor por user_id
export const getTeacherByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { teacher: data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar professor:', error);
    return { teacher: null, error: error.message };
  }
};

// Dashboard do professor - estatísticas
export const getTeacherDashboard = async (teacherId) => {
  try {
    // Buscar turmas do professor
    const { data: classroomTeachers, error: classroomError } = await supabase
      .from('classroom_teachers')
      .select(`
        classroom_id,
        is_primary,
        classrooms (
          id,
          name,
          grade,
          shift,
          school_year,
          max_students
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true);

    if (classroomError) throw classroomError;

    const classrooms = classroomTeachers?.map(ct => ct.classrooms) || [];

    // Buscar alunos das turmas do professor
    const classroomIds = classrooms.map(c => c.id);
    let students = [];
    let subjects = [];

    if (classroomIds.length > 0) {
      const { data: classroomStudents, error: studentsError } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          students (
            id,
            user_id,
            enrollment_number,
            users (
              id,
              name,
              email,
              avatar_url
            )
          )
        `)
        .in('classroom_id', classroomIds);

      if (!studentsError && classroomStudents) {
        // Remove duplicatas
        const uniqueStudents = new Map();
        classroomStudents.forEach(cs => {
          if (cs.students && !uniqueStudents.has(cs.students.id)) {
            uniqueStudents.set(cs.students.id, cs.students);
          }
        });
        students = Array.from(uniqueStudents.values());
      }
    }

    // Buscar matérias do professor
    const { data: teacherSubjects, error: subjectsError } = await supabase
      .from('teacher_subjects')
      .select(`
        subject_id,
        subjects (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('teacher_id', teacherId);

    if (!subjectsError && teacherSubjects) {
      subjects = teacherSubjects.map(ts => ts.subjects).filter(s => s !== null);
    }

    // Estatísticas gerais
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('is_active', true);

    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('is_active', true);

    // Alunos únicos que fizeram quizzes deste professor
    // Buscar IDs dos quizzes do professor
    const quizIds = quizzes?.map(q => q.id) || [];
    
    let activeStudents = 0;
    if (quizIds.length > 0) {
      const { data: studentsData, error: studentsError } = await supabase
        .from('quiz_attempts')
        .select('student_id')
        .in('quiz_id', quizIds)
        .not('student_id', 'is', null);

      if (!studentsError) {
        const uniqueStudents = new Set(studentsData?.map(s => s.student_id) || []);
        activeStudents = uniqueStudents.size;
      }
    }

    // Média da turma
    const quizIdsForAvg = quizzes?.map(q => q.id) || [];
    let avgScore = 0;
    
    if (quizIdsForAvg.length > 0) {
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('percentage')
        .eq('status', 'completed')
        .in('quiz_id', quizIdsForAvg);

      if (!attemptsError && attempts) {
        avgScore = attempts.length
          ? parseFloat((attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length).toFixed(2))
          : 0;
      }
    }


    // Questões mais difíceis
    const { data: difficultQuestions, error: difficultError } = await supabase
      .from('questions')
      .select('id, question_text, difficulty, correct_count, usage_count')
      .eq('teacher_id', teacherId)
      .gt('usage_count', 5)
      .order('correct_count', { ascending: true, nullsFirst: false })
      .limit(5);

    // Alunos que precisam de atenção
    const quizIdsForHelp = quizzes?.map(q => q.id) || [];
    let studentsList = [];
    
    if (quizIdsForHelp.length > 0) {
      const { data: studentsNeedingHelp, error: helpError } = await supabase
        .from('quiz_attempts')
        .select(`
          student_id,
          percentage,
          students (
            id,
            users (
              name
            ),
            grade
          )
        `)
        .in('quiz_id', quizIdsForHelp)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lt('percentage', 70);

      if (!helpError && studentsNeedingHelp) {
        // Agrupar por aluno e calcular média
        const studentStats = {};
        studentsNeedingHelp.forEach((attempt) => {
          const studentId = attempt.student_id;
          if (attempt.students) {
            if (!studentStats[studentId]) {
              studentStats[studentId] = {
                student: attempt.students,
                scores: [],
              };
            }
            studentStats[studentId].scores.push(attempt.percentage);
          }
        });

        studentsList = Object.values(studentStats).map((item) => ({
          id: item.student.id,
          name: item.student.users?.name || 'Aluno',
          grade: item.student.grade,
          avgScore: parseFloat((item.scores.reduce((a, b) => a + b, 0) / item.scores.length).toFixed(2)),
          quizzes: item.scores.length,
        })).sort((a, b) => a.avgScore - b.avgScore).slice(0, 10);
      }
    }

    return {
      classrooms,
      students,
      subjects,
      stats: {
        questionsCreated: questions?.length || 0,
        quizzesCreated: quizzes?.length || 0,
        activeStudents,
        avgClassScore: avgScore,
      },
      difficultQuestions: difficultQuestions || [],
      studentsNeedingHelp: studentsList,
      error: null,
    };
  } catch (error) {
    logger.error('Erro ao buscar dashboard:', error);
    return { stats: null, difficultQuestions: [], studentsNeedingHelp: [], error: error.message };
  }
};

// Buscar alunos do professor
export const getTeacherStudents = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        student_id,
        students!inner (
          id,
          users (
            name
          ),
          grade,
          total_points
        ),
        quizzes!inner (
          teacher_id
        )
      `)
      .eq('quizzes.teacher_id', teacherId)
      .eq('status', 'completed');

    if (error) throw error;

    // Agrupar por aluno
    const studentMap = {};
    data?.forEach((attempt) => {
      const studentId = attempt.student_id;
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: attempt.students,
          attempts: [],
        };
      }
      studentMap[studentId].attempts.push(attempt);
    });

    // Calcular estatísticas por aluno
    const students = Object.values(studentMap).map((item) => {
      const avgScore = item.attempts.length
        ? (item.attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / item.attempts.length).toFixed(2)
        : 0;

      return {
        id: item.student.id,
        name: item.student.users?.name || 'Aluno',
        grade: item.student.grade,
        totalPoints: item.student.total_points || 0,
        quizzesCompleted: item.attempts.length,
        avgScore: parseFloat(avgScore),
      };
    }).sort((a, b) => b.avgScore - a.avgScore);

    return { students, error: null };
  } catch (error) {
    logger.error('Erro ao buscar alunos:', error);
    return { students: [], error: error.message };
  }
};

// Criar quiz
export const createQuiz = async (quizData) => {
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
      .from('quizzes')
      .insert({
        ...quizData,
        teacher_id: teacher.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Adicionar questões ao quiz se fornecido
    if (quizData.question_ids && quizData.question_ids.length > 0) {
      const quizQuestions = quizData.question_ids.map((questionId, index) => ({
        quiz_id: data.id,
        question_id: questionId,
        order_number: index + 1,
      }));

      await supabase.from('quiz_questions').insert(quizQuestions);
    }

    return { quiz: data, error: null };
  } catch (error) {
    logger.error('Erro ao criar quiz:', error);
    return { quiz: null, error: error.message };
  }
};

// Listar quizzes do professor
export const getTeacherQuizzes = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        subjects (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Buscar estatísticas de cada quiz
    const quizzesWithStats = await Promise.all(
      (data || []).map(async (quiz) => {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('id, percentage')
          .eq('quiz_id', quiz.id)
          .eq('status', 'completed');

        const avgScore = attempts?.length
          ? (attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length).toFixed(2)
          : 0;

        return {
          ...quiz,
          attempts: attempts?.length || 0,
          avgScore: parseFloat(avgScore),
        };
      })
    );

    return { quizzes: quizzesWithStats, error: null };
  } catch (error) {
    logger.error('Erro ao buscar quizzes:', error);
    return { quizzes: [], error: error.message };
  }
};

// Importar questões em massa
export const bulkImportQuestions = async (questions) => {
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

    // Preparar questões para inserção
    const questionsToInsert = questions.map((q) => ({
      ...q,
      teacher_id: teacher.id,
      options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
      tags: q.tags || [],
      approved: false, // Questões importadas precisam aprovação
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select('id');

    if (error) throw error;

    return { importedIds: data.map(q => q.id), error: null };
  } catch (error) {
    logger.error('Erro ao importar questões:', error);
    return { importedIds: [], error: error.message };
  }
};

