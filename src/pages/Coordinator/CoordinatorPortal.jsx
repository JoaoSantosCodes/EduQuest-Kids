import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCoordinator } from '../../hooks/useCoordinator';
import { useSubjects } from '../../hooks/useSubjects';
import {
  getAllClassrooms,
  getAllTeachers,
  assignTeacherToClassroom,
  removeTeacherFromClassroom,
  setPrimaryTeacher,
  createClassroomAsCoordinator,
  updateClassroomAsCoordinator,
  deleteClassroomAsCoordinator,
  getClassroomTeachers,
} from '../../services/coordinatorsService';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  X,
  Star,
  Search,
  GraduationCap,
  Settings,
  LogOut,
  UserCog,
  Home,
} from 'lucide-react';
import ManageTeachers from '../../components/coordinator/ManageTeachers';
import ManageStudents from '../../components/coordinator/ManageStudents';
import ManageParents from '../../components/coordinator/ManageParents';
import ManageClassroomStudents from '../../components/coordinator/ManageClassroomStudents';
import LinkParentToStudent from '../../components/coordinator/LinkParentToStudent';
import Dashboard from '../../components/coordinator/Dashboard';
import ProfileSettings from '../../components/profile/ProfileSettings';

function CoordinatorPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { coordinator, classrooms, teachers, loading: coordinatorLoading, refreshClassrooms } = useCoordinator();
  const { subjects } = useSubjects();

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'classrooms', 'teachers', 'students', 'parents'
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomTeachers, setClassroomTeachers] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [classroomToManage, setClassroomToManage] = useState(null);
  const [gradeFilter, setGradeFilter] = useState('all'); // 'all', 6, 7, 8, 9
  const [showLinkParentStudent, setShowLinkParentStudent] = useState(false);

  // Debug: Verificar professores carregados
  useEffect(() => {
    console.log('👥 Professores disponíveis:', teachers);
    console.log('📚 Total de professores:', teachers?.length || 0);
  }, [teachers]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newClassroom, setNewClassroom] = useState({
    name: '',
    grade_level: 7,
    school: '',
    subject_id: '',
    description: '',
    teacher_ids: [],
  });

  useEffect(() => {
    if (selectedClassroom) {
      loadClassroomTeachers();
    }
  }, [selectedClassroom]);

  const loadClassroomTeachers = async () => {
    if (!selectedClassroom) return;

    try {
      console.log('🔄 Carregando professores da turma:', selectedClassroom.id);
      const { teachers: data, error } = await getClassroomTeachers(selectedClassroom.id);

      if (error) throw new Error(error);
      console.log('✅ Professores carregados:', data);
      setClassroomTeachers(data || []);
    } catch (error) {
      console.error('Erro ao carregar professores da turma:', error);
      toast.error('Erro ao carregar professores');
      setClassroomTeachers([]); // Garantir que está vazio em caso de erro
    }
  };

  const handleCreateClassroom = async () => {
    try {
      if (!newClassroom.name) {
        toast.error('Nome da turma é obrigatório');
        return;
      }

      if (!coordinator?.id) {
        toast.error('Erro: dados do coordenador não encontrados');
        return;
      }

      // Buscar user_id do coordenador
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const { classroom, error } = await createClassroomAsCoordinator(
        {
          ...newClassroom,
          assigned_by: authUser?.id,
        },
        coordinator.id
      );

      if (error) throw new Error(error);

      toast.success('Turma criada com sucesso!');
      setShowCreateModal(false);
      setNewClassroom({
        name: '',
        grade_level: 7,
        school: '',
        subject_id: '',
        description: '',
        teacher_ids: [],
      });
      await refreshClassrooms();
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error(error.message || 'Erro ao criar turma');
    }
  };

  const handleUpdateClassroom = async () => {
    if (!editingClassroom) return;

    try {
      const { classroom, error } = await updateClassroomAsCoordinator(editingClassroom.id, {
        name: editingClassroom.name,
        grade_level: editingClassroom.grade_level,
        school: editingClassroom.school || '',
        subject_id: editingClassroom.subject_id || null,
        description: editingClassroom.description || '',
      });

      if (error) throw new Error(error);

      toast.success('Turma atualizada com sucesso!');
      setEditingClassroom(null);
      setShowEditModal(false);
      await refreshClassrooms();
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast.error(error.message || 'Erro ao atualizar turma');
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (!confirm('Tem certeza que deseja excluir esta turma? Todos os relacionamentos serão removidos.')) return;

    try {
      const { error } = await deleteClassroomAsCoordinator(classroomId);

      if (error) throw new Error(error);

      toast.success('Turma excluída com sucesso!');
      await refreshClassrooms();
      if (selectedClassroom?.id === classroomId) {
        setSelectedClassroom(null);
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast.error(error.message || 'Erro ao excluir turma');
    }
  };

  const handleAssignTeacher = async (teacherId) => {
    if (!selectedClassroom) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const { assignment, error } = await assignTeacherToClassroom(
        selectedClassroom.id,
        teacherId,
        false, // Não é principal por padrão
        authUser?.id
      );

      if (error) throw new Error(error);

      toast.success('Professor atribuído à turma!');
      setShowAssignModal(false);
      await loadClassroomTeachers();
      await refreshClassrooms();
    } catch (error) {
      console.error('Erro ao atribuir professor:', error);
      console.error('Detalhes do erro:', error);
      toast.error(error.message || 'Erro ao atribuir professor');
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!selectedClassroom) return;

    if (!confirm('Tem certeza que deseja remover este professor da turma?')) return;

    try {
      const { error } = await removeTeacherFromClassroom(selectedClassroom.id, teacherId);

      if (error) throw new Error(error);

      toast.success('Professor removido da turma!');
      await loadClassroomTeachers();
      await refreshClassrooms();
    } catch (error) {
      console.error('Erro ao remover professor:', error);
      toast.error(error.message || 'Erro ao remover professor');
    }
  };

  const handleSetPrimaryTeacher = async (teacherId) => {
    if (!selectedClassroom) return;

    try {
      const { assignment, error } = await setPrimaryTeacher(selectedClassroom.id, teacherId);

      if (error) throw new Error(error);

      toast.success('Professor principal definido!');
      await loadClassroomTeachers();
      await refreshClassrooms();
    } catch (error) {
      console.error('Erro ao definir professor principal:', error);
      toast.error(error.message || 'Erro ao definir professor principal');
    }
  };

  const filteredClassrooms = classrooms.filter((classroom) => {
    // Filtro de busca por nome ou escola
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.school?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de série
    const matchesGrade = gradeFilter === 'all' || classroom.grade_level === gradeFilter;
    
    return matchesSearch && matchesGrade;
  });

  // Calcular professores disponíveis
  const availableTeachers = useMemo(() => {
    console.log('🔍 Calculando professores disponíveis...');
    console.log('  - Turma selecionada:', selectedClassroom?.name);
    console.log('  - Total de professores:', teachers?.length || 0);
    console.log('  - Professores atribuídos:', classroomTeachers?.length || 0);
    
    if (!selectedClassroom || !teachers || teachers.length === 0) {
      console.log('  ❌ Sem turma ou sem professores');
      return [];
    }
    
    // Se não há professores atribuídos, todos estão disponíveis
    if (!classroomTeachers || classroomTeachers.length === 0) {
      console.log('  ✅ Todos os professores disponíveis:', teachers.length);
      return teachers;
    }
    
    // Filtrar professores que já estão atribuídos
    const assignedIds = classroomTeachers
      .map((t) => t.id)
      .filter((id) => id !== null && id !== undefined);
    
    const available = teachers.filter((teacher) => !assignedIds.includes(teacher.id));
    console.log('  ✅ Professores disponíveis após filtro:', available.length);
    
    return available;
  }, [teachers, classroomTeachers, selectedClassroom]);

  if (coordinatorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Portal do Coordenador</h1>
                <p className="text-sm text-gray-500">{coordinator?.name || user?.name || 'Coordenador'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Perfil
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('classrooms')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                currentView === 'classrooms'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Turmas
            </button>
            <button
              onClick={() => setCurrentView('teachers')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                currentView === 'teachers'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCog className="w-5 h-5" />
              Professores
            </button>
            <button
              onClick={() => setCurrentView('students')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                currentView === 'students'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              Alunos
            </button>
            <button
              onClick={() => setCurrentView('parents')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                currentView === 'parents'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Pais
            </button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'dashboard' ? (
          <Dashboard 
            onInviteTeacher={() => setCurrentView('teachers')}
            onLinkParent={() => setShowLinkParentStudent(true)}
          />
        ) : currentView === 'teachers' ? (
          <div className="bg-white rounded-xl shadow-lg">
            <ManageTeachers coordinatorData={coordinator} />
          </div>
        ) : currentView === 'students' ? (
          <div className="bg-white rounded-xl shadow-lg">
            <ManageStudents />
          </div>
        ) : currentView === 'parents' ? (
          <div className="bg-white rounded-xl shadow-lg">
            <ManageParents onLinkClick={() => setShowLinkParentStudent(true)} />
          </div>
        ) : currentView === 'classrooms' ? (
          /* Classrooms View */
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Turmas</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nova Turma
                </button>
              </div>

              {/* Grade Filter */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Filtrar por Série:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGradeFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      gradeFilter === 'all'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  {[6, 7, 8, 9].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setGradeFilter(grade)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        gradeFilter === grade
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {grade}ª Série
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar turmas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Classrooms Grid */}
            {filteredClassrooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClassrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedClassroom?.id === classroom.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                    onClick={() => setSelectedClassroom(classroom)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{classroom.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingClassroom(classroom);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClassroom(classroom.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{classroom.grade_level}ª série</p>
                    {classroom.subjects && (
                      <p className="text-sm text-gray-500">{classroom.subjects.name}</p>
                    )}
                    {classroom.school && (
                      <p className="text-xs text-gray-400">{classroom.school}</p>
                    )}
                    {classroom.classroom_teachers && classroom.classroom_teachers.filter(ct => ct.is_active).length > 0 && (
                      <p className="text-xs text-purple-600 mt-2">
                        {classroom.classroom_teachers.filter(ct => ct.is_active).length} professor(es)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Nenhuma turma encontrada.</p>
                <p className="text-sm text-gray-500 mt-2">Clique em "Nova Turma" para começar.</p>
              </div>
            )}

            {/* Selected Classroom Details */}
            {selectedClassroom && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{selectedClassroom.name}</h3>
                  <button
                    onClick={() => setSelectedClassroom(null)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4 flex gap-3">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Atribuir Professor
                  </button>
                  <button
                    onClick={() => {
                      setClassroomToManage(selectedClassroom);
                      setShowManageStudents(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Gerenciar Alunos
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Professores Atribuídos</h4>
                  {classroomTeachers.length > 0 ? (
                    <div className="space-y-2">
                      {classroomTeachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800">{teacher.name || 'N/A'}</p>
                                {teacher.isPrimary && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{teacher.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!teacher.isPrimary && (
                              <button
                                onClick={() => handleSetPrimaryTeacher(teacher.id)}
                                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                title="Definir como principal"
                              >
                                Principal
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveTeacher(teacher.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhum professor atribuído ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nova Turma</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Ex: 7º Ano A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <select
                  value={newClassroom.grade_level}
                  onChange={(e) => setNewClassroom({ ...newClassroom, grade_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}ª série
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria (opcional)</label>
                <select
                  value={newClassroom.subject_id}
                  onChange={(e) => setNewClassroom({ ...newClassroom, subject_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="">Nenhuma</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola (opcional)</label>
                <input
                  type="text"
                  value={newClassroom.school}
                  onChange={(e) => setNewClassroom({ ...newClassroom, school: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Nome da escola"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateClassroom}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Classroom Modal */}
      {showEditModal && editingClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Turma</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={editingClassroom.name}
                  onChange={(e) => setEditingClassroom({ ...editingClassroom, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <select
                  value={editingClassroom.grade_level}
                  onChange={(e) => setEditingClassroom({ ...editingClassroom, grade_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}ª série
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria (opcional)</label>
                <select
                  value={editingClassroom.subject_id || ''}
                  onChange={(e) => setEditingClassroom({ ...editingClassroom, subject_id: e.target.value || null })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="">Nenhuma</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClassroom(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateClassroom}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && selectedClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Atribuir Professor à Turma</h3>
            <div className="space-y-4">
              {teachers && teachers.length > 0 ? (
                availableTeachers.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{teacher.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{teacher.email || 'N/A'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignTeacher(teacher.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Atribuir
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Todos os professores já estão atribuídos a esta turma.
                  </div>
                )
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhum professor cadastrado no sistema ainda.
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}

      {/* Manage Classroom Students Modal */}
      {showManageStudents && classroomToManage && (
        <ManageClassroomStudents
          classroom={classroomToManage}
          onClose={() => {
            setShowManageStudents(false);
            setClassroomToManage(null);
            refreshClassrooms(); // Recarregar turmas após mudanças
          }}
        />
      )}

      {/* Link Parent to Student Modal */}
      {showLinkParentStudent && (
        <LinkParentToStudent
          onClose={() => setShowLinkParentStudent(false)}
        />
      )}
    </div>
  );
}

export default CoordinatorPortal;
