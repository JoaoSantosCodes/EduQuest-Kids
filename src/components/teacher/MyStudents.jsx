import React, { useState } from 'react';
import { Users, Mail, Phone, BookOpen, Search } from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';

export default function MyStudents({ students }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter((student) =>
    student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Meus Alunos</h2>
        <div className="text-sm text-gray-600">
          {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar aluno por nome, email ou matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 cursor-pointer"
            >
              {/* Avatar and Name */}
              <div className="flex items-center gap-3 mb-4">
                {student.users?.avatar_url ? (
                  <img
                    src={student.users.avatar_url}
                    alt={student.users.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                    {student.users?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-800 truncate">
                    {student.users?.name || 'Sem nome'}
                  </h3>
                  {student.enrollment_number && (
                    <p className="text-xs text-gray-500">
                      Mat: {student.enrollment_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {student.users?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{student.users.email}</span>
                  </div>
                )}
                {student.users?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{student.users.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum aluno encontrado.' : 'Nenhum aluno nas suas turmas.'}
          </p>
        </div>
      )}

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

