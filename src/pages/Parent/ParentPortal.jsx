import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../../hooks/useParent';
import {
  Home,
  Users,
  User,
  LogOut,
  GraduationCap,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Megaphone,
  Calendar as CalendarIcon,
  MessageSquare,
} from 'lucide-react';
import ProfileSettings from '../../components/profile/ProfileSettings';
import ParentDashboard from '../../components/parent/ParentDashboard';
import MyChildren from '../../components/parent/MyChildren';
import ChildGradesView from '../../components/parent/ChildGradesView';
import ChildAttendanceView from '../../components/parent/ChildAttendanceView';
import ChildActivitiesView from '../../components/parent/ChildActivitiesView';
import SchoolAnnouncements from '../../components/parent/SchoolAnnouncements';
import SchoolCalendar from '../../components/parent/SchoolCalendar';
import ParentMessages from '../../components/parent/ParentMessages';

function ParentPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { parent, children, dashboard, loading } = useParent();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Validação: Se não tiver parent ID, mostrar erro
  if (!parent?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar perfil</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar seus dados. Você pode não estar cadastrado como pai/mãe no sistema.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Portal dos Pais</h1>
                <p className="text-sm text-gray-600">{user?.name || 'Pai/Mãe'}</p>
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
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('children')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'children'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              Meus Filhos
            </button>
            
            <button
              onClick={() => setCurrentView('grades')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'grades'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Notas
            </button>

            <button
              onClick={() => setCurrentView('attendance')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'attendance'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Frequência
            </button>

            <button
              onClick={() => setCurrentView('activities')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'activities'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              Atividades
            </button>

            <button
              onClick={() => setCurrentView('announcements')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'announcements'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              Avisos
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'calendar'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              Calendário
            </button>

            <button
              onClick={() => setCurrentView('messages')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'messages'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Mensagens
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <ParentDashboard
            children={children}
            stats={dashboard?.stats}
            recentAnnouncements={dashboard?.recentAnnouncements}
            upcomingEvents={dashboard?.upcomingEvents}
            onSelectChild={(child) => {
              setSelectedChild(child);
              setCurrentView('children');
            }}
          />
        )}

        {currentView === 'children' && (
          <MyChildren
            children={children}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
          />
        )}

        {currentView === 'grades' && (
          <ChildGradesView
            children={children}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
          />
        )}

        {currentView === 'attendance' && (
          <ChildAttendanceView
            children={children}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
          />
        )}

        {currentView === 'activities' && (
          <ChildActivitiesView
            children={children}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
          />
        )}

        {currentView === 'announcements' && (
          <SchoolAnnouncements
            children={children}
          />
        )}

        {currentView === 'calendar' && (
          <SchoolCalendar
            children={children}
          />
        )}

        {currentView === 'messages' && (
          <ParentMessages
            parentId={parent?.id}
            children={children}
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

export default ParentPortal;
