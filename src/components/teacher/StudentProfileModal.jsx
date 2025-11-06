import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

export default function StudentProfileModal({ student, onClose }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'academic', 'attendance', 'observations'
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [observations, setObservations] = useState([]);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, [student.id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Buscar dados completos do aluno
      const { data: studentInfo, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          users (
            id,
            name,
            email,
            phone,
            birth_date,
            gender,
            address,
            avatar_url
          )
        `)
        .eq('id', student.id)
        .single();

      if (studentError) throw studentError;

      // Buscar pais/responsáveis
      const { data: parentsData, error: parentsError } = await supabase
        .from('parent_student_relation')
        .select(`
          relationship,
          parents (
            id,
            users (
              id,
              name,
              email,
              phone
            )
          )
        `)
        .eq('student_id', student.id);

      if (!parentsError && parentsData) {
        setParents(parentsData.map(p => ({
          ...p.parents.users,
          relationship: p.relationship
        })));
      }

      // Buscar notas
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          subjects (name, icon, color)
        `)
        .eq('student_id', student.id)
        .order('evaluation_date', { ascending: false })
        .limit(10);

      if (!gradesError) setGrades(gradesData || []);

      // Buscar frequência (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (!attendanceError) setAttendance(attendanceData || []);

      // Buscar observações
      const { data: observationsData, error: observationsError } = await supabase
        .from('student_observations')
        .select(`
          *,
          teachers (
            users (name)
          )
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!observationsError) setObservations(observationsData || []);

      setStudentData(studentInfo);
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      toast.error('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!studentData) return null;

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return ((present / attendance.length) * 100).toFixed(1);
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade_value), 0);
    return (sum / grades.length).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Perfil do Aluno</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Student Header Info */}
          <div className="flex items-center gap-4">
            {studentData.users?.avatar_url ? (
              <img
                src={studentData.users.avatar_url}
                alt={studentData.users.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                {studentData.users?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold">{studentData.users?.name}</h3>
              <p className="text-blue-100">Matrícula: {studentData.enrollment_number || 'N/A'}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {studentData.enrollment_status === 'active' ? '✅ Ativo' : '⚠️ Inativo'}
                </span>
                <span className="text-sm text-blue-100">
                  Desde: {new Date(studentData.enrollment_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Informações
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'academic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Acadêmico
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Frequência
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'observations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Observações
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Dados Pessoais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {studentData.users?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Telefone</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {studentData.users?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Data de Nascimento</label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {studentData.users?.birth_date
                        ? new Date(studentData.users.birth_date).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Gênero</label>
                    <p className="font-medium">
                      {studentData.users?.gender === 'male' ? 'Masculino' :
                       studentData.users?.gender === 'female' ? 'Feminino' :
                       studentData.users?.gender === 'other' ? 'Outro' : 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Endereço</label>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {studentData.users?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Responsáveis */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Responsáveis
                </h4>
                {parents.length > 0 ? (
                  <div className="space-y-3">
                    {parents.map((parent, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-bold text-gray-800">{parent.name}</p>
                        <p className="text-sm text-gray-600">
                          {parent.relationship === 'father' ? 'Pai' :
                           parent.relationship === 'mother' ? 'Mãe' :
                           parent.relationship === 'guardian' ? 'Responsável' :
                           parent.relationship}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {parent.email}
                          </p>
                          {parent.phone && (
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {parent.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum responsável cadastrado.
                  </p>
                )}
              </div>

              {/* Dados do Responsável (guardian_*) */}
              {studentData.guardian_name && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    Responsável Adicional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Nome</label>
                      <p className="font-medium">{studentData.guardian_name}</p>
                    </div>
                    {studentData.guardian_phone && (
                      <div>
                        <label className="text-sm text-gray-600">Telefone</label>
                        <p className="font-medium">{studentData.guardian_phone}</p>
                      </div>
                    )}
                    {studentData.guardian_cpf && (
                      <div>
                        <label className="text-sm text-gray-600">CPF</label>
                        <p className="font-medium">{studentData.guardian_cpf}</p>
                      </div>
                    )}
                    {studentData.guardian_relationship && (
                      <div>
                        <label className="text-sm text-gray-600">Parentesco</label>
                        <p className="font-medium">{studentData.guardian_relationship}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observações Gerais */}
              {studentData.observations && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    Observações Gerais
                  </h4>
                  <p className="text-gray-700">{studentData.observations}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Média Geral</p>
                      <p className="text-3xl font-bold text-blue-600">{calculateAverageGrade()}</p>
                    </div>
                    <Award className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Frequência</p>
                      <p className="text-3xl font-bold text-green-600">{calculateAttendanceRate()}%</p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avaliações</p>
                      <p className="text-3xl font-bold text-purple-600">{grades.length}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
                  </div>
                </div>
              </div>

              {/* Notas Recentes */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Notas Recentes</h4>
                {grades.length > 0 ? (
                  <div className="space-y-3">
                    {grades.map((grade) => (
                      <div key={grade.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{grade.description || grade.grade_type}</p>
                          <p className="text-sm text-gray-600">
                            {grade.subjects?.name || 'Sem matéria'} • {new Date(grade.evaluation_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {grade.grade_value}
                          </p>
                          <p className="text-xs text-gray-500">de {grade.max_grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma nota registrada ainda.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Frequência (Últimos 30 dias)
                </h4>
                {attendance.length > 0 ? (
                  <div className="space-y-2">
                    {attendance.map((record) => (
                      <div key={record.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {new Date(record.date).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {record.notes && (
                            <p className="text-sm text-gray-600">{record.notes}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status === 'present' ? '✓ Presente' :
                           record.status === 'absent' ? '✗ Falta' :
                           record.status === 'late' ? '⏰ Atraso' :
                           '✓ Justificado'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum registro de frequência nos últimos 30 dias.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'observations' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Observações dos Professores
                </h4>
                {observations.length > 0 ? (
                  <div className="space-y-4">
                    {observations.map((obs) => (
                      <div key={obs.id} className={`p-4 rounded-lg border-l-4 ${
                        obs.is_positive
                          ? 'bg-green-50 border-green-500'
                          : 'bg-yellow-50 border-yellow-500'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {obs.title && (
                              <p className="font-bold text-gray-800">{obs.title}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {obs.teachers?.users?.name} • {new Date(obs.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            obs.is_positive
                              ? 'bg-green-200 text-green-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {obs.observation_type}
                          </span>
                        </div>
                        <p className="text-gray-700">{obs.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma observação registrada ainda.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

