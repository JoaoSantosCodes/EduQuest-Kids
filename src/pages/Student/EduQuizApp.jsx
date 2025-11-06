import React, { useState, useEffect } from 'react';
import { Trophy, Clock, BookOpen, Star, RotateCcw, ChevronRight, Award, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudent';
import { useSubjects } from '../../hooks/useSubjects';
import { getQuestionsBySubject } from '../../services/subjectsService';
import { createQuizAttempt, submitQuizAttempt } from '../../services/quizzesService';
import { startStudySession, endStudySession } from '../../services/studentsService';
import { checkAndUnlockAchievements, createAchievementNotification } from '../../services/achievementsService';
import AchievementsView from '../../components/student/AchievementsView';
import StudyPlanView from '../../components/student/StudyPlanView';
import RankingView from '../../components/student/RankingView';
import { toast } from 'sonner';

export default function EduQuizApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { student, stats, refreshStats } = useStudent();
  const { subjects, loading: subjectsLoading } = useSubjects();
  
  const [currentView, setCurrentView] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Formatar tempo de estudo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Carregar totalScore e level do aluno
  const totalScore = stats?.totalPoints || student?.total_points || 0;
  const level = stats?.level || student?.level || 1;
  const studyTimeSeconds = stats?.studyTimeSeconds || student?.study_time_seconds || 0;

  // Quiz data fallback (para quando não há questões no banco)
  const quizDataFallback = {
    mat: [
      { question: 'Quanto é 15% de 200?', options: ['20', '30', '40', '50'], correct: 1 },
      { question: 'Qual é o resultado de 8² ?', options: ['16', '64', '32', '72'], correct: 1 },
      { question: 'Quanto é 3/4 de 100?', options: ['75', '50', '25', '80'], correct: 0 },
      { question: 'Qual é a área de um quadrado de lado 7cm?', options: ['14cm²', '28cm²', '49cm²', '21cm²'], correct: 2 },
      { question: 'Quanto é 12 × 15?', options: ['150', '180', '200', '170'], correct: 1 },
      { question: 'Qual é o próximo número primo após 7?', options: ['9', '10', '11', '13'], correct: 2 },
      { question: 'Quanto vale X em: 2X + 6 = 18?', options: ['6', '8', '10', '12'], correct: 0 },
      { question: 'Qual é o perímetro de um retângulo 5cm × 8cm?', options: ['13cm', '26cm', '40cm', '20cm'], correct: 1 }
    ],
    port: [
      { question: 'Qual é o plural de "cidadão"?', options: ['Cidadões', 'Cidadãos', 'Cidadães', 'Cidadans'], correct: 1 },
      { question: 'O que é um substantivo coletivo?', options: ['Muitos nomes', 'Nome de grupo', 'Nome próprio', 'Nome composto'], correct: 1 },
      { question: 'Qual é o sujeito em: "Maria comeu o bolo"?', options: ['Comeu', 'Maria', 'O bolo', 'Não tem'], correct: 1 },
      { question: 'Qual palavra está escrita corretamente?', options: ['Excessão', 'Exceção', 'Exeção', 'Escesão'], correct: 1 },
      { question: 'O que é uma metáfora?', options: ['Comparação direta', 'Comparação indireta', 'Repetição', 'Exagero'], correct: 1 },
      { question: 'Qual é o feminino de "réu"?', options: ['Réia', 'Reia', 'Réu', 'Ré'], correct: 3 },
      { question: 'Qual é o sinônimo de "feliz"?', options: ['Triste', 'Alegre', 'Nervoso', 'Calmo'], correct: 1 },
      { question: 'O que é um adjetivo?', options: ['Ação', 'Característica', 'Objeto', 'Lugar'], correct: 1 }
    ],
    hist: [
      { question: 'Quem descobriu o Brasil?', options: ['Colombo', 'Cabral', 'Vasco da Gama', 'Magellan'], correct: 1 },
      { question: 'Em que ano foi a Independência do Brasil?', options: ['1500', '1822', '1889', '1930'], correct: 1 },
      { question: 'Quem foi D. Pedro I?', options: ['Rei', 'Imperador', 'Presidente', 'Príncipe'], correct: 1 },
      { question: 'O que foi a Proclamação da República?', options: ['Fim da monarquia', 'Início da monarquia', 'Guerra', 'Tratado'], correct: 0 },
      { question: 'Qual foi o primeiro presidente do Brasil?', options: ['Getúlio Vargas', 'Deodoro da Fonseca', 'JK', 'D. Pedro II'], correct: 1 },
      { question: 'Quando acabou a escravidão no Brasil?', options: ['1822', '1850', '1888', '1889'], correct: 2 }
    ],
    geo: [
      { question: 'Qual é a capital do Brasil?', options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], correct: 2 },
      { question: 'Quantos estados tem o Brasil?', options: ['24', '25', '26', '27'], correct: 3 },
      { question: 'Qual é o maior bioma brasileiro?', options: ['Cerrado', 'Amazônia', 'Mata Atlântica', 'Caatinga'], correct: 1 },
      { question: 'Qual é o rio mais extenso do Brasil?', options: ['São Francisco', 'Paraná', 'Amazonas', 'Tietê'], correct: 2 },
      { question: 'Em qual continente fica o Brasil?', options: ['África', 'América', 'Europa', 'Ásia'], correct: 1 },
      { question: 'Qual região tem mais estados?', options: ['Norte', 'Nordeste', 'Sul', 'Sudeste'], correct: 1 }
    ],
    cien: [
      { question: 'Qual é a fórmula da água?', options: ['H2O', 'CO2', 'O2', 'H2'], correct: 0 },
      { question: 'Quantos ossos tem o corpo humano adulto?', options: ['106', '206', '306', '406'], correct: 1 },
      { question: 'O que é fotossíntese?', options: ['Respiração', 'Produção de alimento', 'Reprodução', 'Digestão'], correct: 1 },
      { question: 'Qual planeta é conhecido como vermelho?', options: ['Vênus', 'Júpiter', 'Marte', 'Saturno'], correct: 2 },
      { question: 'O que são células?', options: ['Órgãos', 'Unidades básicas da vida', 'Tecidos', 'Sistemas'], correct: 1 },
      { question: 'Qual é a velocidade da luz?', options: ['200.000 km/s', '300.000 km/s', '400.000 km/s', '100.000 km/s'], correct: 1 },
      { question: 'O que causa as estações do ano?', options: ['Distância do Sol', 'Inclinação da Terra', 'Lua', 'Vento'], correct: 1 },
      { question: 'Qual gás respiramos?', options: ['CO2', 'N2', 'O2', 'H2'], correct: 2 }
    ],
    ing: [
      { question: 'Como se diz "livro" em inglês?', options: ['Book', 'Cook', 'Look', 'Hook'], correct: 0 },
      { question: 'Qual é o plural de "child"?', options: ['Childs', 'Children', 'Childes', 'Child'], correct: 1 },
      { question: 'O que significa "happy"?', options: ['Triste', 'Feliz', 'Bravo', 'Cansado'], correct: 1 },
      { question: 'Como se diz "bom dia"?', options: ['Good night', 'Good morning', 'Good afternoon', 'Good bye'], correct: 1 },
      { question: 'Qual é o verbo "to be" no passado (I)?', options: ['Am', 'Was', 'Were', 'Be'], correct: 1 },
      { question: 'O que é "school"?', options: ['Casa', 'Escola', 'Igreja', 'Mercado'], correct: 1 }
    ]
  };

  // Timer de estudo
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Iniciar sessão de estudo quando começar quiz
  useEffect(() => {
    if (currentView === 'quiz' && student && !sessionId) {
      startStudySessionHandler();
    }
  }, [currentView, student]);

  // Finalizar sessão quando sair
  useEffect(() => {
    return () => {
      if (sessionId && student) {
        endStudySessionHandler();
      }
    };
  }, [sessionId]);

  const startStudySessionHandler = async () => {
    if (student && selectedSubject) {
      const { session, error } = await startStudySession(student.id, selectedSubject.id);
      if (!error && session) {
        setSessionId(session.id);
      }
    }
  };

  const endStudySessionHandler = async () => {
    if (sessionId && student) {
      await endStudySession(sessionId);
    }
  };

  const handleAnswer = async (selectedIndex) => {
    if (!questions[currentQuestion]) return;

    const question = questions[currentQuestion];
    const isCorrect = selectedIndex === question.correct_answer;
    
    if (isCorrect) {
      const points = (question.points || 10) + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      toast.success('Correto! +' + points + ' pontos');
    } else {
      setStreak(0);
      toast.error('Ops! Tente novamente');
    }

    const answerData = {
      question_id: question.id,
      selected_answer: selectedIndex,
      is_correct: isCorrect,
      time_spent: 0, // Você pode calcular o tempo por questão
    };

    setAnsweredQuestions([...answeredQuestions, answerData]);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 800);
    } else {
      // Finalizar quiz
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsTimerRunning(false);
    const correctAnswers = answeredQuestions.filter(q => q.is_correct).length;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);

    // Submeter tentativa no Supabase
    if (attemptId && student) {
      await submitQuizAttempt(
        attemptId,
        answeredQuestions,
        score,
        correctAnswers,
        studyTime
      );
      
      // Atualizar estatísticas
      await refreshStats();

      // Verificar e desbloquear conquistas
      try {
        const { newAchievements, totalUnlocked } = await checkAndUnlockAchievements(student.id);
        
        if (totalUnlocked > 0 && user) {
          // Criar notificações para cada conquista
          for (const achievement of newAchievements) {
            await createAchievementNotification(user.id, achievement);
            toast.success(`🏆 Nova conquista: ${achievement.name}!`, {
              description: achievement.description,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar conquistas:', error);
      }
    }

    // Finalizar sessão de estudo
    if (sessionId && student) {
      await endStudySession(sessionId);
      setSessionId(null);
    }

    setCurrentView('results');
  };

  const startQuiz = async (subject) => {
    try {
      setLoadingQuestions(true);
      setSelectedSubject(subject);
      setCurrentQuestion(0);
      setScore(0);
      setStreak(0);
      setAnsweredQuestions([]);
      
      // Buscar questões do Supabase
      if (student) {
        const { questions: fetchedQuestions, error } = await getQuestionsBySubject(
          subject.id,
          {
            grade_level: student.grade,
            limit: 10,
            shuffle: true,
            approved: true,
          }
        );

        if (error || !fetchedQuestions || fetchedQuestions.length === 0) {
          toast.warning('Nenhuma questão encontrada. Usando questões de exemplo.');
          // Usar fallback
          const fallbackKey = subject.name.toLowerCase().substring(0, 4);
          if (quizDataFallback[fallbackKey]) {
            setQuestions(quizDataFallback[fallbackKey]);
          } else {
            toast.error('Nenhuma questão disponível para esta matéria');
            return;
          }
        } else {
          // Converter options de JSON string para array
          const formattedQuestions = fetchedQuestions.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          }));
          setQuestions(formattedQuestions);
        }

        // Criar tentativa de quiz (após carregar questões)
        const loadedQuestions = error || !fetchedQuestions || fetchedQuestions.length === 0
          ? (quizDataFallback[subject.name.toLowerCase().substring(0, 4)] || [])
          : fetchedQuestions;
        
        const totalPoints = loadedQuestions.reduce((sum, q) => sum + (q.points || 10), 0);
        const { attempt, error: attemptError } = await createQuizAttempt(
          null, // Quiz livre (sem quiz_id específico)
          student.id,
          loadedQuestions.length,
          totalPoints
        );

        if (!attemptError && attempt) {
          setAttemptId(attempt.id);
        }
      }

      setCurrentView('quiz');
      setIsTimerRunning(true);
    } catch (error) {
      console.error('Erro ao iniciar quiz:', error);
      toast.error('Erro ao carregar questões');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetQuiz = () => {
    setCurrentView('home');
    setSelectedSubject(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (currentView === 'home') {
    if (subjectsLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-xl">Carregando matérias...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-purple-600">EduQuest Kids</h1>
                <p className="text-gray-600">Olá, {user?.name}! Aprenda brincando! 🎮</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold text-orange-500">
                    <Trophy className="w-8 h-8" />
                    {totalScore}
                  </div>
                  <div className="text-sm text-gray-600">Pontos Totais</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  title="Sair"
                >
                  <LogOut className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{formatTime(studyTimeSeconds)}</div>
                <div className="text-xs text-blue-600">Tempo de Estudo</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{level}</div>
                <div className="text-xs text-green-600">Nível</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats?.achievementsCount || 0}</div>
                <div className="text-xs text-purple-600">Conquistas</div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('achievements')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Minhas Conquistas
              </button>
              <button
                onClick={() => setCurrentView('study-plan')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Plano de Estudos
              </button>
              <button
                onClick={() => setCurrentView('ranking')}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Ranking
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          {subjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-600 mb-4">Nenhuma matéria cadastrada ainda.</p>
              <p className="text-sm text-gray-500">Peça ao seu professor para adicionar matérias e questões!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {subjects.map((subject) => {
                // Mapear cor do banco para classe Tailwind
                const colorMap = {
                  'bg-blue-500': 'bg-blue-500',
                  'bg-green-500': 'bg-green-500',
                  'bg-yellow-500': 'bg-yellow-500',
                  'bg-purple-500': 'bg-purple-500',
                  'bg-teal-500': 'bg-teal-500',
                  'bg-pink-500': 'bg-pink-500',
                };
                const bgColor = colorMap[subject.color] || 'bg-gray-500';
                
                return (
                  <button
                    key={subject.id}
                    onClick={() => startQuiz(subject)}
                    disabled={loadingQuestions}
                    className={`${bgColor} hover:scale-105 transition-transform rounded-2xl shadow-xl p-6 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-5xl mb-3">{subject.icon || '📚'}</div>
                    <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                    <div className="flex items-center justify-between text-sm opacity-90">
                      <span>Iniciar Quiz</span>
                      {loadingQuestions ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'quiz') {
    if (loadingQuestions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-xl">Carregando questões...</p>
          </div>
        </div>
      );
    }

    const question = questions[currentQuestion];
    if (!question) {
      setCurrentView('home');
      return null;
    }

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${selectedSubject.color} rounded-xl p-3 text-3xl`}>
                  {selectedSubject.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedSubject.name}</h2>
                  <p className="text-sm text-gray-600">Questão {currentQuestion + 1}/{questions.length}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">{score}</div>
                <div className="text-xs text-gray-600">Pontos</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-3 mb-4 text-white text-center font-bold">
                🔥 Sequência de {streak} acertos! +{streak * 5} pontos bônus
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(studyTime)}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {question.question_text || question.question}
            </h3>

            <div className="space-y-3">
              {(typeof question.options === 'string' 
                ? JSON.parse(question.options) 
                : question.options
              ).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 rounded-xl p-4 text-left text-lg font-semibold text-gray-800 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <span className="inline-block w-8 h-8 bg-purple-500 text-white rounded-full text-center leading-8 mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'achievements') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-purple-600">Minhas Conquistas</h1>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                ← Voltar
              </button>
            </div>
          </div>
          <AchievementsView />
        </div>
      </div>
    );
  }

  if (currentView === 'study-plan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-purple-600">Plano de Estudos</h1>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                ← Voltar
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Organize seu tempo de estudo e defina metas semanais!
            </p>
          </div>
          <StudyPlanView student={student} subjects={subjects} />
        </div>
      </div>
    );
  }

  if (currentView === 'ranking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-purple-600">Ranking</h1>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                ← Voltar
              </button>
            </div>
          </div>
          <RankingView />
        </div>
      </div>
    );
  }

  if (currentView === 'results') {
    const correctAnswers = answeredQuestions.filter(q => q.correct).length;
    const percentage = Math.round((correctAnswers / answeredQuestions.length) * 100);
    const newLevel = Math.floor(totalScore / 100) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {percentage >= 80 ? 'Incrível!' : percentage >= 60 ? 'Muito Bem!' : 'Continue Tentando!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            Você completou o quiz de {selectedSubject.name}
          </p>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-purple-600">{correctAnswers}/{answeredQuestions.length}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500">{score}</div>
                <div className="text-sm text-gray-600">Pontos</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="text-4xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-gray-600">Aproveitamento</div>
            </div>
          </div>

          {newLevel > level && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 mb-6 text-white">
              <div className="text-2xl font-bold">🎉 Subiu de Nível!</div>
              <div className="text-lg">Agora você está no nível {newLevel}</div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => startQuiz(selectedSubject)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Jogar Novamente
            </button>
            
            <button
              onClick={resetQuiz}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }
}

