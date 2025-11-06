import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  X, 
  Link as LinkIcon,
  Trash2,
  UserPlus,
  Heart,
} from 'lucide-react';

export default function LinkParentToStudent({ onClose }) {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParent, setSearchParent] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [relationship, setRelationship] = useState('pai');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carregamento de dados...');

      // Buscar todos os pais (users)
      console.log('📥 Buscando pais (users)...');
      const { data: parentsUsersData, error: parentsUsersError } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .eq('role', 'parent')
        .order('name');

      console.log('📊 Resposta pais (users):', { data: parentsUsersData, error: parentsUsersError });
      if (parentsUsersError) throw parentsUsersError;

      // Buscar todos os pais (tabela parents para obter parent_id)
      console.log('📥 Buscando pais (parents table)...');
      const { data: parentsTableData, error: parentsTableError } = await supabase
        .from('parents')
        .select('id, user_id');

      console.log('📊 Resposta pais (parents table):', { data: parentsTableData, error: parentsTableError });
      if (parentsTableError) throw parentsTableError;

      // Buscar todos os alunos
      console.log('📥 Buscando alunos...');
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          grade,
          school,
          users (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .order('users(name)');

      console.log('📊 Resposta alunos:', { data: studentsData, error: studentsError });
      if (studentsError) throw studentsError;

      // Buscar vínculos existentes
      console.log('📥 Buscando vínculos...');
      const { data: linksData, error: linksError } = await supabase
        .from('parent_student_relation')
        .select(`
          id,
          parent_id,
          student_id,
          relationship,
          created_at
        `);

      console.log('📊 Resposta vínculos:', { data: linksData, error: linksError });
      if (linksError) throw linksError;

      // Enriquecer os vínculos com os nomes dos pais e alunos
      console.log('🔗 Enriquecendo vínculos...');
      const enrichedLinks = (linksData || []).map(link => {
        // Encontrar o parent na tabela parents pelo parent_id
        const parentTable = parentsTableData?.find(p => p.id === link.parent_id);
        // Encontrar o user correspondente
        const parentUser = parentsUsersData?.find(u => u.id === parentTable?.user_id);
        const student = studentsData?.find(s => s.id === link.student_id);
        
        return {
          ...link,
          parentName: parentUser?.name || 'Pai/Mãe',
          parentEmail: parentUser?.email || '',
          studentName: student?.users?.name || 'Aluno',
          studentEmail: student?.users?.email || '',
        };
      });

      console.log('✅ Dados carregados com sucesso:', {
        parents: parentsUsersData?.length || 0,
        students: studentsData?.length || 0,
        links: enrichedLinks?.length || 0,
      });

      setParents(parentsUsersData || []);
      setStudents(studentsData || []);
      setLinks(enrichedLinks);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('❌ Detalhes do erro:', error.message, error.details, error.hint);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!selectedParent) {
      toast.error('Selecione um pai/mãe');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Selecione pelo menos um filho');
      return;
    }

    try {
      setLinking(true);

      const { data: { user } } = await supabase.auth.getUser();

      // 🔥 BUSCAR O ID DA TABELA PARENTS CORRESPONDENTE AO USER_ID SELECIONADO
      console.log('🔍 Buscando parent_id para user_id:', selectedParent);
      
      // Primeiro, buscar sem .single() para ver quantos resultados existem
      const { data: parentDataArray, error: parentError } = await supabase
        .from('parents')
        .select('id, user_id')
        .eq('user_id', selectedParent);

      console.log('📊 Resposta da busca:', { data: parentDataArray, error: parentError });

      if (parentError) {
        console.error('❌ Erro ao buscar parent:', parentError);
        toast.error(`Erro ao buscar pai/mãe: ${parentError.message}`);
        setLinking(false);
        return;
      }

      if (!parentDataArray || parentDataArray.length === 0) {
        console.error('❌ Nenhum parent encontrado para user_id:', selectedParent);
        toast.error('Erro: Pai/Mãe não encontrado na tabela parents. Contate o administrador.');
        setLinking(false);
        return;
      }

      if (parentDataArray.length > 1) {
        console.warn('⚠️ Múltiplos parents encontrados:', parentDataArray);
      }

      const parentData = parentDataArray[0];
      const parentId = parentData.id;
      console.log('✅ parent_id encontrado:', parentId);

      // 🔥 VERIFICAR VÍNCULOS EXISTENTES DIRETAMENTE NO BANCO
      console.log('🔍 Verificando vínculos existentes no banco...');
      const { data: existingLinksData, error: existingLinksError } = await supabase
        .from('parent_student_relation')
        .select('student_id')
        .eq('parent_id', parentId)
        .in('student_id', selectedStudents);

      if (existingLinksError) {
        console.error('❌ Erro ao verificar vínculos existentes:', existingLinksError);
        toast.error('Erro ao verificar vínculos existentes');
        setLinking(false);
        return;
      }

      console.log('📊 Vínculos existentes encontrados:', existingLinksData);

      // Filtrar apenas os novos vínculos
      const existingStudentIds = new Set(existingLinksData?.map(link => link.student_id) || []);
      const newStudents = selectedStudents.filter(studentId => !existingStudentIds.has(studentId));

      console.log('📊 Alunos selecionados:', selectedStudents);
      console.log('📊 Alunos já vinculados:', Array.from(existingStudentIds));
      console.log('📊 Novos alunos a vincular:', newStudents);

      if (newStudents.length === 0) {
        toast.error('Todos os vínculos selecionados já existem!');
        setLinking(false);
        return;
      }

      // Criar apenas os novos vínculos
      const linksToCreate = newStudents.map(studentId => ({
        parent_id: parentId, // 🔥 USAR O parent_id DA TABELA PARENTS
        student_id: studentId,
        relationship,
        created_by: user?.id,
      }));

      console.log('📤 Criando vínculos:', linksToCreate);

      const { error } = await supabase
        .from('parent_student_relation')
        .insert(linksToCreate);

      if (error) throw error;

      const existingCount = existingStudentIds.size;
      const message = existingCount > 0
        ? `${newStudents.length} vínculo(s) criado(s)! (${existingCount} já existia(m))`
        : `${newStudents.length} vínculo(s) criado(s) com sucesso!`;

      toast.success(message);
      
      // Limpar seleções
      setSelectedParent(null);
      setSelectedStudents([]);
      setRelationship('pai');
      
      // Recarregar dados
      await loadData();

    } catch (error) {
      console.error('❌ Erro ao criar vínculo:', error);
      if (error.code === '23505') {
        toast.error('Este vínculo já existe');
      } else {
        toast.error(`Erro ao criar vínculo: ${error.message}`);
      }
    } finally {
      setLinking(false);
    }
  };

  const handleDeleteLink = async (linkId, parentName, studentName) => {
    if (!confirm(`Remover vínculo entre ${parentName} e ${studentName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('parent_student_relation')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast.success('Vínculo removido');
      await loadData();

    } catch (error) {
      console.error('❌ Erro ao remover vínculo:', error);
      toast.error('Erro ao remover vínculo');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const filteredParents = parents.filter(parent =>
    parent.name?.toLowerCase().includes(searchParent.toLowerCase()) ||
    parent.email?.toLowerCase().includes(searchParent.toLowerCase())
  );

  // 🔥 CRIAR MAPEAMENTO: user_id → parent_id (para filtrar alunos corretamente)
  const [parentIdForSelectedUser, setParentIdForSelectedUser] = React.useState(null);
  
  // Buscar parent_id quando um pai é selecionado
  React.useEffect(() => {
    const fetchParentId = async () => {
      if (!selectedParent) {
        setParentIdForSelectedUser(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('parents')
          .select('id')
          .eq('user_id', selectedParent)
          .single();
        
        if (!error && data) {
          setParentIdForSelectedUser(data.id);
        }
      } catch (err) {
        console.error('Erro ao buscar parent_id:', err);
      }
    };
    
    fetchParentId();
  }, [selectedParent]);
  
  // 🔥 FILTRAR ALUNOS: Remover alunos que já estão vinculados ao pai selecionado
  const filteredStudents = students.filter(student => {
    const user = student.users;
    
    // Filtro de busca
    const matchesSearch = (
      user?.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchStudent.toLowerCase())
    );
    
    if (!matchesSearch) return false;
    
    // Se um pai está selecionado, verificar se o aluno já está vinculado a ele
    if (selectedParent && parentIdForSelectedUser) {
      // Verificar se este aluno já está vinculado ao pai selecionado
      const isAlreadyLinked = links.some(link => 
        link.student_id === student.id && link.parent_id === parentIdForSelectedUser
      );
      
      return !isAlreadyLinked; // Mostrar apenas alunos NÃO vinculados
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6" />
                Vincular Pais aos Filhos
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Crie vínculos entre pais e alunos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Select Parent */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                1. Selecione o Pai/Mãe
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar pai/mãe..."
                  value={searchParent}
                  onChange={(e) => setSearchParent(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredParents.map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => setSelectedParent(parent.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedParent === parent.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                        {parent.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {parent.name || 'Sem nome'}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {parent.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Students */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                2. Selecione o(s) Filho(s)
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {selectedStudents.length > 0 && (
                <p className="text-sm text-green-600 mb-2">
                  {selectedStudents.length} selecionado(s)
                </p>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredStudents.map((student) => {
                  const user = student.users;
                  const isSelected = selectedStudents.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {user?.name || 'Sem nome'}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Relationship Type */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              3. Tipo de Relacionamento
            </h3>
            <div className="flex gap-3">
              {['pai', 'mãe', 'responsável'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRelationship(type)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    relationship === type
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Create Link Button */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCreateLink}
              disabled={!selectedParent || selectedStudents.length === 0 || linking}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              {linking ? 'Criando...' : `Criar Vínculo (${selectedStudents.length})`}
            </button>
          </div>

          {/* Existing Links */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vínculos Existentes ({links.length})
            </h3>
            {links.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum vínculo criado ainda</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                        {link.parentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {link.parentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {link.relationship} de {link.studentName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id, link.parentName, link.studentName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

