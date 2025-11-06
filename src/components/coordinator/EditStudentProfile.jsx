import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Camera, X, Upload, Loader2, GraduationCap, Users, FileText, AlertCircle } from 'lucide-react';

export default function EditStudentProfile({ student, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Dados do usuário (tabela users)
  const [userData, setUserData] = useState({
    name: student?.users?.name || '',
    email: student?.users?.email || '',
    phone: student?.users?.phone || '',
    address: student?.users?.address || '',
    birth_date: student?.users?.birth_date || '',
    avatar_url: student?.users?.avatar_url || '',
    gender: student?.users?.gender || '',
  });

  // Dados do aluno (tabela students)
  const [studentData, setStudentData] = useState({
    grade: student?.grade || 6,
    school: student?.school || '',
    enrollment_number: student?.enrollment_number || '',
    enrollment_status: student?.enrollment_status || 'active',
    enrollment_date: student?.enrollment_date || '',
    observations: student?.observations || '',
    guardian_name: student?.guardian_name || '',
    guardian_phone: student?.guardian_phone || '',
    guardian_cpf: student?.guardian_cpf || '',
    guardian_relationship: student?.guardian_relationship || '',
  });

  const [previewUrl, setPreviewUrl] = useState(student?.users?.avatar_url || null);

  useEffect(() => {
    setUserData({
      name: student?.users?.name || '',
      email: student?.users?.email || '',
      phone: student?.users?.phone || '',
      address: student?.users?.address || '',
      birth_date: student?.users?.birth_date || '',
      avatar_url: student?.users?.avatar_url || '',
      gender: student?.users?.gender || '',
    });
    setStudentData({
      grade: student?.grade || 6,
      school: student?.school || '',
      enrollment_number: student?.enrollment_number || '',
      enrollment_status: student?.enrollment_status || 'active',
      enrollment_date: student?.enrollment_date || '',
      observations: student?.observations || '',
      guardian_name: student?.guardian_name || '',
      guardian_phone: student?.guardian_phone || '',
      guardian_cpf: student?.guardian_cpf || '',
      guardian_relationship: student?.guardian_relationship || '',
    });
    setPreviewUrl(student?.users?.avatar_url || null);
  }, [student]);

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
      const fileName = `${student.user_id}-${Math.random()}.${fileExt}`;
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

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validações
      if (!userData.name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      if (!studentData.guardian_name.trim()) {
        toast.error('Nome do responsável é obrigatório');
        return;
      }

      if (!studentData.guardian_phone.trim()) {
        toast.error('Telefone do responsável é obrigatório');
        return;
      }

      console.log('💾 Salvando dados do aluno...', {
        userId: student.user_id,
        studentId: student.id,
        userData,
        studentData,
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
        .eq('id', student.user_id);

      if (userError) {
        console.error('❌ Erro ao atualizar usuário:', userError);
        throw userError;
      }

      // 2. Atualizar dados do aluno (tabela students)
      const { error: studentError } = await supabase
        .from('students')
        .update({
          grade: studentData.grade,
          school: studentData.school || null,
          enrollment_number: studentData.enrollment_number || null,
          enrollment_status: studentData.enrollment_status,
          enrollment_date: studentData.enrollment_date || null,
          observations: studentData.observations || null,
          guardian_name: studentData.guardian_name,
          guardian_phone: studentData.guardian_phone,
          guardian_cpf: studentData.guardian_cpf || null,
          guardian_relationship: studentData.guardian_relationship || null,
        })
        .eq('id', student.id);

      if (studentError) {
        console.error('❌ Erro ao atualizar aluno:', studentError);
        throw studentError;
      }

      console.log('✅ Dados do aluno salvos com sucesso!');
      toast.success('Perfil do aluno atualizado com sucesso!');
      
      if (onSave) {
        onSave();
      }
      
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="w-7 h-7" />
                Editar Perfil do Aluno
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Cadastro completo e informações do responsável
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
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-orange-200">
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
            <div className="mt-4 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-yellow-500">
              Aluno
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-orange-600" />
              Dados Pessoais do Aluno
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                  placeholder="Nome completo do aluno"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone do Aluno
                </label>
                <input
                  type="text"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gênero
                </label>
                <select
                  value={userData.gender}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                  placeholder="Rua, Número, Bairro, Cidade, Estado"
                />
              </div>
            </div>
          </div>

          {/* Dados do Responsável */}
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Dados do Responsável Legal *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  value={studentData.guardian_name}
                  onChange={(e) => setStudentData({ ...studentData, guardian_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  placeholder="Nome completo do responsável"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone do Responsável *
                </label>
                <input
                  type="text"
                  value={studentData.guardian_phone}
                  onChange={(e) => setStudentData({ ...studentData, guardian_phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF do Responsável
                </label>
                <input
                  type="text"
                  value={studentData.guardian_cpf}
                  onChange={(e) => setStudentData({ ...studentData, guardian_cpf: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  placeholder="000.000.000-00"
                  maxLength="14"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grau de Parentesco
                </label>
                <select
                  value={studentData.guardian_relationship}
                  onChange={(e) => setStudentData({ ...studentData, guardian_relationship: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="pai">Pai</option>
                  <option value="mae">Mãe</option>
                  <option value="tutor">Tutor(a)</option>
                  <option value="responsavel_legal">Responsável Legal</option>
                  <option value="avo">Avô/Avó</option>
                  <option value="tio">Tio/Tia</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados Acadêmicos */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Dados Acadêmicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Matrícula
                </label>
                <input
                  type="text"
                  value={studentData.enrollment_number}
                  onChange={(e) => setStudentData({ ...studentData, enrollment_number: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Ex: 2025001234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Série/Ano
                </label>
                <select
                  value={studentData.grade}
                  onChange={(e) => setStudentData({ ...studentData, grade: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}ª Série
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status da Matrícula
                </label>
                <select
                  value={studentData.enrollment_status}
                  onChange={(e) => setStudentData({ ...studentData, enrollment_status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="active">Ativo</option>
                  <option value="pending">Aguardando</option>
                  <option value="transferred">Transferido</option>
                  <option value="suspended">Trancado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Ingresso
                </label>
                <input
                  type="date"
                  value={studentData.enrollment_date}
                  onChange={(e) => setStudentData({ ...studentData, enrollment_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escola
                </label>
                <input
                  type="text"
                  value={studentData.school}
                  onChange={(e) => setStudentData({ ...studentData, school: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Nome da escola"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações Pedagógicas
                </label>
                <textarea
                  value={studentData.observations}
                  onChange={(e) => setStudentData({ ...studentData, observations: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  placeholder="Anotações sobre o aluno (dificuldades, habilidades, observações gerais...)"
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-semibold">Campos Obrigatórios</p>
              <p className="text-xs text-yellow-700 mt-1">
                Nome do aluno, nome do responsável e telefone do responsável são obrigatórios.
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
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors font-semibold flex items-center justify-center gap-2"
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

