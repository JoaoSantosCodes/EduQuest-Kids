import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/authService';
import { Mail, Lock, User, Loader2, GraduationCap } from 'lucide-react';
import logger from '../../utils/logger';
import { handleError } from '../../utils/errorHandler';
import { sanitizeInput } from '../../utils/sanitize';

export default function Register() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    grade: '',
    school: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.role === 'student' && !formData.grade) {
      setError('Por favor, selecione a série');
      return;
    }

    setLoading(true);

    try {
      // Sanitizar inputs
      const sanitizedName = sanitizeInput(formData.name);
      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedSchool = formData.school ? sanitizeInput(formData.school) : '';

      logger.debug('Iniciando registro...', { 
        email: sanitizedEmail, 
        role: formData.role 
      });

      const userData = {
        name: sanitizedName,
        email: sanitizedEmail.toLowerCase().trim(),
        password: formData.password, // Senha não sanitiza (hash será feito no servidor)
        role: formData.role,
        ...(formData.role === 'student' && { 
          grade: parseInt(formData.grade), 
          school: sanitizedSchool 
        }),
        ...(formData.role === 'teacher' && { school: sanitizedSchool }),
        ...(formData.role === 'coordinator' && { school: sanitizedSchool }),
      };

      const response = await register(userData);
      
      // Se usar Supabase, a resposta pode ter formato diferente
      const user = response.user || response;
      
      logger.info('Registro realizado com sucesso:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      setAuth(user);

      // Redirecionar baseado no role
      const roleRoutes = {
        student: '/student',
        parent: '/parent',
        teacher: '/teacher',
        coordinator: '/coordinator',
      };

      const route = roleRoutes[user.role] || '/';
      logger.debug('Redirecionando para:', route);
      navigate(route);
    } catch (err) {
      handleError(err, 'Register', {
        showToast: false, // Já exibimos erro no estado
        customMessage: 'Erro ao criar conta. Tente novamente.',
      });

      let errorMessage = err.message || 'Erro ao criar conta. Tente novamente.';
      
      // Mensagem mais clara se não conseguir conectar
      if (err.message?.includes('Failed to fetch') || err.message?.includes('CONNECTION_REFUSED')) {
        errorMessage = 'Não foi possível conectar ao servidor. Por favor, configure o Supabase ou inicie o backend Node.js.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">EduQuest Kids</h1>
          <p className="text-gray-600">Crie sua conta</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'student', label: 'Aluno', icon: '🎓' },
                { value: 'parent', label: 'Pai/Mãe', icon: '👪' },
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              👨‍🏫 Professor? Entre em contato com o coordenador da sua escola.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: sanitizeInput(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition-all"
                placeholder="Seu nome"
                aria-label="Nome completo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: sanitizeInput(e.target.value.toLowerCase().trim()) })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition-all"
                placeholder="seu@email.com"
                aria-label="Email"
              />
            </div>
          </div>

          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Série
              </label>
              <select
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition-all"
              >
                <option value="">Selecione a série</option>
                <option value="6">6ª série</option>
                <option value="7">7ª série</option>
                <option value="8">8ª série</option>
                <option value="9">9ª série</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escola (opcional)
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: sanitizeInput(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition-all"
              placeholder="Nome da escola"
              aria-label="Nome da escola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition-all"
                placeholder="Confirme sua senha"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

