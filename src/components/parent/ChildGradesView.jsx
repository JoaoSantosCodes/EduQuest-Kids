import React, { useState, useEffect } from 'react';
import { getChildGrades } from '../../services/parentsService';
import { BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';

function ChildGradesView({ children, selectedChild, onSelectChild }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (selectedChild?.id) {
      loadGrades();
    }
  }, [selectedChild?.id]);

  const loadGrades = async () => {
    if (!selectedChild?.id) return;

    setLoading(true);
    const { grades: data } = await getChildGrades(selectedChild.id);
    setGrades(data || []);
    setLoading(false);
  };

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 10;
    if (percentage >= 7) return 'text-green-600 bg-green-100';
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredGrades = selectedPeriod === 'all'
    ? grades
    : grades.filter(g => g.period === selectedPeriod);

  // Agrupar notas por matéria
  const gradesBySubject = filteredGrades.reduce((acc, grade) => {
    const subjectName = grade.subjects?.name || 'Sem matéria';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(grade);
    return acc;
  }, {});

  // Calcular média por matéria
  const subjectAverages = Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
    const validGrades = subjectGrades.filter(g => g.grade !== null && g.max_grade !== null);
    const average = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + (g.grade / g.max_grade) * 10, 0) / validGrades.length
      : 0;
    return {
      subject,
      average: Math.round(average * 10) / 10,
      grades: subjectGrades,
      color: subjectGrades[0]?.subjects?.color || '#6B7280',
    };
  }).sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Notas e Desempenho</h2>

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
          {/* Period Filter */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por período:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando notas...</p>
            </div>
          ) : filteredGrades.length > 0 ? (
            <>
              {/* Subject Averages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectAverages.map(({ subject, average, grades: subjectGrades, color }) => (
                  <div key={subject} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {subject.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{subject}</h3>
                        <p className="text-sm text-gray-600">{subjectGrades.length} avaliações</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Média</p>
                      <p className={`text-4xl font-bold ${
                        average >= 7 ? 'text-green-600' :
                        average >= 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {average.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Grades by Subject */}
              <div className="space-y-4">
                {Object.entries(gradesBySubject).map(([subject, subjectGrades]) => (
                  <div key={subject} className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      {subject}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avaliação</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Período</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Nota</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Professor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectGrades.map((grade) => (
                            <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-800">{grade.evaluation_name || 'Avaliação'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{grade.evaluation_type}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{grade.period}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-3 py-1 rounded-lg font-bold ${getGradeColor(grade.grade, grade.max_grade)}`}>
                                  {grade.grade} / {grade.max_grade}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(grade.evaluation_date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {grade.teachers?.users?.name || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Nenhuma nota encontrada para este período.
              </p>
              <p className="text-sm text-gray-400">
                As notas aparecerão aqui assim que os professores lançarem as avaliações.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Selecione um filho para ver as notas.
          </p>
        </div>
      )}
    </div>
  );
}

export default ChildGradesView;

