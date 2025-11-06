import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCog,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { StatCard, LoadingSpinner, Card, Container } from '../common';
import QuickActions from './QuickActions';
import CreateClassroomModal from './CreateClassroomModal';
import EnrollStudentModal from './EnrollStudentModal';

export default function Dashboard({ 
  onInviteTeacher, 
  onLinkParent 
}) {
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [showEnrollStudent, setShowEnrollStudent] = useState(false);
  const [stats, setStats] = useState({
    totalClassrooms: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
    classroomsWithoutTeacher: 0,
    studentsWithoutClassroom: 0,
    parentsWithoutChildren: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Total de turmas
      const { count: classroomsCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true });

      // Total de professores
      const { count: teachersCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      // Total de alunos
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Total de pais
      const { count: parentsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'parent');

      // Turmas sem professor
      const { data: allClassrooms } = await supabase
        .from('classrooms')
        .select(`
          id,
          classroom_teachers (
            id,
            is_active
          )
        `);

      const classroomsWithoutTeacher = allClassrooms?.filter(
        c => !c.classroom_teachers || c.classroom_teachers.filter(ct => ct.is_active).length === 0
      ).length || 0;

      // Alunos sem turma
      const { data: allStudents } = await supabase
        .from('students')
        .select(`
          id,
          classroom_students (
            id,
            is_active
          )
        `);

      const studentsWithoutClassroom = allStudents?.filter(
        s => !s.classroom_students || s.classroom_students.filter(cs => cs.is_active).length === 0
      ).length || 0;

      // Pais sem filhos
      const { data: allParents } = await supabase
        .from('users')
        .select(`
          id,
          parent_student_relation!parent_id (
            id
          )
        `)
        .eq('role', 'parent');

      const parentsWithoutChildren = allParents?.filter(
        p => !p.parent_student_relation || p.parent_student_relation.length === 0
      ).length || 0;

      setStats({
        totalClassrooms: classroomsCount || 0,
        totalTeachers: teachersCount || 0,
        totalStudents: studentsCount || 0,
        totalParents: parentsCount || 0,
        classroomsWithoutTeacher,
        studentsWithoutClassroom,
        parentsWithoutChildren,
      });

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando estatísticas..." className="py-12" />;
  }

  return (
    <Container size="lg" className="space-y-6 py-6 animate-fade-in">
      {/* Ações Rápidas */}
      <QuickActions 
        onCreateClassroom={() => setShowCreateClassroom(true)}
        onInviteTeacher={onInviteTeacher}
        onEnrollStudent={() => setShowEnrollStudent(true)}
        onLinkParent={onLinkParent}
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={BookOpen}
          title="Turmas"
          value={stats.totalClassrooms}
          subtitle={stats.classroomsWithoutTeacher > 0 ? `${stats.classroomsWithoutTeacher} sem professor` : 'Todas com professor'}
          color="purple"
        />
        <StatCard
          icon={UserCog}
          title="Professores"
          value={stats.totalTeachers}
          subtitle="Ativos no sistema"
          color="green"
        />
        <StatCard
          icon={GraduationCap}
          title="Alunos"
          value={stats.totalStudents}
          subtitle={stats.studentsWithoutClassroom > 0 ? `${stats.studentsWithoutClassroom} sem turma` : 'Todos matriculados'}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Pais/Responsáveis"
          value={stats.totalParents}
          subtitle={stats.parentsWithoutChildren > 0 ? `${stats.parentsWithoutChildren} sem vínculo` : 'Todos vinculados'}
          color="orange"
        />
      </div>

      {/* Alerts Section */}
      {(stats.classroomsWithoutTeacher > 0 || 
        stats.studentsWithoutClassroom > 0 || 
        stats.parentsWithoutChildren > 0) && (
        <Card variant="elevated" className="animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">Atenção Necessária</h2>
          </div>
          <div className="space-y-3">
            {stats.classroomsWithoutTeacher > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 transition-all hover:bg-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {stats.classroomsWithoutTeacher} turma(s) sem professor
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Atribua professores às turmas para que possam funcionar
                  </p>
                </div>
              </div>
            )}
            {stats.studentsWithoutClassroom > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 transition-all hover:bg-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {stats.studentsWithoutClassroom} aluno(s) sem turma
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Matricule os alunos em turmas para que possam estudar
                  </p>
                </div>
              </div>
            )}
            {stats.parentsWithoutChildren > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 transition-all hover:bg-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {stats.parentsWithoutChildren} pai(s)/mãe(s) sem vínculo
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vincule os pais aos seus filhos para que possam acompanhar o desempenho
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Success Message */}
      {stats.classroomsWithoutTeacher === 0 && 
       stats.studentsWithoutClassroom === 0 && 
       stats.parentsWithoutChildren === 0 && 
       (stats.totalClassrooms > 0 || stats.totalStudents > 0) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">
                Sistema configurado corretamente! ✅
              </p>
              <p className="text-sm text-gray-600">
                Todas as turmas têm professores, todos os alunos estão matriculados e todos os pais estão vinculados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions
        onCreateClassroom={() => setShowCreateClassroom(true)}
        onInviteTeacher={onInviteTeacher}
        onEnrollStudent={() => setShowEnrollStudent(true)}
        onLinkParent={onLinkParent}
      />

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribuição</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Turmas com Professor</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalClassrooms - stats.classroomsWithoutTeacher}/{stats.totalClassrooms}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{
                    width: stats.totalClassrooms > 0
                      ? `${((stats.totalClassrooms - stats.classroomsWithoutTeacher) / stats.totalClassrooms) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Alunos Matriculados</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalStudents - stats.studentsWithoutClassroom}/{stats.totalStudents}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all"
                  style={{
                    width: stats.totalStudents > 0
                      ? `${((stats.totalStudents - stats.studentsWithoutClassroom) / stats.totalStudents) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Pais Vinculados</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalParents - stats.parentsWithoutChildren}/{stats.totalParents}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: stats.totalParents > 0
                      ? `${((stats.totalParents - stats.parentsWithoutChildren) / stats.totalParents) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status do Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Última atualização</span>
              </div>
              <span className="text-sm text-gray-600">Agora</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Sistema Online</span>
              </div>
              <span className="text-sm font-semibold text-green-600">Ativo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Desempenho</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">Ótimo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateClassroom && (
        <CreateClassroomModal
          onClose={() => setShowCreateClassroom(false)}
          onSave={() => {
            setShowCreateClassroom(false);
            loadStats();
          }}
        />
      )}

      {showEnrollStudent && (
        <EnrollStudentModal
          onClose={() => setShowEnrollStudent(false)}
          onSave={() => {
            setShowEnrollStudent(false);
            loadStats();
          }}
        />
      )}
    </Container>
  );
}

