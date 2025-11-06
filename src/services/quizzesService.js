import { supabase } from '../config/supabase';

// Listar quizzes disponíveis para aluno
export const getAvailableQuizzes = async (studentGrade) => {
  try {
    const now = new Date().toISOString();

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
      .eq('is_active', true)
      .eq('status', 'active')
      .eq('grade_level', studentGrade)
      .lte('available_from', now)
      .gte('available_until', now)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { quizzes: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    return { quizzes: [], error: error.message };
  }
};

// Buscar quiz por ID com questões
export const getQuizById = async (quizId) => {
  try {
    // Buscar quiz
    const { data: quiz, error: quizError } = await supabase
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
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;

    // Buscar questões do quiz
    const { data: quizQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
        order_number,
        points,
        questions (
          id,
          question_text,
          options,
          correct_answer,
          explanation,
          difficulty,
          points
        )
      `)
      .eq('quiz_id', quizId)
      .order('order_number');

    if (questionsError) throw questionsError;

    // Organizar questões
    const questions = quizQuestions.map((qq) => ({
      ...qq.questions,
      order: qq.order_number,
      points: qq.points || qq.questions.points,
    }));

    // Embaralhar se necessário
    if (quiz.shuffle_questions) {
      questions.sort(() => Math.random() - 0.5);
    }

    return {
      quiz: {
        ...quiz,
        questions,
        total_questions: questions.length,
      },
      error: null,
    };
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    return { quiz: null, error: error.message };
  }
};

// Criar tentativa de quiz
export const createQuizAttempt = async (quizId, studentId, totalQuestions, totalPoints) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        total_questions: totalQuestions,
        total_points: totalPoints,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;

    return { attempt: data, error: null };
  } catch (error) {
    console.error('Erro ao criar tentativa:', error);
    return { attempt: null, error: error.message };
  }
};

// Submeter respostas do quiz
export const submitQuizAttempt = async (attemptId, answers, score, correctAnswers, timeSpent) => {
  try {
    const percentage = ((score / answers.length) * 100).toFixed(2);

    const { data, error } = await supabase
      .from('quiz_attempts')
      .update({
        score,
        correct_answers: correctAnswers,
        total_questions: answers.length,
        percentage: parseFloat(percentage),
        answers: answers,
        time_spent_seconds: timeSpent,
        completed_at: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;

    // Atualizar pontos do aluno
    const { data: studentData } = await supabase
      .from('quiz_attempts')
      .select('student_id')
      .eq('id', attemptId)
      .single();

    if (studentData) {
      // Buscar pontos atuais e atualizar
      const { data: currentStudent } = await supabase
        .from('students')
        .select('total_points')
        .eq('id', studentData.student_id)
        .single();

      if (currentStudent) {
        await supabase
          .from('students')
          .update({
            total_points: (currentStudent.total_points || 0) + score,
          })
          .eq('id', studentData.student_id);
      }
    }

    return { attempt: data, error: null };
  } catch (error) {
    console.error('Erro ao submeter quiz:', error);
    return { attempt: null, error: error.message };
  }
};

// Buscar histórico de tentativas do aluno
export const getStudentQuizHistory = async (studentId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          id,
          title,
          type,
          subjects (
            name,
            icon,
            color
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { history: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return { history: [], error: error.message };
  }
};

