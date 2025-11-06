import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function AssignmentsManager({ classrooms, teacherId, subjects }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [formData, setFormData] = useState({
    classroom_id: '',
    subject_id: '',
    title: '',
    description: '',
    assignment_type: 'homework',
    due_date: '',
    max_grade: '10.00',
    is_published: false,
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          classrooms (id, name, grade),
          subjects (id, name, icon, color)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar contagem de submissões para cada atividade
      const assignmentsWithStats = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('assignment_submissions')
            .select('id, status')
            .eq('assignment_id', assignment.id);

          const totalSubmissions = submissionsData?.length || 0;
          const gradedSubmissions = submissionsData?.filter(s => s.status === 'graded').length || 0;

          return {
            ...assignment,
            totalSubmissions,
            gradedSubmissions,
          };
        })
      );

      setAssignments(assignmentsWithStats);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
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
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      toast.error('Erro ao carregar submissões');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const assignmentData = {
        teacher_id: teacherId,
        classroom_id: formData.classroom_id || null,
        subject_id: formData.subject_id || null,
        title: formData.title,
        description: formData.description,
        assignment_type: formData.assignment_type,
        due_date: formData.due_date || null,
        max_grade: parseFloat(formData.max_grade),
        is_published: formData.is_published,
      };

      if (editingAssignment) {
        const { error } = await supabase
          .from('assignments')
          .update(assignmentData)
          .eq('id', editingAssignment.id);

        if (error) throw error;
        toast.success('Atividade atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('assignments')
          .insert([assignmentData]);

        if (error) throw error;
        toast.success('Atividade criada com sucesso!');
      }

      setShowModal(false);
      setEditingAssignment(null);
      resetForm();
      loadAssignments();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast.error('Erro ao salvar atividade');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Atividade excluída com sucesso!');
      loadAssignments();
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      toast.error('Erro ao excluir atividade');
    }
  };

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          grade: parseFloat(grade),
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: teacherId,
          status: 'graded',
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submissão avaliada com sucesso!');
      loadSubmissions(selectedAssignment.id);
    } catch (error) {
      console.error('Erro ao avaliar submissão:', error);
      toast.error('Erro ao avaliar submissão');
    }
  };

  const resetForm = () => {
    setFormData({
      classroom_id: '',
      subject_id: '',
      title: '',
      description: '',
      assignment_type: 'homework',
      due_date: '',
      max_grade: '10.00',
      is_published: false,
    });
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      classroom_id: assignment.classroom_id || '',
      subject_id: assignment.subject_id || '',
      title: assignment.title,
      description: assignment.description || '',
      assignment_type: assignment.assignment_type,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      max_grade: assignment.max_grade.toString(),
      is_published: assignment.is_published,
    });
    setShowModal(true);
  };

  const openSubmissionsModal = (assignment) => {
    setSelectedAssignment(assignment);
    loadSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const getStatusColor = (dueDate, isPublished) => {
    if (!isPublished) return 'bg-gray-100 text-gray-700';
    if (!dueDate) return 'bg-blue-100 text-blue-700';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) return 'bg-red-100 text-red-700';
    if (due - now < 24 * 60 * 60 * 1000) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getTypeLabel = (type) => {
    const types = {
      homework: 'Tarefa',
      project: 'Projeto',
      reading: 'Leitura',
      exercise: 'Exercício',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Atividades</h2>
        <button
          onClick={() => {
            setEditingAssignment(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Atividade
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando atividades...</p>
        </div>
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{assignment.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(assignment.due_date, assignment.is_published)}`}>
                      {!assignment.is_published ? 'Rascunho' :
                       !assignment.due_date ? 'Sem prazo' :
                       new Date(assignment.due_date) < new Date() ? 'Vencida' :
                       'Ativa'}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {getTypeLabel(assignment.assignment_type)}
                    </span>
                  </div>
                </div>
              </div>

              {assignment.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {assignment.description}
                </p>
              )}

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                {assignment.classrooms && (
                  <p>📚 Turma {assignment.classrooms.name}</p>
                )}
                {assignment.subjects && (
                  <p>📖 {assignment.subjects.name}</p>
                )}
                {assignment.due_date && (
                  <p>📅 Prazo: {new Date(assignment.due_date).toLocaleDateString('pt-BR')}</p>
                )}
                <p>📊 Nota máxima: {assignment.max_grade}</p>
              </div>

              {/* Submissions Stats */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {assignment.totalSubmissions} submissões
                </span>
                <span className="text-xs text-gray-500">
                  ({assignment.gradedSubmissions} avaliadas)
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openSubmissionsModal(assignment)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Submissões
                </button>
                <button
                  onClick={() => openEditModal(assignment)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma atividade criada ainda.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingAssignment ? 'Editar Atividade' : 'Nova Atividade'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAssignment(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Trabalho sobre Fotossíntese"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Descreva a atividade..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turma *
                  </label>
                  <select
                    value={formData.classroom_id}
                    onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.grade}ª - Turma {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Atividade
                  </label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="homework">Tarefa</option>
                    <option value="project">Projeto</option>
                    <option value="reading">Leitura</option>
                    <option value="exercise">Exercício</option>
                  </select>
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
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publicar imediatamente (alunos poderão ver e enviar)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAssignment(null);
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
                  {editingAssignment ? 'Atualizar' : 'Criar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAssignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {submissions.length} submissões
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSubmissionsModal(false);
                    setSelectedAssignment(null);
                    setSubmissions([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {submission.students?.users?.avatar_url ? (
                            <img
                              src={submission.students.users.avatar_url}
                              alt={submission.students.users.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {submission.students?.users?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800">
                              {submission.students?.users?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Enviado em {new Date(submission.submitted_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'graded' ? 'bg-green-100 text-green-700' :
                          submission.status === 'late' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {submission.status === 'graded' ? '✓ Avaliado' :
                           submission.status === 'late' ? 'Atrasado' :
                           'Aguardando'}
                        </span>
                      </div>

                      {submission.submission_text && (
                        <div className="mb-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{submission.submission_text}</p>
                        </div>
                      )}

                      {submission.status === 'graded' ? (
                        <div className="p-3 bg-green-50 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Nota:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {submission.grade}/{selectedAssignment.max_grade}
                            </span>
                          </div>
                          {submission.feedback && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={selectedAssignment.max_grade}
                            placeholder="Nota"
                            id={`grade-${submission.id}`}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="Feedback (opcional)"
                            id={`feedback-${submission.id}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => {
                              const grade = document.getElementById(`grade-${submission.id}`).value;
                              const feedback = document.getElementById(`feedback-${submission.id}`).value;
                              if (grade) {
                                handleGradeSubmission(submission.id, grade, feedback);
                              } else {
                                toast.error('Digite uma nota');
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Avaliar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma submissão ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

