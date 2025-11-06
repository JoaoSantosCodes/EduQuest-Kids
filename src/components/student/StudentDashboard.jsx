import React from 'react';
import {
  BarChart3,
  CheckCircle,
  ClipboardList,
  FileText,
  Megaphone,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  Award,
  Target,
} from 'lucide-react';

function StudentDashboard({ student, classroom, stats, grades, assignments, announcements, upcomingEvents, onNavigate }) {
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

  // Agrupar notas por matéria para mostrar últimas
  const gradesBySubject = grades?.reduce((acc, grade) => {
    const subjectName = grade.subjects?.name || 'Sem matéria';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(grade);
    return acc;
  }, {});

  const recentGrades = Object.entries(gradesBySubject || {}).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Olá, {student?.users?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-gray-600 mt-1">Bem-vindo de volta ao seu portal de estudos</p>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Média Geral */}
        <button
          onClick={() => onNavigate('grades')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Média Geral</p>
              <p className={`text-3xl font-bold ${getGradeColor(stats?.averageGrade || 0)}`}>
                {stats?.averageGrade?.toFixed(1) || '-'}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.totalGrades} avaliações</p>
        </button>

        {/* Frequência */}
        <button
          onClick={() => onNavigate('attendance')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Frequência</p>
              <p className={`text-3xl font-bold ${getAttendanceColor(stats?.attendancePercentage || 0)}`}>
                {stats?.attendancePercentage || 0}%
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.totalAttendance} registros</p>
        </button>

        {/* Atividades Pendentes */}
        <button
          onClick={() => onNavigate('assignments')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600 hover:shadow-xl transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Atividades Pendentes</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.pendingAssignments || 0}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <ClipboardList className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.gradedAssignments} avaliadas</p>
        </button>

        {/* Materiais */}
        <button
          onClick={() => onNavigate('materials')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Materiais</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalMaterials || 0}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">disponíveis</p>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('assignments')}
            className="p-4 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
          >
            <ClipboardList className="w-8 h-8 text-orange-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Entregar Atividades</h4>
            <p className="text-xs text-gray-600">{stats?.pendingAssignments || 0} pendentes</p>
          </button>
          <button
            onClick={() => onNavigate('materials')}
            className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Estudar</h4>
            <p className="text-xs text-gray-600">Materiais didáticos</p>
          </button>
          <button
            onClick={() => onNavigate('games')}
            className="p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
          >
            <Target className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Jogar</h4>
            <p className="text-xs text-gray-600">Quizzes educativos</p>
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Agenda</h4>
            <p className="text-xs text-gray-600">Ver calendário</p>
          </button>
        </div>
      </div>

      {/* Notas Recentes */}
      {recentGrades.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Notas Recentes</h3>
            <button
              onClick={() => onNavigate('grades')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {recentGrades.map(([subject, subjectGrades]) => {
              const lastGrade = subjectGrades[0];
              const percentage = (lastGrade.grade / lastGrade.max_grade) * 10;
              return (
                <div
                  key={subject}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{subject}</h4>
                      <p className="text-sm text-gray-600">{lastGrade.evaluation_name || 'Avaliação'}</p>
                      <p className="text-xs text-gray-500">{new Date(lastGrade.evaluation_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                        {lastGrade.grade}
                      </p>
                      <p className="text-sm text-gray-600">de {lastGrade.max_grade}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Avisos */}
      {announcements && announcements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Avisos Importantes</h3>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border-2 ${getPriorityColor(announcement.priority)}`}
              >
                <h4 className="font-bold mb-1">{announcement.title}</h4>
                <p className="text-sm mb-2 line-clamp-2">{announcement.content}</p>
                <div className="flex items-center gap-3 text-xs">
                  {announcement.teachers?.users?.name && (
                    <span>Prof. {announcement.teachers.users.name}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(announcement.publish_date).toLocaleDateString('pt-BR')}
                  </span>
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
            <Calendar className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Próximos Eventos</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{event.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
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

export default StudentDashboard;

