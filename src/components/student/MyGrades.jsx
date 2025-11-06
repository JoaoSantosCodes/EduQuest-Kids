import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

function MyGrades({ studentId, grades }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 10;
    if (percentage >= 7) return 'text-green-600 bg-green-100';
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredGrades = selectedPeriod === 'all'
    ? grades
    : grades?.filter(g => g.period === selectedPeriod);

  // Agrupar por matéria
  const gradesBySubject = filteredGrades?.reduce((acc, grade) => {
    const subjectName = grade.subjects?.name || 'Sem matéria';
    if (!acc[subjectName]) {
      acc[subjectName] = { grades: [], color: grade.subjects?.color || '#6B7280' };
    }
    acc[subjectName].grades.push(grade);
    return acc;
  }, {});

  // Calcular médias
  const subjectAverages = Object.entries(gradesBySubject || {}).map(([subject, data]) => {
    const validGrades = data.grades.filter(g => g.grade !== null && g.max_grade !== null);
    const average = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + (g.grade / g.max_grade) * 10, 0) / validGrades.length
      : 0;
    return {
      subject,
      average: Math.round(average * 10) / 10,
      grades: data.grades,
      color: data.color,
    };
  }).sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Minhas Notas</h2>

      {/* Period Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por período:
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {filteredGrades && filteredGrades.length > 0 ? (
        <>
          {/* Averages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectAverages.map(({ subject, average, grades, color }) => (
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
                    <p className="text-sm text-gray-600">{grades.length} avaliações</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Média</p>
                  <p className={`text-4xl font-bold ${
                    average >= 7 ? 'text-green-600' : average >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {average.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Grades */}
          <div className="space-y-4">
            {Object.entries(gradesBySubject || {}).map(([subject, data]) => (
              <div key={subject} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">{subject}</h3>
                <div className="space-y-2">
                  {data.grades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{grade.evaluation_name || 'Avaliação'}</p>
                        <p className="text-sm text-gray-600">
                          {grade.evaluation_type} • {grade.period} • {new Date(grade.evaluation_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-lg font-bold ${getGradeColor(grade.grade, grade.max_grade)}`}>
                          {grade.grade} / {grade.max_grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma nota encontrada para este período.</p>
        </div>
      )}
    </div>
  );
}

export default MyGrades;

