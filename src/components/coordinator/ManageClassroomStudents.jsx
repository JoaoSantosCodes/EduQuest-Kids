import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Search, 
  X, 
  GraduationCap, 
  Trash2,
  Calendar,
  Mail,
  School,
} from 'lucide-react';

export default function ManageClassroomStudents({ classroom, onClose }) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [classroom.id]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Buscar alunos já matriculados nesta turma
      const { data: enrolled, error: enrolledError } = await supabase
        .from('classroom_students')
        .select(`
          id,
          enrolled_at,
          student_id,
          students (
            id,
            user_id,
            grade,
            school,
            users (
              id,
              name,
              email,
              avatar_url
            )
          )
        `)
        .eq('classroom_id', classroom.id)
        .eq('is_active', true);

      if (enrolledError) throw enrolledError;

      console.log('✅ Alunos matriculados:', enrolled);
      setEnrolledStudents(enrolled || []);

      // Buscar todos os alunos para poder adicionar
      const { data: allStudents, error: allError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          grade,
          school,
          users (
            id,
            name,
            email,
            avatar_url
          )
        `);

      if (allError) throw allError;

      // Filtrar alunos que já estão matriculados
      const enrolledIds = enrolled?.map(e => e.student_id) || [];
      const available = allStudents?.filter(s => !enrolledIds.includes(s.id)) || [];

      console.log('✅ Alunos disponíveis:', available);
      setAvailableStudents(available);

    } catch (error) {
      console.error('❌ Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Selecione pelo menos um aluno');
      return;
    }

    try {
      setEnrolling(true);

      // Obter user_id atual
      const { data: { user } } = await supabase.auth.getUser();

      // Inserir matrículas
      const enrollments = selectedStudents.map(studentId => ({
        classroom_id: classroom.id,
        student_id: studentId,
        enrolled_by: user?.id,
        is_active: true,
      }));

      const { error } = await supabase
        .from('classroom_students')
        .insert(enrollments);

      if (error) throw error;

      toast.success(`${selectedStudents.length} aluno(s) matriculado(s) com sucesso!`);
      
      // Recarregar listas
      setSelectedStudents([]);
      setShowAddModal(false);
      await loadStudents();

    } catch (error) {
      console.error('❌ Erro ao matricular alunos:', error);
      toast.error('Erro ao matricular alunos');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId, studentName) => {
    if (!confirm(`Tem certeza que deseja remover ${studentName} desta turma?`)) {
      return;
    }

    try {
      // Marcar como inativo ao invés de deletar
      const { error } = await supabase
        .from('classroom_students')
        .update({ is_active: false })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast.success('Aluno removido da turma');
      await loadStudents();

    } catch (error) {
      console.error('❌ Erro ao remover aluno:', error);
      toast.error('Erro ao remover aluno');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const filteredAvailable = availableStudents.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.users?.name?.toLowerCase().includes(searchLower) ||
      student.users?.email?.toLowerCase().includes(searchLower) ||
      student.school?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando alunos...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gerenciar Alunos</h2>
              <p className="text-purple-100 text-sm mt-1">
                Turma: {classroom.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Alunos Matriculados
              </h3>
              <p className="text-sm text-gray-500">
                {enrolledStudents.length} aluno(s) nesta turma
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Adicionar Alunos
            </button>
          </div>

          {/* Enrolled Students List */}
          {enrolledStudents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum aluno matriculado
              </h3>
              <p className="text-gray-500">
                Clique em "Adicionar Alunos" para começar
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledStudents.map((enrollment) => {
                const student = enrollment.students;
                const user = student?.users;
                
                return (
                  <div
                    key={enrollment.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {user?.name || 'Sem nome'}
                          </h4>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user?.email}</span>
                          </div>
                          {student?.school && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <School className="w-3 h-3" />
                              <span>{student.school}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Matriculado em{' '}
                              {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(enrollment.id, user?.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover da turma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Students Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Adicionar Alunos</h3>
                    <p className="text-blue-100 text-sm mt-1">
                      Selecione os alunos para matricular
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedStudents([]);
                      setSearchTerm('');
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou escola..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {selectedStudents.length} aluno(s) selecionado(s)
                  </p>
                )}
              </div>

              {/* Available Students List */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredAvailable.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchTerm
                        ? 'Nenhum aluno encontrado'
                        : 'Todos os alunos já estão matriculados'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailable.map((student) => {
                      const user = student.users;
                      const isSelected = selectedStudents.includes(student.id);

                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            {user?.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 truncate">
                                {user?.name || 'Sem nome'}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {user?.email}
                              </p>
                              {student.school && (
                                <p className="text-xs text-gray-500">
                                  {student.school} • {student.grade}ª série
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedStudents([]);
                    setSearchTerm('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnrollStudents}
                  disabled={selectedStudents.length === 0 || enrolling}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Matriculando...' : `Matricular (${selectedStudents.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

