import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { X, Users, Clock, Calendar, BookOpen, Mail, Phone, ArrowLeft } from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';

export default function ClassroomDetails({ classroom, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [classroom.id]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          enrolled_at,
          students (
            id,
            enrollment_number,
            users (
              id,
              name,
              email,
              phone,
              avatar_url
            )
          )
        `)
        .eq('classroom_id', classroom.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      setStudents(data?.map(cs => ({
        ...cs.students,
        enrolled_at: cs.enrolled_at
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {classroom.grade && (
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-xl font-black rounded-xl">
                {classroom.grade}ª SÉRIE
              </span>
            )}
            <div>
              <h2 className="text-3xl font-bold">Turma {classroom.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {classroom.shift === 'morning' ? '🌅 Manhã' :
                   classroom.shift === 'afternoon' ? '☀️ Tarde' :
                   classroom.shift === 'evening' ? '🌙 Noite' :
                   '⏰ Integral'}
                </span>
                {classroom.school_year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {classroom.school_year}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {students.length} aluno{students.length !== 1 ? 's' : ''}
                  {classroom.max_students && ` / ${classroom.max_students}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar aluno por nome, email ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Students List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando alunos...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {student.users?.avatar_url ? (
                        <img
                          src={student.users.avatar_url}
                          alt={student.users.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {student.users?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">
                        {student.users?.name || 'Sem nome'}
                      </h3>
                      
                      {student.enrollment_number && (
                        <p className="text-xs text-gray-500 mb-2">
                          Matrícula: {student.enrollment_number}
                        </p>
                      )}

                      <div className="space-y-1">
                        {student.users?.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{student.users.email}</span>
                          </div>
                        )}
                        {student.users?.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{student.users.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum aluno encontrado.' : 'Nenhum aluno matriculado nesta turma.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

