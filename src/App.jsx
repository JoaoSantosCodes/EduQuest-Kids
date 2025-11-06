import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Student Portal
import StudentPortal from './pages/Student/StudentPortal';
import EduQuizApp from './pages/Student/EduQuizApp';

// Parent Portal
import ParentPortal from './pages/Parent/ParentPortal';

// Teacher Portal
import TeacherPortal from './pages/Teacher/TeacherPortal';

// Coordinator Portal
import CoordinatorPortal from './pages/Coordinator/CoordinatorPortal';

// Test Page
import TestSupabase from './pages/TestSupabase';

// Auth Callback
import AuthCallback from './pages/AuthCallback';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { isAuth, user, loading } = useAuth();

  useEffect(() => {
    // Se já estiver autenticado, redirecionar para o portal correto
    if (!loading && isAuth && user) {
      const role = user.role;
      if (role === 'student') {
        navigate('/student', { replace: true });
      } else if (role === 'parent') {
        navigate('/parent', { replace: true });
      } else if (role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else if (role === 'coordinator') {
        navigate('/coordinator', { replace: true });
      }
    }
  }, [isAuth, user, loading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">EduQuest Kids</h1>
        <p className="text-gray-600 mb-6">Sistema de estudo gamificado para crianças</p>
        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-all"
          >
            Criar Conta
          </a>
          <a
            href="/test-supabase"
            className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 rounded-lg transition-all text-sm"
          >
            🔧 Testar Conexão Supabase
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/test-supabase" element={<TestSupabase />} />
            
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-quiz"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <EduQuizApp />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentPortal />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherPortal />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/coordinator"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <CoordinatorPortal />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

