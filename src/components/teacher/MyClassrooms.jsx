import React, { useState } from 'react';
import { BookOpen, Users, Clock, Calendar, ChevronRight } from 'lucide-react';

export default function MyClassrooms({ classrooms, onSelectClassroom }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.grade?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Turmas</h2>
        <div className="text-sm text-gray-600">
          {classrooms.length} {classrooms.length === 1 ? 'turma' : 'turmas'}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar turma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Classrooms Grid */}
      {filteredClassrooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
              onClick={() => onSelectClassroom(classroom)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {classroom.grade && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-base font-black rounded-lg shadow-lg">
                      {classroom.grade}ª
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Turma {classroom.name}</h3>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>
                    {classroom.shift === 'morning' ? '🌅 Manhã' :
                     classroom.shift === 'afternoon' ? '☀️ Tarde' :
                     classroom.shift === 'evening' ? '🌙 Noite' :
                     '⏰ Integral'}
                  </span>
                </div>

                {classroom.school_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{classroom.school_year}</span>
                  </div>
                )}

                {classroom.max_students && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Máx. {classroom.max_students} alunos</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma turma encontrada.</p>
        </div>
      )}
    </div>
  );
}

