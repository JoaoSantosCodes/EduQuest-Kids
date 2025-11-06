import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../../hooks/useTeacher';
import {
  Home,
  BookOpen,
  Users,
  User,
  LogOut,
  GraduationCap,
  Calendar,
  Clock,
  School,
  CheckCircle,
  Award,
  Megaphone,
  FileText,
  ClipboardList,
  Calendar as CalendarIconNav,
} from 'lucide-react';
import ProfileSettings from '../../components/profile/ProfileSettings';
import MyClassrooms from '../../components/teacher/MyClassrooms';
import ClassroomDetails from '../../components/teacher/ClassroomDetails';
import MyStudents from '../../components/teacher/MyStudents';
import AttendanceManager from '../../components/teacher/AttendanceManager';
import GradesManager from '../../components/teacher/GradesManager';
import AnnouncementsManager from '../../components/teacher/AnnouncementsManager';
import MaterialsManager from '../../components/teacher/MaterialsManager';
import AssignmentsManager from '../../components/teacher/AssignmentsManager';
import CalendarView from '../../components/teacher/CalendarView';

function TeacherPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { teacher, classrooms, students, subjects, loading } = useTeacher();
  
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'classrooms', 'students', 'attendance', 'grades', 'announcements', 'materials', 'assignments', 'calendar'
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando dados do professor...</p>
        </div>
      </div>
    );
  }

  // Validação: Se não tiver teacher ID, mostrar erro
  if (!teacher?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar perfil</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar seus dados de professor. Você pode não estar cadastrado como professor no sistema.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Portal do Professor</h1>
                <p className="text-sm text-gray-600">{user?.name || 'Professor'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('classrooms')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'classrooms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Minhas Turmas
            </button>
            
            <button
              onClick={() => setCurrentView('students')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              Alunos
            </button>

            <button
              onClick={() => setCurrentView('attendance')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Frequência
            </button>

            <button
              onClick={() => setCurrentView('grades')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'grades'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Award className="w-5 h-5" />
              Notas
            </button>

            <button
              onClick={() => setCurrentView('announcements')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'announcements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              Avisos
            </button>

            <button
              onClick={() => setCurrentView('materials')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'materials'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              Materiais
            </button>

            <button
              onClick={() => setCurrentView('assignments')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'assignments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              Atividades
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'calendar'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIconNav className="w-5 h-5" />
              Calendário
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Turmas */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Minhas Turmas</p>
                    <p className="text-3xl font-bold text-gray-800">{classrooms?.length || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-full">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Alunos */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total de Alunos</p>
                    <p className="text-3xl font-bold text-gray-800">{students?.length || 0}</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Matérias */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Matérias</p>
                    <p className="text-3xl font-bold text-gray-800">{subjects?.length || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-full">
                    <School className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setCurrentView('attendance')}
                  className="p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-800">Frequência</h4>
                  <p className="text-xs text-gray-600">Lançar chamada</p>
                </button>
                <button
                  onClick={() => setCurrentView('grades')}
                  className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <Award className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-800">Notas</h4>
                  <p className="text-xs text-gray-600">Lançar avaliações</p>
                </button>
                <button
                  onClick={() => setCurrentView('assignments')}
                  className="p-4 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                >
                  <ClipboardList className="w-8 h-8 text-orange-600 mb-2" />
                  <h4 className="font-semibold text-gray-800">Atividades</h4>
                  <p className="text-xs text-gray-600">Criar tarefas</p>
                </button>
                <button
                  onClick={() => setCurrentView('announcements')}
                  className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                >
                  <Megaphone className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-800">Avisos</h4>
                  <p className="text-xs text-gray-600">Comunicar turma</p>
                </button>
              </div>
            </div>

            {/* Minhas Turmas Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Minhas Turmas</h3>
                {classrooms && classrooms.length > 6 && (
                  <button
                    onClick={() => setCurrentView('classrooms')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver todas →
                  </button>
                )}
              </div>
              {classrooms && classrooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.slice(0, 6).map((classroom) => (
                    <div
                      key={classroom.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedClassroom(classroom);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {classroom.grade && (
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-lg shadow-sm">
                            {classroom.grade}ª
                          </span>
                        )}
                        <h4 className="font-bold text-lg text-gray-800">Turma {classroom.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        {classroom.shift === 'morning' ? '🌅 Manhã' : 
                         classroom.shift === 'afternoon' ? '☀️ Tarde' : 
                         classroom.shift === 'evening' ? '🌙 Noite' : '⏰ Integral'}
                        {classroom.school_year && (
                          <>
                            <span className="mx-1">•</span>
                            <Calendar className="w-4 h-4" />
                            {classroom.school_year}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Você ainda não foi atribuído a nenhuma turma.
                  </p>
                  <p className="text-sm text-gray-400">
                    Entre em contato com o coordenador para ser atribuído a uma turma.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'classrooms' && (
          <MyClassrooms
            classrooms={classrooms}
            onSelectClassroom={(classroom) => setSelectedClassroom(classroom)}
          />
        )}

        {currentView === 'students' && (
          <MyStudents students={students} />
        )}

        {currentView === 'attendance' && (
          <AttendanceManager
            classrooms={classrooms}
            teacherId={teacher?.id}
          />
        )}

        {currentView === 'grades' && (
          <GradesManager
            classrooms={classrooms}
            teacherId={teacher?.id}
            subjects={subjects}
          />
        )}

        {currentView === 'announcements' && (
          <AnnouncementsManager
            classrooms={classrooms}
            teacherId={teacher?.id}
          />
        )}

        {currentView === 'materials' && (
          <MaterialsManager
            classrooms={classrooms}
            teacherId={teacher?.id}
            subjects={subjects}
          />
        )}

        {currentView === 'assignments' && (
          <AssignmentsManager
            classrooms={classrooms}
            teacherId={teacher?.id}
            subjects={subjects}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            classrooms={classrooms}
            teacherId={teacher?.id}
          />
        )}
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}

      {/* Classroom Details Modal */}
      {selectedClassroom && (
        <ClassroomDetails
          classroom={selectedClassroom}
          onClose={() => setSelectedClassroom(null)}
        />
      )}
    </div>
  );
}

export default TeacherPortal;
