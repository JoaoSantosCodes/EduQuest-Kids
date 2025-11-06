import { supabase } from '../config/supabase';

// Buscar ranking global
export const getGlobalRanking = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        total_points,
        level,
        streak_days,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Adicionar posição no ranking
    const ranking = (data || []).map((student, index) => ({
      ...student,
      position: index + 1,
      name: student.users?.name || 'Anônimo',
      avatar_url: student.users?.avatar_url,
    }));

    return { ranking, error: null };
  } catch (error) {
    console.error('Erro ao buscar ranking global:', error);
    return { ranking: [], error: error.message };
  }
};

// Buscar ranking por matéria
export const getSubjectRanking = async (subjectId, limit = 50) => {
  try {
    // Buscar tentativas de quiz da matéria
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(`
        student_id,
        percentage,
        score,
        quizzes!inner (
          subject_id
        )
      `)
      .eq('quizzes.subject_id', subjectId)
      .eq('status', 'completed');

    if (attemptsError) throw attemptsError;

    // Agrupar por aluno e calcular média
    const studentStats = {};
    attempts?.forEach((attempt) => {
      const studentId = attempt.student_id;
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student_id: studentId,
          total_score: 0,
          total_quizzes: 0,
          avg_percentage: 0,
        };
      }
      studentStats[studentId].total_score += attempt.score || 0;
      studentStats[studentId].total_quizzes += 1;
    });

    // Calcular média e ordenar
    const rankingData = Object.values(studentStats).map((stat) => ({
      ...stat,
      avg_percentage: stat.total_quizzes > 0 ? stat.total_score / stat.total_quizzes : 0,
    }))
    .sort((a, b) => b.avg_percentage - a.avg_percentage)
    .slice(0, limit);

    // Buscar dados dos alunos
    const studentIds = rankingData.map((s) => s.student_id);
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        users (
          id,
          name,
          avatar_url
        )
      `)
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Combinar dados
    const ranking = rankingData.map((stat, index) => {
      const student = students?.find((s) => s.id === stat.student_id);
      return {
        position: index + 1,
        student_id: stat.student_id,
        name: student?.users?.name || 'Anônimo',
        avatar_url: student?.users?.avatar_url,
        avg_percentage: Math.round(stat.avg_percentage),
        total_quizzes: stat.total_quizzes,
        total_score: stat.total_score,
      };
    });

    return { ranking, error: null };
  } catch (error) {
    console.error('Erro ao buscar ranking por matéria:', error);
    return { ranking: [], error: error.message };
  }
};

// Buscar posição do aluno no ranking
export const getStudentRankingPosition = async (studentId) => {
  try {
    // Buscar ranking global
    const { ranking } = await getGlobalRanking(1000);
    
    // Encontrar posição do aluno
    const position = ranking.findIndex((s) => s.id === studentId) + 1;
    
    return { position: position > 0 ? position : null, error: null };
  } catch (error) {
    console.error('Erro ao buscar posição do aluno:', error);
    return { position: null, error: error.message };
  }
};

