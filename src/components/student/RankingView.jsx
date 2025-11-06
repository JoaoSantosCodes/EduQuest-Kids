import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Star, Loader2 } from 'lucide-react';
import { getGlobalRanking, getSubjectRanking } from '../../services/rankingService';
import { useSubjects } from '../../hooks/useSubjects';
import { useStudent } from '../../hooks/useStudent';

export default function RankingView() {
  const { student } = useStudent();
  const { subjects } = useSubjects();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('global'); // 'global' ou subject_id
  const [studentPosition, setStudentPosition] = useState(null);

  useEffect(() => {
    loadRanking();
  }, [filter, student]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      let result;
      if (filter === 'global') {
        result = await getGlobalRanking(50);
      } else {
        result = await getSubjectRanking(filter, 50);
      }

      if (result.error) {
        console.error('Erro ao carregar ranking:', result.error);
      } else {
        setRanking(result.ranking || []);

        // Encontrar posição do aluno
        if (student?.id) {
          const position = result.ranking.findIndex((r) => r.id === student.id || r.student_id === student.id);
          setStudentPosition(position >= 0 ? position + 1 : null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <Star className="w-5 h-5 text-gray-400" />;
  };

  const getPositionColor = (position) => {
    if (position === 1) return 'bg-yellow-100 border-yellow-500';
    if (position === 2) return 'bg-gray-100 border-gray-400';
    if (position === 3) return 'bg-orange-100 border-orange-600';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Ranking</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setFilter('global')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'global'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Global
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setFilter(subject.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === subject.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        {/* Student Position */}
        {studentPosition && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <div className="font-bold text-lg">Sua Posição: #{studentPosition}</div>
                <div className="text-sm opacity-90">
                  {filter === 'global'
                    ? 'No ranking global'
                    : `No ranking de ${subjects.find((s) => s.id === filter)?.name || 'matéria'}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {ranking.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhum dado disponível para o ranking.</p>
          </div>
        ) : (
          ranking.map((entry, index) => {
            const isCurrentStudent =
              entry.id === student?.id || entry.student_id === student?.id;
            const position = entry.position || index + 1;

            return (
              <div
                key={entry.id || entry.student_id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all ${
                  isCurrentStudent
                    ? 'border-purple-500 bg-purple-50'
                    : getPositionColor(position)
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    {getPositionIcon(position)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-lg text-gray-800">
                        #{position} {entry.name}
                      </div>
                      {isCurrentStudent && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      {filter === 'global' ? (
                        <>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {entry.total_points || 0} pontos
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Nível {entry.level || 1}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {entry.avg_percentage || 0}% média
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {entry.total_quizzes || 0} quizzes
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

