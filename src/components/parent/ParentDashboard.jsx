import React from 'react';
import {
  Users,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Megaphone,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react';

function ParentDashboard({ children, stats, recentAnnouncements, upcomingEvents, onSelectChild }) {
  const getGradeColor = (grade) => {
    if (grade >= 7) return 'text-green-600';
    if (grade >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Filhos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Meus Filhos</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalChildren || 0}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Média Geral */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Média Geral</p>
              <p className={`text-3xl font-bold ${getGradeColor(stats?.overallAverage || 0)}`}>
                {stats?.overallAverage?.toFixed(1) || '-'}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Frequência Geral */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Frequência</p>
              <p className={`text-3xl font-bold ${getAttendanceColor(stats?.overallAttendance || 0)}`}>
                {stats?.overallAttendance || 0}%
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Atividades Pendentes */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Atividades Pendentes</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalPendingAssignments || 0}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <ClipboardList className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Meus Filhos Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Meus Filhos</h3>
        </div>
        {children && children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectChild(child)}
              >
                <div className="flex items-center gap-3 mb-3">
                  {child.users?.avatar_url ? (
                    <img
                      src={child.users.avatar_url}
                      alt={child.users?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                      {child.users?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{child.users?.name}</h4>
                    {child.classroom && (
                      <p className="text-sm text-gray-600">
                        {child.classroom.grade}ª {child.classroom.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Média:</span>
                    <span className={`font-bold ${getGradeColor(child.averageGrade || 0)}`}>
                      {child.averageGrade?.toFixed(1) || 'Sem notas'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Frequência:</span>
                    <span className={`font-bold ${getAttendanceColor(child.attendancePercentage || 0)}`}>
                      {child.attendancePercentage || 0}%
                    </span>
                  </div>
                  {child.pendingAssignments > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <AlertCircle className="w-4 h-4" />
                      <span>{child.pendingAssignments} atividade(s) pendente(s)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Nenhum filho vinculado.
            </p>
            <p className="text-sm text-gray-400">
              Entre em contato com a coordenação para vincular seus filhos.
            </p>
          </div>
        )}
      </div>

      {/* Avisos Recentes */}
      {recentAnnouncements && recentAnnouncements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Avisos Recentes</h3>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.slice(0, 5).map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border-2 ${getPriorityColor(announcement.priority)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{announcement.title}</h4>
                    <p className="text-sm mb-2 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-3 text-xs">
                      {announcement.classrooms && (
                        <span className="px-2 py-1 bg-white rounded">
                          {announcement.classrooms.grade}ª {announcement.classrooms.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(announcement.publish_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximos Eventos */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Próximos Eventos</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.location && (
                        <span>📍 {event.location}</span>
                      )}
                      {event.classrooms && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {event.classrooms.grade}ª {event.classrooms.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;

