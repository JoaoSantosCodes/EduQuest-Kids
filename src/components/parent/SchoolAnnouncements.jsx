import React, { useState, useEffect } from 'react';
import { getAnnouncementsForChildren } from '../../services/parentsService';
import { Megaphone, Clock, AlertCircle } from 'lucide-react';

function SchoolAnnouncements({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (children && children.length > 0) {
      loadAnnouncements();
    }
  }, [children]);

  const loadAnnouncements = async () => {
    const classroomIds = children.map(c => c.classroom?.id).filter(id => id);
    if (classroomIds.length === 0) return;

    setLoading(true);
    const { announcements: data } = await getAnnouncementsForChildren(classroomIds);
    setAnnouncements(data || []);
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const filteredAnnouncements = filter === 'all'
    ? announcements
    : announcements.filter(a => a.priority === filter);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Avisos e Comunicados</h2>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por prioridade:
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {['urgent', 'high', 'normal', 'low'].map((priority) => (
            <button
              key={priority}
              onClick={() => setFilter(priority)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === priority
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getPriorityLabel(priority)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avisos...</p>
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-6 rounded-xl border-2 shadow-lg ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Megaphone className="w-6 h-6 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{announcement.title}</h3>
                    <p className="text-sm mb-3 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold whitespace-nowrap">
                  {getPriorityLabel(announcement.priority)}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                {announcement.classrooms && (
                  <span className="px-3 py-1 bg-white rounded-lg">
                    {announcement.classrooms.grade}ª {announcement.classrooms.name}
                  </span>
                )}
                {announcement.teachers?.users?.name && (
                  <span className="px-3 py-1 bg-white rounded-lg">
                    Prof. {announcement.teachers.users.name}
                  </span>
                )}
                <span className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg">
                  <Clock className="w-4 h-4" />
                  {new Date(announcement.publish_date).toLocaleDateString('pt-BR')}
                </span>
                {announcement.expires_at && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Expira: {new Date(announcement.expires_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            Nenhum aviso encontrado.
          </p>
          <p className="text-sm text-gray-400">
            Os avisos da escola aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}

export default SchoolAnnouncements;

