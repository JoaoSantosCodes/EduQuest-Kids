import React, { useState, useEffect } from 'react';
import { Calendar, Target, CheckCircle2, Clock, BookOpen, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';

export default function StudyPlanView({ student, subjects }) {
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    subject_id: '',
    goal_description: '',
    daily_time_goal_minutes: 30,
    weekly_quizzes_goal: 3,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    if (student?.id) {
      loadStudyPlans();
    }
  }, [student]);

  const loadStudyPlans = async () => {
    if (!student?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_plans')
        .select(`
          *,
          subjects (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('student_id', student.id)
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      if (error) throw error;

      setStudyPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos de estudo:', error);
      toast.error('Erro ao carregar planos de estudo');
    } finally {
      setLoading(false);
    }
  };

  const createStudyPlan = async () => {
    if (!student?.id || !newPlan.subject_id || !newPlan.goal_description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_plans')
        .insert({
          student_id: student.id,
          subject_id: newPlan.subject_id,
          goal_description: newPlan.goal_description,
          daily_time_goal_minutes: newPlan.daily_time_goal_minutes,
          weekly_quizzes_goal: newPlan.weekly_quizzes_goal,
          start_date: newPlan.start_date,
          end_date: newPlan.end_date || null,
          status: 'active',
        })
        .select(`
          *,
          subjects (
            id,
            name,
            icon,
            color
          )
        `)
        .single();

      if (error) throw error;

      setStudyPlans([...studyPlans, data]);
      setShowCreateModal(false);
      setNewPlan({
        subject_id: '',
        goal_description: '',
        daily_time_goal_minutes: 30,
        weekly_quizzes_goal: 3,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      toast.success('Plano de estudos criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar plano de estudo:', error);
      toast.error('Erro ao criar plano de estudo');
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const week = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }

    return week;
  };

  const weekDays = getWeekDays();
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Plan Button */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Criar Novo Plano de Estudos
        </button>
      </div>

      {/* Study Plans */}
      {studyPlans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Você ainda não tem planos de estudos criados.</p>
          <p className="text-sm text-gray-500">Crie um plano para organizar seu tempo de estudo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {studyPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{plan.subjects?.icon || '📚'}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{plan.subjects?.name}</h3>
                    <p className="text-gray-600">{plan.goal_description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Período</div>
                  <div className="text-sm font-medium">
                    {new Date(plan.start_date).toLocaleDateString('pt-BR')}
                    {plan.end_date && ` - ${new Date(plan.end_date).toLocaleDateString('pt-BR')}`}
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Tempo Diário</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {plan.daily_time_goal_minutes} min
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Quizzes Semanais</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {plan.weekly_quizzes_goal}
                  </div>
                </div>
              </div>

              {/* Weekly Calendar */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Calendário Semanal</h4>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-center ${
                          isToday
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {daysOfWeek[index]}
                        </div>
                        <div className={`text-sm font-bold ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Criar Plano de Estudos</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matéria *
                </label>
                <select
                  value={newPlan.subject_id}
                  onChange={(e) => setNewPlan({ ...newPlan, subject_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione uma matéria</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Meta *
                </label>
                <textarea
                  value={newPlan.goal_description}
                  onChange={(e) => setNewPlan({ ...newPlan, goal_description: e.target.value })}
                  placeholder="Ex: Estudar 30 minutos por dia de Matemática"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo Diário (min)
                  </label>
                  <input
                    type="number"
                    value={newPlan.daily_time_goal_minutes}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, daily_time_goal_minutes: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quizzes Semanais
                  </label>
                  <input
                    type="number"
                    value={newPlan.weekly_quizzes_goal}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, weekly_quizzes_goal: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    value={newPlan.start_date}
                    onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim (opcional)
                  </label>
                  <input
                    type="date"
                    value={newPlan.end_date}
                    onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={createStudyPlan}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all"
              >
                Criar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

