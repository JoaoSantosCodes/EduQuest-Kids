import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

function ParentMessages({ parentId, children }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [message, setMessage] = useState('');

  // TODO: Implementar sistema de mensagens real com Supabase
  // Por enquanto, apenas UI

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mensagens</h2>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-yellow-600" />
          <h3 className="font-bold text-yellow-800">Sistema de Mensagens em Desenvolvimento</h3>
        </div>
        <p className="text-yellow-700">
          O sistema de mensagens diretas com professores está em desenvolvimento e será disponibilizado em breve.
          Por enquanto, utilize os canais de comunicação tradicionais da escola.
        </p>
      </div>

      {/* Placeholder UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teachers List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Professores</h3>
          <div className="space-y-2">
            {children?.map((child) => (
              <div key={child.id} className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{child.users?.name}</p>
                <div className="space-y-1">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Professor da Turma</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <p>Selecione um professor para iniciar uma conversa</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  disabled
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentMessages;

