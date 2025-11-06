import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  X,
  Upload,
  Loader2,
} from 'lucide-react';

export default function ProfileSettings({ onClose }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || '',
    avatar_url: user?.avatar_url || '',
  });
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || '');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          birth_date: data.birth_date || '',
          gender: data.gender || '',
          avatar_url: data.avatar_url || '',
        });
        setPreviewUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    try {
      setUploading(true);

      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // ⚠️ SEM pasta 'avatars/' - bucket já é 'avatars'

      console.log('📤 Iniciando upload:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      console.log('📊 Resultado do upload:', { uploadData, uploadError });

      if (uploadError) {
        console.error('❌ Erro detalhado do upload:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
        });
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('✅ URL pública gerada:', publicUrl);

      setProfileData((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Stack:', error.stack);
      toast.error(`Erro ao fazer upload da foto: ${error.message || 'Erro desconhecido'}`);
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

      console.log('💾 Salvando perfil...', {
        userId: user.id,
        data: profileData,
      });

      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Sessão atual:', session?.user?.id);

      // Atualizar no banco
      const { data, error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone || null,
          address: profileData.address || null,
          birth_date: profileData.birth_date || null,
          gender: profileData.gender || null,
          avatar_url: profileData.avatar_url || null,
        })
        .eq('id', user.id)
        .select();

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
      }

      // Atualizar contexto
      updateUser({
        ...user,
        ...profileData,
      });

      console.log('✅ Perfil atualizado com sucesso!');
      toast.success('Perfil atualizado com sucesso!');
      
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
              <h2 className="text-2xl font-bold">Configurações de Perfil</h2>
              <p className="text-purple-100 text-sm mt-1">
                Atualize suas informações pessoais
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
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">
                {profileData.name || 'Sem nome'}
              </h3>
              <span
                className={`inline-block mt-2 px-4 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getRoleColor(
                  user?.role
                )}`}
              >
                {getRoleLabel(user?.role)}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Clique na foto para alterar
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                O email não pode ser alterado
              </p>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birth_date"
                value={profileData.birth_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Gênero */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Gênero
              </label>
              <select
                name="gender"
                value={profileData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_dizer">Prefiro não dizer</option>
              </select>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Endereço
              </label>
              <textarea
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                placeholder="Digite seu endereço completo"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

