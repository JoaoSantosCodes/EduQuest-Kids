import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Sparkles, Crown, Loader2 } from 'lucide-react';
import { getStudentAchievements, getAchievements } from '../../services/achievementsService';
import { useStudent } from '../../hooks/useStudent';

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const rarityIcons = {
  common: <Star className="w-5 h-5" />,
  rare: <Sparkles className="w-5 h-5" />,
  epic: <Trophy className="w-5 h-5" />,
  legendary: <Crown className="w-5 h-5" />,
};

const rarityLabels = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
};

export default function AchievementsView() {
  const { student } = useStudent();
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  useEffect(() => {
    loadAchievements();
  }, [student]);

  const loadAchievements = async () => {
    if (!student?.id) return;

    setLoading(true);
    try {
      const [unlockedResult, allResult] = await Promise.all([
        getStudentAchievements(student.id),
        getAchievements(),
      ]);

      if (unlockedResult.error) {
        console.error('Erro ao carregar conquistas desbloqueadas:', unlockedResult.error);
      } else {
        setUnlockedAchievements(unlockedResult.achievements || []);
      }

      if (allResult.error) {
        console.error('Erro ao carregar todas as conquistas:', allResult.error);
      } else {
        setAllAchievements(allResult.achievements || []);
      }
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievements?.id || a.achievement_id));

  const filteredAchievements = allAchievements.filter(achievement => {
    const isUnlocked = unlockedIds.has(achievement.id);
    
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const getUnlockedAchievement = (achievementId) => {
    return unlockedAchievements.find(
      a => (a.achievements?.id || a.achievement_id) === achievementId
    );
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
          <Award className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Conquistas</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Desbloqueie conquistas completando desafios e melhorando seu desempenho!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Desbloqueadas</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {allAchievements.length - unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Bloqueadas</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((unlockedAchievements.length / allAchievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progresso</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'unlocked'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Desbloqueadas
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'locked'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bloqueadas
          </button>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockedData = getUnlockedAchievement(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all ${
                isUnlocked
                  ? `${rarityColors[achievement.rarity]} opacity-100`
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`text-4xl ${
                    isUnlocked ? '' : 'grayscale opacity-50'
                  }`}
                >
                  {achievement.icon || '🏆'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{achievement.name}</h3>
                    {isUnlocked && (
                      <span className={`text-xs px-2 py-1 rounded-full ${rarityColors[achievement.rarity]}`}>
                        {rarityLabels[achievement.rarity]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {achievement.description}
                  </p>
                  {isUnlocked && unlockedData && (
                    <div className="text-xs text-gray-500">
                      Desbloqueada em:{' '}
                      {new Date(unlockedData.unlocked_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {!isUnlocked && (
                    <div className="text-xs text-purple-600 font-medium">
                      {getConditionText(achievement)}
                    </div>
                  )}
                  {achievement.points_reward > 0 && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      +{achievement.points_reward} pontos
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhuma conquista encontrada nesta categoria.</p>
        </div>
      )}
    </div>
  );
}

function getConditionText(achievement) {
  switch (achievement.condition_type) {
    case 'quizzes_completed':
      return `Complete ${achievement.condition_value} quiz${achievement.condition_value > 1 ? 'zes' : ''}`;
    case 'perfect_quiz':
      return `Acerte 100% em ${achievement.condition_value} quiz${achievement.condition_value > 1 ? 'zes' : ''}`;
    case 'level_reached':
      return `Alcance o nível ${achievement.condition_value}`;
    case 'streak_days':
      return `Estude ${achievement.condition_value} dia${achievement.condition_value > 1 ? 's' : ''} seguidos`;
    case 'study_hours':
      const hours = Math.floor(achievement.condition_value / 3600);
      return `Estude ${hours} hora${hours > 1 ? 's' : ''}`;
    case 'points_reached':
      return `Alcance ${achievement.condition_value} pontos`;
    default:
      return 'Complete o desafio para desbloquear';
  }
}

