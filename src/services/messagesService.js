import { supabase } from '../config/supabase';

// Buscar mensagens do usuário
export const getMessages = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey (
          id,
          name,
          email,
          avatar_url,
          role
        ),
        to_user:users!messages_to_user_id_fkey (
          id,
          name,
          email,
          avatar_url,
          role
        )
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.from_user_id) {
      query = query.eq('from_user_id', filters.from_user_id);
    }

    if (filters.to_user_id) {
      query = query.eq('to_user_id', filters.to_user_id);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { messages: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return { messages: [], error: error.message };
  }
};

// Enviar mensagem
export const sendMessage = async (fromUserId, toUserId, message, subject = null) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        subject: subject,
        message: message,
        is_read: false,
      })
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey (
          id,
          name,
          avatar_url
        ),
        to_user:users!messages_to_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Criar notificação para o destinatário
    await supabase
      .from('notifications')
      .insert({
        user_id: toUserId,
        type: 'message',
        title: 'Nova mensagem',
        message: `Você recebeu uma nova mensagem de ${data.from_user?.name || 'alguém'}`,
        link: `/messages`,
        metadata: {
          message_id: data.id,
          from_user_id: fromUserId,
        },
      });

    return { message: data, error: null };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { message: null, error: error.message };
  }
};

// Marcar mensagem como lida
export const markMessageAsRead = async (messageId, userId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('to_user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { message: data, error: null };
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    return { message: null, error: error.message };
  }
};

// Marcar todas as mensagens como lidas
export const markAllMessagesAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('to_user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao marcar todas as mensagens como lidas:', error);
    return { success: false, error: error.message };
  }
};

// Buscar conversas (agrupadas por usuário)
export const getConversations = async (userId) => {
  try {
    // Buscar todas as mensagens
    const { messages, error } = await getMessages(userId);

    if (error) throw error;

    // Agrupar por outro usuário
    const conversations = {};
    messages.forEach((msg) => {
      const otherUserId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;
      const otherUser = msg.from_user_id === userId ? msg.to_user : msg.from_user;

      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user_id: otherUserId,
          user: otherUser,
          last_message: msg,
          unread_count: 0,
          messages: [],
        };
      }

      conversations[otherUserId].messages.push(msg);
      if (!msg.is_read && msg.to_user_id === userId) {
        conversations[otherUserId].unread_count++;
      }

      // Atualizar última mensagem se necessário
      if (new Date(msg.created_at) > new Date(conversations[otherUserId].last_message.created_at)) {
        conversations[otherUserId].last_message = msg;
      }
    });

    // Converter para array e ordenar por última mensagem
    const conversationsArray = Object.values(conversations).sort(
      (a, b) => new Date(b.last_message.created_at) - new Date(a.last_message.created_at)
    );

    return { conversations: conversationsArray, error: null };
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return { conversations: [], error: error.message };
  }
};

// Buscar professores disponíveis para mensagem
export const getAvailableTeachers = async () => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        user_id,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('is_verified', true);

    if (error) throw error;

    const teachers = (data || []).map((teacher) => ({
      id: teacher.id,
      user_id: teacher.user_id,
      name: teacher.users?.name || 'Professor',
      email: teacher.users?.email,
      avatar_url: teacher.users?.avatar_url,
    }));

    return { teachers, error: null };
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    return { teachers: [], error: error.message };
  }
};

