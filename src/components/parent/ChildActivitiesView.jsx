import React, { useState, useEffect } from 'react';
import { getChildAssignments } from '../../services/parentsService';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Award } from 'lucide-react';

function ChildActivitiesView({ children, selectedChild, onSelectChild }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded

  useEffect(() => {
    if (selectedChild?.id) {
      loadAssignments();
    }
  }, [selectedChild?.id]);

  const loadAssignments = async () => {
    if (!selectedChild?.id) return;

    setLoading(true);
    const { assignments: data } = await getChildAssignments(selectedChild.id);
    setAssignments(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'graded':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'submitted': return 'Entregue';
      case 'graded': return 'Avaliado';
      case 'late': return 'Atrasado';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    late: assignments.filter(a => a.status === 'late').length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Atividades e Tarefas</h2>

      {/* Child Selector */}
      {children && children.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione o filho:
          </label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find(c => c.id === e.target.value);
              onSelectChild(child);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Selecione...</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.users?.name} - {child.classroom?.grade}ª {child.classroom?.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedChild ? (
        <>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por status:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendentes ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('submitted')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'submitted'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Entregues ({stats.submitted})
              </button>
              <button
                onClick={() => setFilter('graded')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'graded'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Avaliadas ({stats.graded})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando atividades...</p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(assignment.status)}
                        <h3 className="font-bold text-lg text-gray-800">
                          {assignment.assignments?.title}
                        </h3>
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
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusLabel(assignment.status)}
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
                        {assignment.assignments?.teachers?.users?.name && (
                          <span>
                            Professor: {assignment.assignments.teachers.users.name}
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
                              <p className="text-sm font-semibold text-gray-700 mb-1">Feedback do Professor:</p>
                              <p className="text-sm text-gray-600">{assignment.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Nenhuma atividade encontrada com esse filtro.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Selecione um filho para ver as atividades.
          </p>
        </div>
      )}
    </div>
  );
}

export default ChildActivitiesView;

