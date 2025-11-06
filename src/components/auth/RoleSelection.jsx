import React, { useState } from 'react';
import { GraduationCap, UserCog, Users, Award, Loader2 } from 'lucide-react';

export default function RoleSelection({ onRoleSelected, userEmail, userName }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'student',
      name: 'Estudante',
      description: 'Aluno que vai estudar e fazer quizzes',
      icon: GraduationCap,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: 'parent',
      name: 'Pai/Mãe',
      description: 'Acompanhar o desempenho dos filhos',
      icon: Users,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
  ];

  const handleSelectRole = async (roleId) => {
    if (loading) return;
    
    setSelectedRole(roleId);
    setError('');
    setLoading(true);

    try {
      await onRoleSelected(roleId);
    } catch (err) {
      setError(err.message || 'Erro ao definir perfil');
      setLoading(false);
      setSelectedRole('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">EduQuest Kids</h1>
          <p className="text-gray-600 mb-1">
            Bem-vindo, <span className="font-semibold text-gray-800">{userName || userEmail?.split('@')[0] || 'Usuário'}</span>!
          </p>
          <p className="text-gray-500 text-sm">Selecione seu perfil para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            const isLoading = loading && isSelected;

            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                disabled={loading}
                className={`
                  relative p-6 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? `border-purple-500 bg-purple-50 ${role.color} text-white` 
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex flex-col items-center justify-center gap-3
                  min-h-[160px]
                `}
                aria-label={`Selecionar perfil ${role.name}`}
              >
                {isLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-white/20' : `${role.color} text-white`}
                    `}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {role.name}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {loading && selectedRole && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Configurando seu perfil...</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            👨‍🏫 É professor? Entre em contato com o coordenador da sua escola para receber um convite.
          </p>
        </div>
      </div>
    </div>
  );
}

