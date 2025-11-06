import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  X,
  Upload,
  Link as LinkIcon,
  Video,
  FileImage,
  File,
} from 'lucide-react';

export default function MaterialsManager({ classrooms, teacherId, subjects }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    classroom_id: '',
    subject_id: '',
    title: '',
    description: '',
    material_type: 'pdf',
    file_url: '',
    is_public: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_materials')
        .select(`
          *,
          classrooms (id, name, grade),
          subjects (id, name, icon, color)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Detectar tipo de arquivo
      const fileType = file.type;
      let materialType = 'document';
      
      if (fileType.includes('pdf')) materialType = 'pdf';
      else if (fileType.includes('video')) materialType = 'video';
      else if (fileType.includes('image')) materialType = 'image';
      else if (fileType.includes('presentation')) materialType = 'presentation';
      
      setFormData({ ...formData, material_type: materialType });
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      return { url: publicUrl, size: selectedFile.size };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let fileUrl = formData.file_url;
      let fileSize = null;

      // Se houver arquivo selecionado, fazer upload
      if (selectedFile) {
        const uploadResult = await uploadFile();
        if (!uploadResult) return;
        fileUrl = uploadResult.url;
        fileSize = uploadResult.size;
      }

      if (!fileUrl) {
        toast.error('Adicione um arquivo ou link');
        return;
      }

      const materialData = {
        teacher_id: teacherId,
        classroom_id: formData.classroom_id || null,
        subject_id: formData.subject_id || null,
        title: formData.title,
        description: formData.description,
        material_type: formData.material_type,
        file_url: fileUrl,
        file_size: fileSize,
        is_public: formData.is_public,
      };

      const { error } = await supabase
        .from('learning_materials')
        .insert([materialData]);

      if (error) throw error;

      toast.success('Material adicionado com sucesso!');
      setShowModal(false);
      resetForm();
      loadMaterials();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast.error('Erro ao salvar material');
    }
  };

  const handleDelete = async (id, fileUrl) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      // Tentar deletar arquivo do storage
      if (fileUrl && fileUrl.includes('materials/')) {
        const filePath = fileUrl.split('/materials/')[1];
        await supabase.storage.from('materials').remove([`materials/${filePath}`]);
      }

      const { error } = await supabase
        .from('learning_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Material excluído com sucesso!');
      loadMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material');
    }
  };

  const handleDownload = async (material) => {
    try {
      // Incrementar contador de downloads
      await supabase
        .from('learning_materials')
        .update({ downloads_count: (material.downloads_count || 0) + 1 })
        .eq('id', material.id);

      // Abrir arquivo em nova aba
      window.open(material.file_url, '_blank');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      classroom_id: '',
      subject_id: '',
      title: '',
      description: '',
      material_type: 'pdf',
      file_url: '',
      is_public: false,
    });
    setSelectedFile(null);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-600" />;
      case 'link':
        return <LinkIcon className="w-6 h-6 text-blue-600" />;
      case 'image':
        return <FileImage className="w-6 h-6 text-green-600" />;
      default:
        return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Materiais Didáticos</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Material
        </button>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando materiais...</p>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getMaterialIcon(material.material_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{material.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(material.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {material.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {material.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {material.classrooms && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    Turma {material.classrooms.name}
                  </span>
                )}
                {material.subjects && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium ml-2">
                    {material.subjects.name}
                  </span>
                )}
                {material.file_size && (
                  <span className="inline-block text-xs text-gray-500 ml-2">
                    {formatFileSize(material.file_size)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(material)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download ({material.downloads_count || 0})
                </button>
                <button
                  onClick={() => handleDelete(material.id, material.file_url)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum material adicionado ainda.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Adicionar Material</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Apostila de Matemática - Capítulo 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Descrição do material..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turma
                  </label>
                  <select
                    value={formData.classroom_id}
                    onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as Turmas</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.grade}ª - Turma {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo ou Link *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OU</span>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value, material_type: 'link' })}
                    placeholder="Cole um link (YouTube, Google Drive, etc.)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  Tornar público (visível para outras turmas)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Adicionar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

