import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Plus, Mail, Trash2, Loader2, UserCheck, X, Edit } from 'lucide-react';
import EditTeacherProfile from './EditTeacherProfile';

export default function ManageTeachers({ coordinatorData }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '' });
  const [inviting, setInviting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Carregar professores da escola
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Buscar TODOS os professores com todos os campos
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          users(id, email, name, created_at, phone, address, birth_date, gender, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Professores carregados:', data);
      setTeachers(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar professores:', error);
      toast.error('Erro ao carregar professores');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeacher = async (e) => {
    e.preventDefault();
    
    if (!inviteData.name || !inviteData.email) {
      toast.error('Preencha todos os campos');
      return;
    }

    setInviting(true);

    try {
      // 1. Criar usuário no Supabase Auth usando a API de registro normal
      // Como não temos acesso ao admin.createUser no client, vamos criar via registro
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: Math.random().toString(36).slice(-12), // Senha temporária
        options: {
          data: {
            name: inviteData.name,
            role: 'teacher',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) {
        if (authError.message?.includes('already registered')) {
          toast.error('Este email já está cadastrado no sistema');
        } else {
          throw authError;
        }
        return;
      }

      // 2. Criar registro na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: inviteData.email,
          name: inviteData.name,
          role: 'teacher',
        });

      if (userError && userError.code !== '23505') {
        console.warn('Erro ao criar usuário:', userError);
      }

      // 3. Criar registro na tabela teachers
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: authData.user.id,
          school: coordinatorData?.school || '',
        });

      if (teacherError) {
        console.warn('Erro ao criar professor:', teacherError);
      }

      toast.success(
        `Professor convidado! Um email de confirmação foi enviado para ${inviteData.email}`,
        { duration: 5000 }
      );

      setInviteData({ name: '', email: '' });
      setShowInviteForm(false);
      loadTeachers();
    } catch (error) {
      console.error('Erro ao convidar professor:', error);
      toast.error(error.message || 'Erro ao convidar professor');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveTeacher = async (teacherId, userName) => {
    if (!confirm(`Tem certeza que deseja remover o professor ${userName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      toast.success('Professor removido com sucesso');
      loadTeachers();
    } catch (error) {
      console.error('Erro ao remover professor:', error);
      toast.error('Erro ao remover professor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Professores</h2>
          <p className="text-gray-600 text-sm mt-1">
            {teachers.length} {teachers.length === 1 ? 'professor' : 'professores'} cadastrado(s)
          </p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Convidar Professor
        </button>
      </div>

      {/* Formulário de Convite */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Convidar Professor</h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Professor
                </label>
                <input
                  type="text"
                  required
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="email@escola.com"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  📧 Um email de confirmação será enviado para o professor com instruções de acesso.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  disabled={inviting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Convidando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar Convite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Professores */}
      {teachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum professor cadastrado
          </h3>
          <p className="text-gray-500 mb-4">
            Comece convidando professores para sua escola
          </p>
          <button
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Convidar Primeiro Professor
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{teacher.users?.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {teacher.users?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Cadastrado em {new Date(teacher.users?.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTeacher(teacher)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar perfil completo"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveTeacher(teacher.id, teacher.users?.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remover professor"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Teacher Profile Modal */}
      {editingTeacher && (
        <EditTeacherProfile
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onSave={() => {
            setEditingTeacher(null);
            loadTeachers();
          }}
        />
      )}
    </div>
  );
}

