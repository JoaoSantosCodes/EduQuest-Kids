import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Loader2, Mail, MailOpen, Users } from 'lucide-react';
import { getMessages, sendMessage, markMessageAsRead, markAllMessagesAsRead, getConversations } from '../../services/messagesService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function TeacherMessagesView() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { conversations: data, error } = await getConversations(user.id);

      if (error) throw new Error(error);

      setConversations(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!user?.id || !selectedConversation) return;

    try {
      const { messages: data, error } = await getMessages(user.id, {
        from_user_id: selectedConversation.user_id,
        to_user_id: user.id,
        limit: 100,
      });

      if (error) throw new Error(error);

      // Combinar mensagens enviadas e recebidas
      const allMessages = [
        ...(data || []),
      ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setMessages(allMessages);

      // Marcar mensagens como lidas
      const unreadMessages = allMessages.filter(
        (m) => !m.is_read && m.to_user_id === user.id
      );

      for (const msg of unreadMessages) {
        await markMessageAsRead(msg.id, user.id);
      }

      // Recarregar conversas para atualizar contador
      await loadConversations();
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const { message, error } = await sendMessage(
        user.id,
        selectedConversation.user_id,
        newMessage.trim()
      );

      if (error) throw new Error(error);

      toast.success('Mensagem enviada com sucesso!');
      setNewMessage('');
      await loadMessages();
      await loadConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(error.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { success, error } = await markAllMessagesAsRead(user.id);

      if (error) throw new Error(error);

      toast.success('Todas as mensagens foram marcadas como lidas');
      await loadConversations();
      await loadMessages();
    } catch (error) {
      console.error('Erro ao marcar mensagens:', error);
      toast.error('Erro ao marcar mensagens');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.user?.name?.toLowerCase().includes(search) ||
      conv.last_message?.message?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Mensagens</h2>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
          >
            Marcar Todas como Lidas
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-gray-800 mb-4">Conversas</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedConversation?.user_id === conv.user_id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conv.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-800 truncate">
                          {conv.user?.name || 'Usuário'}
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {conv.last_message?.message || 'Sem mensagens'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {conv.last_message?.created_at
                          ? new Date(conv.last_message.created_at).toLocaleDateString('pt-BR')
                          : ''}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedConversation.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {selectedConversation.user?.name || 'Usuário'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedConversation.user?.role === 'parent' ? 'Pai/Mãe' : 'Usuário'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.from_user_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            isSent
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-sm mb-1">
                            {msg.from_user?.name || 'Usuário'}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                          <div
                            className={`text-xs mt-2 ${
                              isSent ? 'text-purple-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleString('pt-BR')}
                            {msg.is_read && isSent && (
                              <span className="ml-2">
                                <MailOpen className="w-3 h-3 inline" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Pressione Ctrl+Enter para enviar
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para ver as mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

