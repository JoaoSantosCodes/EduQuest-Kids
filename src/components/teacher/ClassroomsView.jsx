import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTeacher } from '../../hooks/useTeacher';
import { useSubjects } from '../../hooks/useSubjects';
import {
  getTeacherClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getClassroomStudents,
  addStudentToClassroom,
  removeStudentFromClassroom,
  getAvailableStudents,
} from '../../services/classroomsService';
import { toast } from 'sonner';
import { Users, Plus, Edit, Trash2, X, Search, UserPlus, GraduationCap, BookOpen } from 'lucide-react';

export default function ClassroomsView() {
  const { user } = useAuth();
  const { teacher } = useTeacher();
  const { subjects } = useSubjects();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomStudents, setClassroomStudents] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searching, setSearching] = useState(false);

  const [newClassroom, setNewClassroom] = useState({
    name: '',
    grade_level: 7,
    school: '',
    subject_id: '',
    description: '',
  });

  useEffect(() => {
    if (teacher?.id) {
      loadClassrooms();
    }
  }, [teacher]);

  useEffect(() => {
    if (selectedClassroom) {
      loadClassroomStudents();
    }
  }, [selectedClassroom]);

  useEffect(() => {
    if (searchTerm.length >= 2 && selectedClassroom) {
      const timeoutId = setTimeout(() => {
        searchStudents();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailableStudents([]);
    }
  }, [searchTerm, selectedClassroom]);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const { classrooms: data, error } = await getTeacherClassrooms(teacher.id);

      if (error) throw new Error(error);
      setClassrooms(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const loadClassroomStudents = async () => {
    if (!selectedClassroom) return;

    try {
      const { students, error } = await getClassroomStudents(selectedClassroom.id);

      if (error) throw new Error(error);
      setClassroomStudents(students || []);
    } catch (error) {
      console.error('Erro ao carregar alunos da turma:', error);
      toast.error('Erro ao carregar alunos');
    }
  };

  const searchStudents = async () => {
    if (!selectedClassroom) return;

    try {
      setSearching(true);
      const { students, error } = await getAvailableStudents(
        teacher.id,
        selectedClassroom.grade_level
      );

      if (error) throw new Error(error);

      // Filtrar por termo de busca
      const filtered = students.filter(
        (student) =>
          student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filtrar alunos que já estão na turma
      const enrolledIds = classroomStudents.map((s) => s.id);
      const available = filtered.filter((student) => !enrolledIds.includes(student.id));

      setAvailableStudents(available);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast.error('Erro ao buscar alunos');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateClassroom = async () => {
    try {
      if (!newClassroom.name) {
        toast.error('Nome da turma é obrigatório');
        return;
      }

      const { classroom, error } = await createClassroom({
        teacher_id: teacher.id,
        ...newClassroom,
      });

      if (error) throw new Error(error);

      toast.success('Turma criada com sucesso!');
      setShowCreateModal(false);
      setNewClassroom({
        name: '',
        grade_level: 7,
        school: '',
        subject_id: '',
        description: '',
      });
      await loadClassrooms();
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error(error.message || 'Erro ao criar turma');
    }
  };

  const handleUpdateClassroom = async () => {
    if (!editingClassroom) return;

    try {
      const { classroom, error } = await updateClassroom(editingClassroom.id, {
        name: editingClassroom.name,
        grade_level: editingClassroom.grade_level,
        school: editingClassroom.school || '',
        subject_id: editingClassroom.subject_id || null,
        description: editingClassroom.description || '',
      });

      if (error) throw new Error(error);

      toast.success('Turma atualizada com sucesso!');
      setEditingClassroom(null);
      await loadClassrooms();
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast.error(error.message || 'Erro ao atualizar turma');
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const { error } = await deleteClassroom(classroomId);

      if (error) throw new Error(error);

      toast.success('Turma excluída com sucesso!');
      await loadClassrooms();
      if (selectedClassroom?.id === classroomId) {
        setSelectedClassroom(null);
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast.error(error.message || 'Erro ao excluir turma');
    }
  };

  const handleAddStudent = async (student) => {
    if (!selectedClassroom) return;

    try {
      const { enrollment, error } = await addStudentToClassroom(selectedClassroom.id, student.id);

      if (error) throw new Error(error);

      toast.success('Aluno adicionado à turma!');
      setSearchTerm('');
      setAvailableStudents([]);
      setShowAddStudentModal(false);
      await loadClassroomStudents();
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      console.error('Detalhes do erro:', error);
      toast.error(error.message || 'Erro ao adicionar aluno');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedClassroom) return;

    if (!confirm('Tem certeza que deseja remover este aluno da turma?')) return;

    try {
      const { error } = await removeStudentFromClassroom(selectedClassroom.id, studentId);

      if (error) throw new Error(error);

      toast.success('Aluno removido da turma!');
      await loadClassroomStudents();
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      toast.error(error.message || 'Erro ao remover aluno');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Gerenciar Turmas
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Turma
          </button>
        </div>

        {classrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedClassroom?.id === classroom.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setSelectedClassroom(classroom)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{classroom.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClassroom(classroom);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClassroom(classroom.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{classroom.grade_level}ª série</p>
                {classroom.subjects && (
                  <p className="text-sm text-gray-500">{classroom.subjects.name}</p>
                )}
                {classroom.school && (
                  <p className="text-xs text-gray-400">{classroom.school}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma turma criada ainda.</p>
            <p className="text-sm mt-2">Clique em "Nova Turma" para começar.</p>
          </div>
        )}
      </div>

      {/* Detalhes da turma selecionada */}
      {selectedClassroom && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{selectedClassroom.name}</h3>
            <button
              onClick={() => setSelectedClassroom(null)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Aluno
            </button>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Alunos da Turma</h4>
            {classroomStudents.length > 0 ? (
              <div className="space-y-2">
                {classroomStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{student.users?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{student.users?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{student.grade}ª série</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum aluno na turma ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de criar turma */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nova Turma</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Ex: 7º Ano A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <select
                  value={newClassroom.grade_level}
                  onChange={(e) => setNewClassroom({ ...newClassroom, grade_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}ª série
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria (opcional)</label>
                <select
                  value={newClassroom.subject_id}
                  onChange={(e) => setNewClassroom({ ...newClassroom, subject_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="">Nenhuma</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola (opcional)</label>
                <input
                  type="text"
                  value={newClassroom.school}
                  onChange={(e) => setNewClassroom({ ...newClassroom, school: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Nome da escola"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea
                  value={newClassroom.description}
                  onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  rows="3"
                  placeholder="Descrição da turma"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateClassroom}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar turma */}
      {editingClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Turma</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={editingClassroom.name}
                  onChange={(e) => setEditingClassroom({ ...editingClassroom, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <select
                  value={editingClassroom.grade_level}
                  onChange={(e) => setEditingClassroom({ ...editingClassroom, grade_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}ª série
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria (opcional)</label>
                <select
                  value={editingClassroom.subject_id || ''}
                  onChange={(e) => setEditingClassroom({ ...editingClassroom, subject_id: e.target.value || null })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="">Nenhuma</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingClassroom(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateClassroom}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de adicionar aluno */}
      {showAddStudentModal && selectedClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Aluno à Turma</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>

              {searching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}

              {availableStudents.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{student.users?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{student.users?.email || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{student.grade}ª série</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && !searching && availableStudents.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhum aluno encontrado.
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSearchTerm('');
                  setAvailableStudents([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

