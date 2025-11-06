import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParent } from '../../hooks/useParent';
import { searchAvailableStudents, linkParentToStudent, unlinkParentFromStudent } from '../../services/parentStudentRelationService';
import { getParentByUserId } from '../../services/parentsService';
import { toast } from 'sonner';
import { Search, UserPlus, X, Users, Mail, GraduationCap } from 'lucide-react';

export default function LinkChildView() {
  const { user } = useAuth();
  const { parent, children, refreshChildren } = useParent();
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState('responsável');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchStudents();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailableStudents([]);
    }
  }, [searchTerm]);

  const searchStudents = async () => {
    try {
      setSearching(true);
      const { students, error } = await searchAvailableStudents(searchTerm);
      
      if (error) throw new Error(error);
      
      // Filtrar alunos que já estão vinculados
      const linkedStudentIds = children?.map(child => child.id) || [];
      
      const filtered = students.filter(student => !linkedStudentIds.includes(student.id));
      setAvailableStudents(filtered);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast.error('Erro ao buscar alunos');
    } finally {
      setSearching(false);
    }
  };

  const handleLinkStudent = async (student) => {
    if (!parent?.id) {
      toast.error('Erro: dados do pai não encontrados');
      return;
    }

    try {
      setLinking(true);
      const { relation, error } = await linkParentToStudent(
        parent.id,
        student.id,
        selectedRelationship
      );

      if (error) throw new Error(error);
      
      toast.success(`Filho vinculado com sucesso!`);
      await refreshChildren();
      setSearchTerm('');
      setAvailableStudents([]);
    } catch (error) {
      console.error('Erro ao vincular filho:', error);
      toast.error(error.message || 'Erro ao vincular filho');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkStudent = async (studentId) => {
    if (!parent?.id) {
      toast.error('Erro: dados do pai não encontrados');
      return;
    }

    if (!confirm('Tem certeza que deseja desvincular este filho?')) {
      return;
    }

    try {
      const { error } = await unlinkParentFromStudent(parent.id, studentId);

      if (error) throw new Error(error);
      
      toast.success('Filho desvinculado com sucesso!');
      await refreshChildren();
    } catch (error) {
      console.error('Erro ao desvincular filho:', error);
      toast.error(error.message || 'Erro ao desvincular filho');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Gerenciar Filhos
        </h2>

        {/* Buscar e vincular novo filho */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Vincular Novo Filho</h3>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
              <select
                value={selectedRelationship}
                onChange={(e) => setSelectedRelationship(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              >
                <option value="pai">Pai</option>
                <option value="mãe">Mãe</option>
                <option value="responsável">Responsável</option>
              </select>
            </div>

            {searching && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            )}

            {availableStudents.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600 mb-2">Resultados da busca:</p>
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{student.users?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.users?.email || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">{student.grade}ª série - {student.school || 'N/A'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLinkStudent(student)}
                      disabled={linking}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Vincular
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm.length >= 2 && !searching && availableStudents.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Nenhum aluno encontrado. Verifique se o nome ou email estão corretos.
              </div>
            )}
          </div>
        </div>

        {/* Lista de filhos vinculados */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Filhos Vinculados</h3>
          
          {children && Array.isArray(children) && children.length > 0 ? (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{child.users?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{child.grade}ª série - {child.school || 'N/A'}</p>
                      <p className="text-xs text-gray-400 capitalize">Relacionamento: {child.relationship || 'N/A'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlinkStudent(child.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Desvincular
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum filho vinculado ainda.</p>
              <p className="text-sm mt-2">Use a busca acima para vincular um filho.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

