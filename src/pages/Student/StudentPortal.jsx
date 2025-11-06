import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudent';
import {
  Home,
  BookOpen,
  User,
  LogOut,
  GraduationCap,
  BarChart3,
  CheckCircle,
  ClipboardList,
  FileText,
  Calendar as CalendarIcon,
  Gamepad2,
} from 'lucide-react';
import ProfileSettings from '../../components/profile/ProfileSettings';
import StudentDashboard from '../../components/student/StudentDashboard';
import MyGrades from '../../components/student/MyGrades';
import MyAttendance from '../../components/student/MyAttendance';
import MyAssignments from '../../components/student/MyAssignments';
import StudyMaterials from '../../components/student/StudyMaterials';
import MyCalendar from '../../components/student/MyCalendar';
import QuizGames from '../../components/student/QuizGames';

function StudentPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { student, classroom, dashboard, loading } = useStudent();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  // Validação: Se não tiver student ID, mostrar erro
  if (!student?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar perfil</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar seus dados. Você pode não estar cadastrado como aluno no sistema.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Meu Portal</h1>
                <p className="text-sm text-gray-600">{user?.name || 'Aluno'}</p>
                {classroom && (
                  <p className="text-xs text-gray-500">
                    {classroom.grade}ª {classroom.name} • {classroom.school_year}
                  </p>
                )}
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
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-5 h-5" />
              Início
            </button>
            
            <button
              onClick={() => setCurrentView('grades')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'grades'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Minhas Notas
            </button>
            
            <button
              onClick={() => setCurrentView('attendance')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'attendance'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Frequência
            </button>

            <button
              onClick={() => setCurrentView('assignments')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'assignments'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              Atividades
            </button>

            <button
              onClick={() => setCurrentView('materials')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'materials'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              Materiais
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'calendar'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              Calendário
            </button>

            <button
              onClick={() => setCurrentView('games')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'games'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              Jogos
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <StudentDashboard
            student={student}
            classroom={classroom}
            stats={dashboard?.stats}
            grades={dashboard?.grades}
            assignments={dashboard?.assignments}
            announcements={dashboard?.announcements}
            upcomingEvents={dashboard?.upcomingEvents}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'grades' && (
          <MyGrades
            studentId={student?.id}
            grades={dashboard?.grades}
          />
        )}

        {currentView === 'attendance' && (
          <MyAttendance
            studentId={student?.id}
            attendance={dashboard?.attendance}
          />
        )}

        {currentView === 'assignments' && (
          <MyAssignments
            studentId={student?.id}
            assignments={dashboard?.assignments}
          />
        )}

        {currentView === 'materials' && (
          <StudyMaterials
            classroomId={classroom?.id}
            materials={dashboard?.materials}
          />
        )}

        {currentView === 'calendar' && (
          <MyCalendar
            studentId={student?.id}
            classroomId={classroom?.id}
            events={dashboard?.upcomingEvents}
          />
        )}

        {currentView === 'games' && (
          <QuizGames
            studentId={student?.id}
            classroomId={classroom?.id}
          />
        )}
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </div>
  );
}

export default StudentPortal;

