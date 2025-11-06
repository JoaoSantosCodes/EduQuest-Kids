import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Camera, X, Upload, Loader2, UserCog, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';

export default function EditTeacherProfile({ teacher, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  
  // Dados do usuário (tabela users)
  const [userData, setUserData] = useState({
    name: teacher?.users?.name || '',
    email: teacher?.users?.email || '',
    phone: teacher?.users?.phone || '',
    address: teacher?.users?.address || '',
    birth_date: teacher?.users?.birth_date || '',
    avatar_url: teacher?.users?.avatar_url || '',
    gender: teacher?.users?.gender || '',
  });

  // Dados do professor (tabela teachers)
  const [teacherData, setTeacherData] = useState({
    school: teacher?.school || '',
    specialization: teacher?.specialization || '',
    subjects: [], // IDs das matérias
    classrooms: [], // IDs das turmas
  });

  const [previewUrl, setPreviewUrl] = useState(teacher?.users?.avatar_url || null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setUserData({
      name: teacher?.users?.name || '',
      email: teacher?.users?.email || '',
      phone: teacher?.users?.phone || '',
      address: teacher?.users?.address || '',
      birth_date: teacher?.users?.birth_date || '',
      avatar_url: teacher?.users?.avatar_url || '',
      gender: teacher?.users?.gender || '',
    });
    setTeacherData({
      school: teacher?.school || '',
      specialization: teacher?.specialization || '',
      subjects: [],
      classrooms: [],
    });
    setPreviewUrl(teacher?.users?.avatar_url || null);
  }, [teacher]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Buscar matérias
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;

      // Buscar turmas
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id, name, grade, shift, school_year, max_students, description')
        .order('grade', { ascending: true })
        .order('name', { ascending: true });

      if (classroomsError) throw classroomsError;

      console.log('📚 Turmas carregadas:', classroomsData);
      console.log('📊 Primeira turma:', classroomsData?.[0]);

      // Buscar matérias do professor
      const { data: teacherSubjects, error: teacherSubjectsError } = await supabase
        .from('teacher_subjects')
        .select('subject_id')
        .eq('teacher_id', teacher.id);

      if (teacherSubjectsError) throw teacherSubjectsError;

      // Buscar turmas do professor
      const { data: teacherClassrooms, error: teacherClassroomsError } = await supabase
        .from('classroom_teachers')
        .select('classroom_id')
        .eq('teacher_id', teacher.id)
        .eq('is_active', true);

      if (teacherClassroomsError) throw teacherClassroomsError;

      setSubjects(subjectsData || []);
      setClassrooms(classroomsData || []);
      setTeacherData((prev) => ({
        ...prev,
        subjects: teacherSubjects?.map((ts) => ts.subject_id) || [],
        classrooms: teacherClassrooms?.map((tc) => tc.classroom_id) || [],
      }));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${teacher.user_id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      setUserData((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSubject = (subjectId) => {
    setTeacherData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleToggleClassroom = (classroomId) => {
    setTeacherData((prev) => ({
      ...prev,
      classrooms: prev.classrooms.includes(classroomId)
        ? prev.classrooms.filter((id) => id !== classroomId)
        : [...prev.classrooms, classroomId],
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validações
      if (!userData.name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      console.log('💾 Salvando dados do professor...', {
        userId: teacher.user_id,
        teacherId: teacher.id,
        userData,
        teacherData,
      });

      // 1. Atualizar dados do usuário (tabela users)
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          phone: userData.phone || null,
          address: userData.address || null,
          birth_date: userData.birth_date || null,
          avatar_url: userData.avatar_url || null,
          gender: userData.gender || null,
        })
        .eq('id', teacher.user_id);

      if (userError) {
        console.error('❌ Erro ao atualizar usuário:', userError);
        throw userError;
      }

      // 2. Atualizar dados do professor (tabela teachers)
      const { error: teacherError } = await supabase
        .from('teachers')
        .update({
          school: teacherData.school || null,
          specialization: teacherData.specialization || null,
        })
        .eq('id', teacher.id);

      if (teacherError) {
        console.error('❌ Erro ao atualizar professor:', teacherError);
        throw teacherError;
      }

      // 3. Atualizar matérias do professor
      // Deletar matérias antigas
      const { error: deleteSubjectsError } = await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', teacher.id);

      if (deleteSubjectsError) {
        console.error('❌ Erro ao deletar matérias antigas:', deleteSubjectsError);
        throw deleteSubjectsError;
      }

      // Inserir novas matérias
      if (teacherData.subjects.length > 0) {
        const subjectsToInsert = teacherData.subjects.map((subjectId) => ({
          teacher_id: teacher.id,
          subject_id: subjectId,
        }));

        const { error: insertSubjectsError } = await supabase
          .from('teacher_subjects')
          .insert(subjectsToInsert);

        if (insertSubjectsError) {
          console.error('❌ Erro ao inserir matérias:', insertSubjectsError);
          throw insertSubjectsError;
        }
      }

      // 4. Atualizar turmas do professor
      // Desativar turmas antigas
      const { error: deactivateClassroomsError } = await supabase
        .from('classroom_teachers')
        .update({ is_active: false })
        .eq('teacher_id', teacher.id);

      if (deactivateClassroomsError) {
        console.error('❌ Erro ao desativar turmas antigas:', deactivateClassroomsError);
        throw deactivateClassroomsError;
      }

      // Inserir/ativar novas turmas
      if (teacherData.classrooms.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        
        for (const classroomId of teacherData.classrooms) {
          // Verificar se já existe
          const { data: existing } = await supabase
            .from('classroom_teachers')
            .select('id')
            .eq('teacher_id', teacher.id)
            .eq('classroom_id', classroomId)
            .single();

          if (existing) {
            // Reativar
            await supabase
              .from('classroom_teachers')
              .update({ is_active: true })
              .eq('id', existing.id);
          } else {
            // Inserir novo
            await supabase
              .from('classroom_teachers')
              .insert({
                teacher_id: teacher.id,
                classroom_id: classroomId,
                assigned_by: user?.id,
                is_active: true,
              });
          }
        }
      }

      console.log('✅ Dados do professor salvos com sucesso!');
      toast.success('Perfil do professor atualizado com sucesso!');
      
      if (onSave) {
        onSave();
      }
      
      if (onClose) {
        setTimeout(() => {
          onClose();
          // Forçar reload completo para limpar cache
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <UserCog className="w-7 h-7" />
                Editar Perfil do Professor
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Cadastro completo e informações escolares
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
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-200">
                  {getInitials(userData.name)}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Clique no avatar para mudar a foto</p>
            <div className="mt-4 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500">
              Professor
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" />
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  placeholder="Nome completo do professor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={userData.birth_date}
                  onChange={(e) => setUserData({ ...userData, birth_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gênero
                </label>
                <select
                  value={userData.gender}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={userData.address}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  placeholder="Rua, Número, Bairro, Cidade, Estado"
                />
              </div>
            </div>
          </div>

          {/* Dados Escolares */}
          <div className="mb-8 bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Dados Escolares
            </h3>
            
            {/* Matérias */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matérias ({teacherData.subjects.length} selecionada{teacherData.subjects.length !== 1 ? 's' : ''})
              </label>
              <div className="border-2 border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white">
                {subjects.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma matéria cadastrada
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {subjects.map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={teacherData.subjects.includes(subject.id)}
                          onChange={() => handleToggleSubject(subject.id)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="ml-3 font-semibold text-gray-800">
                          {subject.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Turmas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turmas ({teacherData.classrooms.length} selecionada{teacherData.classrooms.length !== 1 ? 's' : ''})
              </label>
              <div className="border-2 border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white">
                {classrooms.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma turma cadastrada
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {classrooms.map((classroom) => (
                      <label
                        key={classroom.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={teacherData.classrooms.includes(classroom.id)}
                          onChange={() => handleToggleClassroom(classroom.id)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-3">
                            {classroom.grade && (
                              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-black rounded-lg shadow-lg min-w-[80px] text-center">
                                {classroom.grade}ª SÉRIE
                              </span>
                            )}
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-xl">
                                Turma {classroom.name}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1">
                                  {classroom.shift === 'morning' ? '🌅 Manhã' : 
                                   classroom.shift === 'afternoon' ? '☀️ Tarde' : 
                                   classroom.shift === 'evening' ? '🌙 Noite' : 
                                   '⏰ Integral'}
                                </span>
                                {classroom.school_year && (
                                  <span className="flex items-center gap-1">
                                    • 📅 {classroom.school_year}
                                  </span>
                                )}
                                {classroom.max_students && (
                                  <span className="flex items-center gap-1">
                                    • 👥 {classroom.max_students}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-semibold">Campos Obrigatórios</p>
              <p className="text-xs text-blue-700 mt-1">
                Nome do professor é obrigatório. Matérias e turmas são opcionais.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            disabled={loading || uploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors font-semibold flex items-center justify-center gap-2"
            disabled={loading || uploading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

