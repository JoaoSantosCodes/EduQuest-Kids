import React, { useState } from 'react';
import {
  Search,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  CheckCircle,
  ClipboardList,
  X,
} from 'lucide-react';

function MyChildren({ children, selectedChild, onSelectChild }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const filteredChildren = children?.filter(child =>
    child.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getGradeColor = (grade) => {
    if (grade >= 7) return 'text-green-600 bg-green-100';
    if (grade >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleChildClick = (child) => {
    onSelectChild(child);
    setShowProfile(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Meus Filhos</h2>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Children Grid */}
      {filteredChildren.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChildren.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500"
              onClick={() => handleChildClick(child)}
            >
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 mb-4">
                {child.users?.avatar_url ? (
                  <img
                    src={child.users.avatar_url}
                    alt={child.users?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                    {child.users?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{child.users?.name}</h3>
                  {child.enrollment_number && (
                    <p className="text-sm text-gray-600">Mat: {child.enrollment_number}</p>
                  )}
                </div>
              </div>

              {/* Classroom Info */}
              {child.classroom && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-800">
                      {child.classroom.grade}ª {child.classroom.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {child.classroom.shift === 'morning' ? '🌅 Manhã' : 
                     child.classroom.shift === 'afternoon' ? '☀️ Tarde' : 
                     child.classroom.shift === 'evening' ? '🌙 Noite' : '⏰ Integral'}
                    {' • '}
                    {child.classroom.school_year}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Média Geral</span>
                  </div>
                  <span className={`font-bold px-2 py-1 rounded ${getGradeColor(child.averageGrade || 0)}`}>
                    {child.averageGrade?.toFixed(1) || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Frequência</span>
                  </div>
                  <span className={`font-bold ${getAttendanceColor(child.attendancePercentage || 0)}`}>
                    {child.attendancePercentage || 0}%
                  </span>
                </div>

                {child.pendingAssignments > 0 && (
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600">Atividades Pendentes</span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {child.pendingAssignments}
                    </span>
                  </div>
                )}
              </div>

              {/* Relationship Type */}
              {child.relationship_type && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Vínculo: {
                      child.relationship_type === 'father' ? 'Pai' :
                      child.relationship_type === 'mother' ? 'Mãe' :
                      child.relationship_type === 'guardian' ? 'Responsável' :
                      child.relationship_type
                    }
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {searchTerm ? 'Nenhum filho encontrado com esse termo de busca.' : 'Nenhum filho vinculado.'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-gray-400">
              Entre em contato com a coordenação para vincular seus filhos.
            </p>
          )}
        </div>
      )}

      {/* Child Profile Modal */}
      {showProfile && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedChild.users?.avatar_url ? (
                    <img
                      src={selectedChild.users.avatar_url}
                      alt={selectedChild.users?.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold text-2xl border-4 border-white">
                      {selectedChild.users?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedChild.users?.name}</h2>
                    {selectedChild.enrollment_number && (
                      <p className="text-purple-100">Matrícula: {selectedChild.enrollment_number}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Classroom Info */}
              {selectedChild.classroom && (
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Informações da Turma
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Série</p>
                      <p className="font-semibold text-gray-800">{selectedChild.classroom.grade}ª Série</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Turma</p>
                      <p className="font-semibold text-gray-800">{selectedChild.classroom.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Turno</p>
                      <p className="font-semibold text-gray-800">
                        {selectedChild.classroom.shift === 'morning' ? '🌅 Manhã' : 
                         selectedChild.classroom.shift === 'afternoon' ? '☀️ Tarde' : 
                         selectedChild.classroom.shift === 'evening' ? '🌙 Noite' : '⏰ Integral'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ano Letivo</p>
                      <p className="font-semibold text-gray-800">{selectedChild.classroom.school_year}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedChild.users?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{selectedChild.users.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedChild.users?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-semibold text-gray-800">{selectedChild.users.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedChild.users?.birth_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Data de Nascimento</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(selectedChild.users.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedChild.users?.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Endereço</p>
                        <p className="font-semibold text-gray-800">{selectedChild.users.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Média Geral</p>
                  <p className={`text-3xl font-bold ${getGradeColor(selectedChild.averageGrade || 0).split(' ')[0]}`}>
                    {selectedChild.averageGrade?.toFixed(1) || '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{selectedChild.totalGrades} avaliações</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Frequência</p>
                  <p className={`text-3xl font-bold ${getAttendanceColor(selectedChild.attendancePercentage || 0)}`}>
                    {selectedChild.attendancePercentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{selectedChild.totalAttendance} registros</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 text-center">
                  <ClipboardList className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Atividades Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {selectedChild.pendingAssignments || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">aguardando entrega</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-6 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowProfile(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyChildren;

