import { supabase } from '../config/supabase';
import logger from '../utils/logger';

/**
 * Atualizar role do usuário e criar registro correspondente
 */
export const updateUserRole = async (userId, role, additionalData = {}) => {
  try {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    // 1. Atualizar role na tabela users
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (updateError) throw updateError;

    // 2. Criar registro correspondente baseado no role
    let roleRecord = null;

    if (role === 'student') {
      const { data, error } = await supabase
        .from('students')
        .insert({
          user_id: userId,
          grade: additionalData.grade || 7,
          school: additionalData.school || '',
        })
        .select()
        .single();

      if (error && error.code !== '23505') { // Ignorar erro de duplicata (UNIQUE constraint)
        logger.warn('Erro ao criar registro de estudante:', error);
      } else {
        roleRecord = data;
      }
    } else if (role === 'teacher') {
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          user_id: userId,
          school: additionalData.school || '',
        })
        .select()
        .single();

      if (error && error.code !== '23505') {
        logger.warn('Erro ao criar registro de professor:', error);
      } else {
        roleRecord = data;
      }
    } else if (role === 'parent') {
      const { data, error } = await supabase
        .from('parents')
        .insert({
          user_id: userId,
        })
        .select()
        .single();

      if (error && error.code !== '23505') {
        logger.warn('Erro ao criar registro de pai:', error);
      } else {
        roleRecord = data;
      }
    } else if (role === 'coordinator') {
      const { data, error } = await supabase
        .from('coordinators')
        .insert({
          user_id: userId,
          school: additionalData.school || '',
        })
        .select()
        .single();

      if (error && error.code !== '23505') {
        logger.warn('Erro ao criar registro de coordenador:', error);
      } else {
        roleRecord = data;
      }
    }

    // 3. Buscar dados atualizados do usuário
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    return {
      user: updatedUser,
      roleRecord,
      error: null,
    };
  } catch (error) {
    logger.error('Erro ao atualizar role do usuário:', error);
    return {
      user: null,
      roleRecord: null,
      error: error.message || 'Erro ao atualizar perfil',
    };
  }
};

/**
 * Verificar se o usuário precisa selecionar um role
 */
export const needsRoleSelection = async (userId) => {
  try {
    if (!supabase) {
      return false;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      logger.warn('Erro ao verificar role:', error);
      return false;
    }

    // Se não tem role ou role é null/vazio, precisa selecionar
    if (!user || !user.role) {
      return true;
    }

    // Se tem role 'student' e foi criado recentemente (primeiro login com Google),
    // permitir trocar de role
    if (user.role === 'student' && user.created_at) {
      const createdTime = new Date(user.created_at).getTime();
      const now = Date.now();
      const timeDiff = now - createdTime;
      // Se foi criado há menos de 5 minutos, permitir seleção
      return timeDiff < 5 * 60 * 1000;
    }

    return false;
  } catch (error) {
    logger.error('Erro ao verificar necessidade de seleção de role:', error);
    return false;
  }
};

