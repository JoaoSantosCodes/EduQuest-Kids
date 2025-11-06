import { supabase } from '../config/supabase';

// Buscar todas as conquistas disponíveis
export const getAchievements = async () => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('rarity', { ascending: true })
      .order('points_reward', { ascending: false });

    if (error) throw error;

    return { achievements: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    return { achievements: [], error: error.message };
  }
};

// Buscar conquistas de um aluno
export const getStudentAchievements = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('student_achievements')
      .select(`
        *,
        achievements (
          id,
          name,
          description,
          icon,
          category,
          rarity,
          points_reward
        )
      `)
      .eq('student_id', studentId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    return { achievements: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar conquistas do aluno:', error);
    return { achievements: [], error: error.message };
  }
};

// Verificar e desbloquear conquistas para um aluno
export const checkAndUnlockAchievements = async (studentId) => {
  try {
    // Buscar dados do aluno
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Buscar estatísticas do aluno
    const { data: quizAttempts, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('percentage, total_questions, correct_answers')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    if (quizError) {
      console.warn('Erro ao buscar tentativas de quiz:', quizError);
    }

    // Calcular estatísticas
    const totalQuizzes = quizAttempts?.length || 0;
    const perfectQuizzes = quizAttempts?.filter(q => q.percentage === 100).length || 0;

    // Buscar conquistas já desbloqueadas
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('student_achievements')
      .select('achievement_id')
      .eq('student_id', studentId);

    if (unlockedError) {
      console.warn('Erro ao buscar conquistas desbloqueadas:', unlockedError);
    }

    const unlockedIds = (unlockedAchievements || []).map(a => a.achievement_id);

    // Buscar conquistas disponíveis
    const { data: availableAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`);

    if (achievementsError) throw achievementsError;

    const newAchievements = [];

    // Verificar cada conquista
    for (const achievement of availableAchievements || []) {
      let unlocked = false;

      switch (achievement.condition_type) {
        case 'quizzes_completed':
          unlocked = totalQuizzes >= achievement.condition_value;
          break;
        case 'perfect_quiz':
          unlocked = perfectQuizzes >= achievement.condition_value;
          break;
        case 'level_reached':
          unlocked = (student.level || 1) >= achievement.condition_value;
          break;
        case 'streak_days':
          unlocked = (student.streak_days || 0) >= achievement.condition_value;
          break;
        case 'study_hours':
          // condition_value está em segundos
          unlocked = (student.study_time_seconds || 0) >= achievement.condition_value;
          break;
        case 'points_reached':
          unlocked = (student.total_points || 0) >= achievement.condition_value;
          break;
        default:
          console.warn(`Tipo de condição desconhecido: ${achievement.condition_type}`);
      }

      if (unlocked) {
        // Desbloquear conquista
        const { data: newAchievement, error: unlockError } = await supabase
          .from('student_achievements')
          .insert({
            student_id: studentId,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (unlockError) {
          console.error('Erro ao desbloquear conquista:', unlockError);
          continue;
        }

        // Adicionar pontos bônus
        if (achievement.points_reward > 0) {
          const { error: pointsError } = await supabase
            .from('students')
            .update({
              total_points: (student.total_points || 0) + achievement.points_reward,
            })
            .eq('id', studentId);

          if (pointsError) {
            console.error('Erro ao adicionar pontos:', pointsError);
          }
        }

        newAchievements.push({
          ...achievement,
          unlocked_at: newAchievement.unlocked_at,
        });
      }
    }

    return {
      newAchievements,
      totalUnlocked: newAchievements.length,
      error: null,
    };
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    return {
      newAchievements: [],
      totalUnlocked: 0,
      error: error.message,
    };
  }
};

// Criar notificação de nova conquista
export const createAchievementNotification = async (userId, achievement) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'achievement',
        title: 'Nova Conquista Desbloqueada! 🏆',
        message: `Você desbloqueou: ${achievement.name} - ${achievement.description}`,
        metadata: {
          achievement_id: achievement.id,
          icon: achievement.icon,
          rarity: achievement.rarity,
        },
      })
      .select()
      .single();

    if (error) throw error;

    return { notification: data, error: null };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { notification: null, error: error.message };
  }
};

