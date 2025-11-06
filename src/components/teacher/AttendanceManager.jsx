import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Save,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AttendanceManager({ classrooms, teacherId }) {
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedClassroom) {
      loadStudents();
      loadAttendance();
    }
  }, [selectedClassroom, selectedDate]);

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
        .eq('classroom_id', selectedClassroom.id)
        .order('students(users(name))');

      if (error) throw error;

      const studentsList = data?.map(cs => cs.students).filter(s => s !== null) || [];
      setStudents(studentsList);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('classroom_id', selectedClassroom.id)
        .eq('date', selectedDate);

      if (error) throw error;

      const attendanceMap = {};
      data?.forEach(record => {
        attendanceMap[record.student_id] = {
          status: record.status,
          notes: record.notes || '',
          id: record.id
        };
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Erro ao carregar frequência:', error);
      toast.error('Erro ao carregar frequência');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        notes: prev[studentId]?.notes || ''
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
        status: prev[studentId]?.status || 'present'
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const records = students.map(student => ({
        classroom_id: selectedClassroom.id,
        student_id: student.id,
        teacher_id: teacherId,
        date: selectedDate,
        status: attendance[student.id]?.status || 'present',
        notes: attendance[student.id]?.notes || null
      }));

      // Deletar registros existentes para esta turma e data
      await supabase
        .from('attendance')
        .delete()
        .eq('classroom_id', selectedClassroom.id)
        .eq('date', selectedDate);

      // Inserir novos registros
      const { error } = await supabase
        .from('attendance')
        .insert(records);

      if (error) throw error;

      toast.success('Frequência salva com sucesso!');
      loadAttendance();
    } catch (error) {
      console.error('Erro ao salvar frequência:', error);
      toast.error('Erro ao salvar frequência');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = {
        status,
        notes: attendance[student.id]?.notes || ''
      };
    });
    setAttendance(newAttendance);
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const filteredStudents = students.filter(student =>
    student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    const present = Object.values(attendance).filter(a => a.status === 'present').length;
    const absent = Object.values(attendance).filter(a => a.status === 'absent').length;
    const late = Object.values(attendance).filter(a => a.status === 'late').length;
    const justified = Object.values(attendance).filter(a => a.status === 'justified').length;
    return { present, absent, late, justified };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Frequência</h2>
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
                <p className="text-sm text-gray-600">
                  {classroom.shift === 'morning' ? '🌅 Manhã' :
                   classroom.shift === 'afternoon' ? '☀️ Tarde' :
                   classroom.shift === 'evening' ? '🌙 Noite' : '⏰ Integral'}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with classroom info and date selector */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedClassroom(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {selectedClassroom.grade && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-lg">
                    {selectedClassroom.grade}ª
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-800">
                  Turma {selectedClassroom.name}
                </h3>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => changeDate(1)}
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hoje
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Presentes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faltas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atrasos</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
              </div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Justificadas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.justified}</p>
                </div>
                <FileCheck className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                ✓ Marcar Todos Presentes
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                ✗ Marcar Todos Ausentes
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Frequência'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Students List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando alunos...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aluno
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presente
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Falta
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atraso
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Justificada
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map(student => {
                      const studentAttendance = attendance[student.id] || { status: 'present', notes: '' };
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
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
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={studentAttendance.status === 'present'}
                              onChange={() => handleStatusChange(student.id, 'present')}
                              className="w-5 h-5 text-green-600 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={studentAttendance.status === 'absent'}
                              onChange={() => handleStatusChange(student.id, 'absent')}
                              className="w-5 h-5 text-red-600 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={studentAttendance.status === 'late'}
                              onChange={() => handleStatusChange(student.id, 'late')}
                              className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={studentAttendance.status === 'justified'}
                              onChange={() => handleStatusChange(student.id, 'justified')}
                              className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={studentAttendance.notes}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              placeholder="Observações..."
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum aluno encontrado.' : 'Nenhum aluno nesta turma.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

