import React from 'react';
import { BookOpen, UserPlus, GraduationCap, Users } from 'lucide-react';

export default function QuickActions({ 
  onCreateClassroom, 
  onInviteTeacher, 
  onEnrollStudent, 
  onLinkParent 
}) {
  const actions = [
    {
      id: 'new-classroom',
      title: 'Nova Turma',
      description: 'Criar uma nova turma',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-500',
      onClick: onCreateClassroom,
    },
    {
      id: 'invite-teacher',
      title: 'Convidar Professor',
      description: 'Adicionar novo professor',
      icon: UserPlus,
      color: 'from-blue-500 to-cyan-500',
      onClick: onInviteTeacher,
    },
    {
      id: 'enroll-student',
      title: 'Matricular Aluno',
      description: 'Adicionar aluno em turma',
      icon: GraduationCap,
      color: 'from-orange-500 to-yellow-500',
      onClick: onEnrollStudent,
    },
    {
      id: 'link-parent',
      title: 'Vincular Pais',
      description: 'Conectar pais aos filhos',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      onClick: onLinkParent,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200 text-left"
            >
              {/* Gradient Icon Background */}
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-gray-900">
                {action.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 group-hover:text-gray-700">
                {action.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

