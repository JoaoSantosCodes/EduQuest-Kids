import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Target, Clock, Play, Book } from 'lucide-react';
import { getAvailableQuizzes } from '../../services/studentsService';
import { useNavigate } from 'react-router-dom';

function QuizGames({ studentId, classroomId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, [studentId]);

  const loadQuizzes = async () => {
    setLoading(true);
    const { quizzes: data } = await getAvailableQuizzes(studentId);
    setQuizzes(data);
    setLoading(false);
  };

  const handlePlayQuiz = () => {
    // Redirecionar para o EduQuizApp existente
    navigate('/student-quiz');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jogos Educativos</h2>
          <p className="text-gray-600">Aprenda brincando!</p>
        </div>
        <button
          onClick={handlePlayQuiz}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Jogar Agora
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <Trophy className="w-12 h-12 mb-3" />
          <h3 className="text-3xl font-bold mb-1">0</h3>
          <p className="text-green-100">Conquistas</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
          <Target className="w-12 h-12 mb-3" />
          <h3 className="text-3xl font-bold mb-1">0</h3>
          <p className="text-blue-100">Pontos</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <Clock className="w-12 h-12 mb-3" />
          <h3 className="text-3xl font-bold mb-1">0h</h3>
          <p className="text-purple-100">Tempo de Estudo</p>
        </div>
      </div>

      {/* Available Quizzes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Quizzes Disponíveis</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: quiz.subjects?.color || '#10B981' }}
                  >
                    {quiz.subjects?.name?.charAt(0) || 'Q'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{quiz.title}</h4>
                    <p className="text-sm text-gray-600">{quiz.subjects?.name || 'Geral'}</p>
                  </div>
                </div>
                <button
                  onClick={handlePlayQuiz}
                  className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Jogar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum quiz disponível no momento.</p>
            <button
              onClick={handlePlayQuiz}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Explorar Jogos
            </button>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Book className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Aprenda Jogando</h3>
          <p className="text-sm text-gray-600">
            Quizzes interativos para todas as matérias
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Conquiste Troféus</h3>
          <p className="text-sm text-gray-600">
            Desbloqueie conquistas e badges
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Acompanhe Progresso</h3>
          <p className="text-sm text-gray-600">
            Veja sua evolução em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuizGames;

