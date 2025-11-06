import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Search, GraduationCap, Mail, School, Award, Loader2, Filter, Edit } from 'lucide-react';
import EditStudentProfile from './EditStudentProfile';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Iniciando busca de alunos...');
      
      // Buscar TODOS os alunos com todos os campos
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          users(id, email, name, created_at, avatar_url, phone, address, birth_date, gender)
        `)
        .order('created_at', { ascending: false });

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
      }

      console.log('✅ Alunos carregados:', data?.length || 0, data);
      setStudents(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar alunos:', error);
      console.error('❌ Stack trace:', error.stack);
      toast.error(`Erro ao carregar alunos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar alunos por busca e série
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || student.grade === parseInt(filterGrade);
    
    return matchesSearch && matchesGrade;
  });

  // Agrupar alunos por série
  const studentsByGrade = filteredStudents.reduce((acc, student) => {
    const grade = student.grade || 'Sem série';
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(student);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gerenciar Alunos</h2>
            <p className="text-gray-600 text-sm mt-1">
              {students.length} {students.length === 1 ? 'aluno' : 'alunos'} cadastrado(s)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou escola..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
            />
          </div>

          {/* Filtro por Série */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="pl-10 pr-8 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none appearance-none bg-white cursor-pointer"
            >
              <option value="all">Todas as Séries</option>
              <option value="1">1ª série</option>
              <option value="2">2ª série</option>
              <option value="3">3ª série</option>
              <option value="4">4ª série</option>
              <option value="5">5ª série</option>
              <option value="6">6ª série</option>
              <option value="7">7ª série</option>
              <option value="8">8ª série</option>
              <option value="9">9ª série</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Alunos */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum aluno encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterGrade !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Ainda não há alunos cadastrados no sistema'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Agrupado por Série */}
          {Object.keys(studentsByGrade)
            .sort((a, b) => {
              if (a === 'Sem série') return 1;
              if (b === 'Sem série') return -1;
              return parseInt(a) - parseInt(b);
            })
            .map((grade) => (
              <div key={grade} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header da Série */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {grade === 'Sem série' ? grade : `${grade}ª série`}
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                      {studentsByGrade[grade].length} {studentsByGrade[grade].length === 1 ? 'aluno' : 'alunos'}
                    </span>
                  </h3>
                </div>

                {/* Lista de Alunos da Série */}
                <div className="p-4 space-y-3">
                  {studentsByGrade[grade].map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border-2 border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {student.users?.name?.charAt(0).toUpperCase() || '?'}
                        </div>

                        {/* Informações do Aluno */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">
                            {student.users?.name || 'Nome não informado'}
                          </h4>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {student.users?.email || 'Email não informado'}
                            </p>
                            {student.school && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <School className="w-4 h-4" />
                                {student.school}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="hidden md:flex gap-6 text-center">
                          <div>
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Award className="w-5 h-5" />
                              <span className="font-bold text-lg">{student.total_points || 0}</span>
                            </div>
                            <p className="text-xs text-gray-500">Pontos</p>
                          </div>
                          <div>
                            <div className="font-bold text-lg text-purple-600">
                              {student.level || 1}
                            </div>
                            <p className="text-xs text-gray-500">Nível</p>
                          </div>
                        </div>
                      </div>

                      {/* Data de Cadastro e Ações */}
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Cadastrado em
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(student.users?.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar perfil completo"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Estatísticas Gerais */}
      {filteredStudents.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-10 h-10" />
              <div>
                <p className="text-sm opacity-90">Total de Alunos</p>
                <p className="text-3xl font-bold">{filteredStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10" />
              <div>
                <p className="text-sm opacity-90">Total de Pontos</p>
                <p className="text-3xl font-bold">
                  {filteredStudents.reduce((sum, s) => sum + (s.total_points || 0), 0).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <School className="w-10 h-10" />
              <div>
                <p className="text-sm opacity-90">Séries Ativas</p>
                <p className="text-3xl font-bold">{Object.keys(studentsByGrade).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Profile Modal */}
      {editingStudent && (
        <EditStudentProfile
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={() => {
            setEditingStudent(null);
            loadStudents();
          }}
        />
      )}
    </div>
  );
}

