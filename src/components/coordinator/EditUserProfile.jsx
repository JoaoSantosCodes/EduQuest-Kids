import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Camera, X, Upload, Loader2 } from 'lucide-react';

export default function EditUserProfile({ user, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birth_date: user?.birth_date || '',
    avatar_url: user?.avatar_url || '',
    gender: user?.gender || '',
  });
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || null);

  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      birth_date: user?.birth_date || '',
      avatar_url: user?.avatar_url || '',
      gender: user?.gender || '',
    });
    setPreviewUrl(user?.avatar_url || null);
  }, [user]);

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
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      setProfileData((prev) => ({
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
      if (!profileData.name.trim()) {
        toast.error('Nome é obrigatório');
        setLoading(false);
        return;
      }

      if (!user?.id) {
        toast.error('Erro: usuário não identificado');
        setLoading(false);
        return;
      }

      console.log('💾 Salvando perfil do usuário...', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        data: profileData,
      });

      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Sessão atual:', {
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });

      // Atualizar no banco
      const updateData = {
        name: profileData.name,
        phone: profileData.phone || null,
        address: profileData.address || null,
        birth_date: profileData.birth_date || null,
        avatar_url: profileData.avatar_url || null,
        gender: profileData.gender || null,
      };

      console.log('📤 Dados a serem salvos:', updateData);
      console.log('🎯 Atualizando usuário com ID:', user.id);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select();

      console.log('📊 Resposta do Supabase:', { 
        data, 
        error,
        dataLength: data?.length,
        firstRecord: data?.[0]
      });

      if (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
      }

      console.log('✅ Perfil atualizado com sucesso!');
      toast.success('Perfil atualizado com sucesso!');
      
      if (onSave) {
        onSave(data[0]);
      }
      
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      console.error('❌ Detalhes:', error.message, error.details, error.hint);
      toast.error(`Erro ao salvar perfil: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role) => {
    const colors = {
      coordinator: 'from-purple-500 to-pink-500',
      teacher: 'from-blue-500 to-cyan-500',
      parent: 'from-green-500 to-emerald-500',
      student: 'from-orange-500 to-yellow-500',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const getRoleLabel = (role) => {
    const labels = {
      coordinator: 'Coordenador',
      teacher: 'Professor',
      parent: 'Pai/Mãe',
      student: 'Aluno',
    };
    return labels[role] || role;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Editar Perfil</h2>
              <p className="text-purple-100 text-sm mt-1">
                Atualize as informações do usuário
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
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                />
              ) : (
                <div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRoleColor(
                    user?.role
                  )} flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-200`}
                >
                  {getInitials(profileData.name)}
                </div>
              )}

              {/* Upload Button Overlay */}
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
            <div
              className={`mt-4 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getRoleColor(
                user?.role
              )}`}
            >
              {getRoleLabel(user?.role)}
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="birth_date"
                value={profileData.birth_date}
                onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gênero
              </label>
              <select
                id="gender"
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_dizer">Prefiro não dizer</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                placeholder="Rua, Número, Bairro, Cidade, Estado"
              />
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
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold flex items-center justify-center gap-2"
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

