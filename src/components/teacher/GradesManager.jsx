import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  TrendingUp,
  BarChart3,
  FileText,
} from 'lucide-react';

export default function GradesManager({ classrooms, teacherId, subjects }) {
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);

  const [formData, setFormData] = useState({
    grade_type: 'exam',
    grade_value: '',
    max_grade: '10.00',
    weight: '1.00',
    period: 'Q1',
    evaluation_date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedClassroom) {
      loadStudents();
      if (selectedSubject) {
        loadGrades();
      }
    }
  }, [selectedClassroom, selectedSubject]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          students (
            id,
            enrollment_number,
            users (
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('classroom_id', selectedClassroom.id);

      if (error) throw error;

      setStudents(data?.map(cs => cs.students).filter(s => s !== null) || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('classroom_id', selectedClassroom.id)
        .eq('subject_id', selectedSubject)
        .order('evaluation_date', { ascending: false });

      if (error) throw error;

      setGrades(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast.error('Erro ao carregar notas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingGrade?.student_id) {
      toast.error('Selecione um aluno');
      return;
    }

    try {
      const gradeData = {
        student_id: editingGrade.student_id,
        classroom_id: selectedClassroom.id,
        teacher_id: teacherId,
        subject_id: selectedSubject,
        ...formData,
        grade_value: parseFloat(formData.grade_value),
        max_grade: parseFloat(formData.max_grade),
        weight: parseFloat(formData.weight),
      };

      if (editingGrade.id) {
        const { error } = await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', editingGrade.id);

        if (error) throw error;
        toast.success('Nota atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('grades')
          .insert([gradeData]);

        if (error) throw error;
        toast.success('Nota adicionada com sucesso!');
      }

      setShowAddModal(false);
      setEditingGrade(null);
      resetForm();
      loadGrades();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast.error('Erro ao salvar nota');
    }
  };

  const handleDelete = async (gradeId) => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;

      toast.success('Nota excluída com sucesso!');
      loadGrades();
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      toast.error('Erro ao excluir nota');
    }
  };

  const resetForm = () => {
    setFormData({
      grade_type: 'exam',
      grade_value: '',
      max_grade: '10.00',
      weight: '1.00',
      period: 'Q1',
      evaluation_date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
    });
  };

  const openAddModal = (student) => {
    setEditingGrade({ student_id: student.id });
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setFormData({
      grade_type: grade.grade_type,
      grade_value: grade.grade_value.toString(),
      max_grade: grade.max_grade.toString(),
      weight: grade.weight.toString(),
      period: grade.period,
      evaluation_date: grade.evaluation_date,
      description: grade.description || '',
      notes: grade.notes || '',
    });
    setShowAddModal(true);
  };

  const calculateStudentAverage = (studentId) => {
    const studentGrades = grades.filter(g => g.student_id === studentId);
    if (studentGrades.length === 0) return '-';

    const weightedSum = studentGrades.reduce((sum, g) => {
      const normalized = (g.grade_value / g.max_grade) * 10;
      return sum + (normalized * g.weight);
    }, 0);

    const totalWeight = studentGrades.reduce((sum, g) => sum + g.weight, 0);
    return (weightedSum / totalWeight).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Notas</h2>
      </div>

      {/* Classroom Selection */}
      {!selectedClassroom ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Selecione uma Turma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map(classroom => (
              <button
                key={classroom.id}
                onClick={() => setSelectedClassroom(classroom)}
                className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  {classroom.grade && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-lg">
                      {classroom.grade}ª
                    </span>
                  )}
                  <h4 className="font-bold text-lg text-gray-800">Turma {classroom.name}</h4>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : !selectedSubject ? (
        <div>
          <button
            onClick={() => setSelectedClassroom(null)}
            className="mb-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ← Voltar
          </button>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Selecione uma Matéria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all text-left"
              >
                <h4 className="font-bold text-lg text-gray-800">{subject.name}</h4>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSubject(null)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              ← Voltar
            </button>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">
                Turma {selectedClassroom.name} - {subjects.find(s => s.id === selectedSubject)?.name}
              </h3>
            </div>
          </div>

          {/* Students Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando alunos...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Média
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Notas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => {
                    const average = calculateStudentAverage(student.id);
                    const studentGrades = grades.filter(g => g.student_id === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {student.users?.avatar_url ? (
                              <img
                                src={student.users.avatar_url}
                                alt={student.users.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {student.users?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{student.users?.name}</p>
                              <p className="text-xs text-gray-500">{student.enrollment_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-2xl font-bold ${
                            average === '-' ? 'text-gray-400' :
                            parseFloat(average) >= 7 ? 'text-green-600' :
                            parseFloat(average) >= 5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {average}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-600">{studentGrades.length}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openAddModal(student)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Adicionar Nota
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Grades */}
          {grades.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Notas Recentes</h4>
              <div className="space-y-2">
                {grades.slice(0, 10).map(grade => {
                  const student = students.find(s => s.id === grade.student_id);
                  return (
                    <div key={grade.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{student?.users?.name}</p>
                        <p className="text-sm text-gray-600">
                          {grade.description || grade.grade_type} • {new Date(grade.evaluation_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{grade.grade_value}</p>
                          <p className="text-xs text-gray-500">de {grade.max_grade}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(grade)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingGrade?.id ? 'Editar Nota' : 'Adicionar Nota'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGrade(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Avaliação
                  </label>
                  <select
                    value={formData.grade_type}
                    onChange={(e) => setFormData({ ...formData, grade_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="exam">Prova</option>
                    <option value="homework">Trabalho</option>
                    <option value="project">Projeto</option>
                    <option value="quiz">Quiz</option>
                    <option value="participation">Participação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Q1">1º Bimestre</option>
                    <option value="Q2">2º Bimestre</option>
                    <option value="Q3">3º Bimestre</option>
                    <option value="Q4">4º Bimestre</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.grade_value}
                    onChange={(e) => setFormData({ ...formData, grade_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota Máxima
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.max_grade}
                    onChange={(e) => setFormData({ ...formData, max_grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Avaliação
                  </label>
                  <input
                    type="date"
                    value={formData.evaluation_date}
                    onChange={(e) => setFormData({ ...formData, evaluation_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Prova de Matemática - Capítulo 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Observações sobre a avaliação..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGrade(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

