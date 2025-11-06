import React, { useState, useEffect } from 'react';
import { getChildAttendance } from '../../services/parentsService';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar } from 'lucide-react';

function ChildAttendanceView({ children, selectedChild, onSelectChild }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (selectedChild?.id) {
      loadAttendance();
    }
  }, [selectedChild?.id, selectedMonth, selectedYear]);

  const loadAttendance = async () => {
    if (!selectedChild?.id) return;

    setLoading(true);
    const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
    const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
    
    const { attendance: data } = await getChildAttendance(selectedChild.id, startDate, endDate);
    setAttendance(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'justified':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Falta';
      case 'late': return 'Atraso';
      case 'justified': return 'Justificado';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'justified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    justified: attendance.filter(a => a.status === 'justified').length,
  };

  const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Frequência</h2>

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
          {/* Month/Year Selector */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mês:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando frequência...</p>
            </div>
          ) : attendance.length > 0 ? (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-xl shadow-lg p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Presenças</p>
                  <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                </div>
                <div className="bg-red-50 rounded-xl shadow-lg p-6 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Faltas</p>
                  <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl shadow-lg p-6 text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Atrasos</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <div className="bg-blue-50 rounded-xl shadow-lg p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Justificadas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.justified}</p>
                </div>
              </div>

              {/* Percentage */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Percentual de Presença</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                        percentage >= 90 ? 'text-green-600 bg-green-200' :
                        percentage >= 75 ? 'text-yellow-600 bg-yellow-200' :
                        'text-red-600 bg-red-200'
                      }`}>
                        {percentage >= 90 ? 'Excelente' : percentage >= 75 ? 'Atenção' : 'Crítico'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        percentage >= 90 ? 'bg-green-500' :
                        percentage >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Attendance List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Registros de Frequência</h3>
                <div className="space-y-2">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <p className="font-semibold text-gray-800">
                            {new Date(record.date).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          {record.observation && (
                            <p className="text-sm text-gray-600">{record.observation}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Nenhum registro de frequência encontrado para este período.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Selecione um filho para ver a frequência.
          </p>
        </div>
      )}
    </div>
  );
}

export default ChildAttendanceView;

