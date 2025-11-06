import React, { useState } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Award, Upload, X } from 'lucide-react';
import { submitAssignment } from '../../services/studentsService';
import { toast } from 'sonner';

function MyAssignments({ studentId, assignments }) {
  const [filter, setFilter] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getStatusIcon = (status, dueDate) => {
    const isLate = new Date(dueDate) < new Date() && status === 'pending';
    if (isLate) return <AlertCircle className="w-5 h-5 text-red-600" />;
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'submitted': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'graded': return <Award className="w-5 h-5 text-green-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status, dueDate) => {
    const isLate = new Date(dueDate) < new Date() && status === 'pending';
    if (isLate) return 'Atrasado';
    switch (status) {
      case 'pending': return 'Pendente';
      case 'submitted': return 'Entregue';
      case 'graded': return 'Avaliado';
      default: return status;
    }
  };

  const getStatusColor = (status, dueDate) => {
    const isLate = new Date(dueDate) < new Date() && status === 'pending';
    if (isLate) return 'bg-red-100 text-red-800';
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = assignments?.filter(a => {
    if (filter === 'all') return true;
    const isLate = new Date(a.assignments?.due_date) < new Date() && a.status === 'pending';
    if (filter === 'late') return isLate;
    return a.status === filter;
  }) || [];

  const stats = {
    total: assignments?.length || 0,
    pending: assignments?.filter(a => a.status === 'pending').length || 0,
    submitted: assignments?.filter(a => a.status === 'submitted').length || 0,
    graded: assignments?.filter(a => a.status === 'graded').length || 0,
    late: assignments?.filter(a => new Date(a.assignments?.due_date) < new Date() && a.status === 'pending').length || 0,
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast.error('Digite sua resposta antes de enviar');
      return;
    }

    setSubmitting(true);
    const { error } = await submitAssignment(
      selectedAssignment.assignments.id,
      studentId,
      { text: submissionText, fileUrl: null }
    );

    if (error) {
      toast.error('Erro ao enviar atividade');
    } else {
      toast.success('Atividade enviada com sucesso!');
      setShowSubmitModal(false);
      setSubmissionText('');
      window.location.reload();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Minhas Atividades</h2>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <ClipboardList className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-orange-50 rounded-xl shadow-lg p-6 text-center">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg p-6 text-center">
          <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Entregues</p>
          <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-lg p-6 text-center">
          <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Avaliadas</p>
          <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Atrasadas</p>
          <p className="text-3xl font-bold text-red-600">{stats.late}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'late' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Atrasadas ({stats.late})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'graded' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Avaliadas ({stats.graded})
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(assignment.status, assignment.assignments?.due_date)}
                    <h3 className="font-bold text-lg text-gray-800">{assignment.assignments?.title}</h3>
                  </div>
                  
                  {assignment.assignments?.description && (
                    <p className="text-gray-600 mb-3">{assignment.assignments.description}</p>
                  )}

                  <div className="flex flex-wrap gap-3 mb-3">
                    {assignment.assignments?.subjects && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        {assignment.assignments.subjects.name}
                      </span>
                    )}
                    {assignment.assignments?.assignment_type && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {assignment.assignments.assignment_type}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(assignment.status, assignment.assignments?.due_date)}`}>
                      {getStatusLabel(assignment.status, assignment.assignments?.due_date)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {assignment.assignments?.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Entrega: {new Date(assignment.assignments.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {assignment.submitted_at && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Entregue em: {new Date(assignment.submitted_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {assignment.status === 'graded' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">Nota:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {assignment.grade} / {assignment.assignments?.max_grade}
                        </span>
                      </div>
                      {assignment.feedback && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                          <p className="text-sm text-gray-600">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {assignment.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setShowSubmitModal(true);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Upload className="w-5 h-5" />
                    Entregar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma atividade encontrada com esse filtro.</p>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Entregar Atividade</h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{selectedAssignment.assignments?.title}</h3>
              <p className="text-gray-600 mb-4">{selectedAssignment.assignments?.description}</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua Resposta:
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite sua resposta aqui..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Enviar Atividade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAssignments;

