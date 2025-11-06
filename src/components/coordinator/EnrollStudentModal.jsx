import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { X, GraduationCap, Loader2, UserPlus, Search } from 'lucide-react';

export default function EnrollStudentModal({ onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Buscar turmas
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('*')
        .order('name');

      if (classroomsError) throw classroomsError;

      // Buscar alunos
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          users(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      setClassrooms(classroomsData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClassroom) {
      toast.error('Selecione uma turma');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Selecione pelo menos um aluno');
      return;
    }

    try {
      setLoading(true);

      // Buscar o user_id do coordenador atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar quais alunos já estão matriculados nesta turma
      const { data: existingEnrollments, error: checkError } = await supabase
        .from('classroom_students')
        .select('student_id')
        .eq('classroom_id', selectedClassroom)
        .in('student_id', selectedStudents);

      if (checkError) throw checkError;

      const alreadyEnrolled = existingEnrollments?.map((e) => e.student_id) || [];
      const newEnrollments = selectedStudents.filter((id) => !alreadyEnrolled.includes(id));

      if (newEnrollments.length === 0) {
        toast.warning('Todos os alunos selecionados já estão matriculados nesta turma');
        return;
      }

      // Matricular novos alunos
      const enrollmentsToInsert = newEnrollments.map((studentId) => ({
        classroom_id: selectedClassroom,
        student_id: studentId,
        enrolled_by: user.id,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('classroom_students')
        .insert(enrollmentsToInsert);

      if (insertError) throw insertError;

      const message =
        alreadyEnrolled.length > 0
          ? `${newEnrollments.length} aluno(s) matriculado(s). ${alreadyEnrolled.length} já estava(m) matriculado(s).`
          : `${newEnrollments.length} aluno(s) matriculado(s) com sucesso!`;

      toast.success(message);

      if (onSave) {
        onSave();
      }

      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error('Erro ao matricular alunos:', error);
      toast.error(`Erro ao matricular: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClassroomData = classrooms.find((c) => c.id === selectedClassroom);

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="w-7 h-7" />
                Matricular Aluno
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Adicionar aluno(s) em uma turma
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Selecionar Turma */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Turma *
            </label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
              required
            >
              <option value="">Escolha uma turma...</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} - {classroom.grade}ª série ({classroom.shift === 'morning' ? 'Manhã' : classroom.shift === 'afternoon' ? 'Tarde' : classroom.shift === 'evening' ? 'Noite' : 'Integral'})
                </option>
              ))}
            </select>
            {selectedClassroomData && (
              <p className="text-sm text-gray-600 mt-2">
                Capacidade: {selectedClassroomData.max_students} alunos
              </p>
            )}
          </div>

          {/* Buscar Alunos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Alunos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                placeholder="Buscar por nome ou email..."
              />
            </div>
          </div>

          {/* Lista de Alunos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Alunos * ({selectedStudents.length} selecionado{selectedStudents.length !== 1 ? 's' : ''})
            </label>
            <div className="border-2 border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum aluno encontrado
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleToggleStudent(student.id)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-800">
                          {student.users?.name || 'Nome não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.users?.email || 'Email não informado'}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {student.grade}ª série
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors font-semibold flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              Matricular {selectedStudents.length > 0 && `(${selectedStudents.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

