import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Search, Book } from 'lucide-react';
import { getClassroomMaterials, incrementMaterialDownload } from '../../services/studentsService';

function StudyMaterials({ classroomId, materials }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allMaterials, setAllMaterials] = useState(materials || []);

  useEffect(() => {
    if (classroomId) {
      loadMaterials();
    }
  }, [classroomId]);

  const loadMaterials = async () => {
    const { materials: data } = await getClassroomMaterials(classroomId);
    setAllMaterials(data);
  };

  const handleDownload = async (material) => {
    await incrementMaterialDownload(material.id);
    if (material.material_type === 'link') {
      window.open(material.file_url, '_blank');
    } else {
      window.open(material.file_url, '_blank');
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'link') return <ExternalLink className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'link': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaterials = allMaterials?.filter(m =>
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Materiais de Estudo</h2>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg ${getTypeColor(material.material_type)}`}>
                  {getTypeIcon(material.material_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{material.title}</h3>
                  <p className="text-xs text-gray-500">{material.subjects?.name || 'Geral'}</p>
                </div>
              </div>

              {material.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
              )}

              <div className="flex items-center justify-between mb-3">
                {material.file_size && (
                  <span className="text-xs text-gray-500">
                    {(material.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {material.download_count || 0} downloads
                </span>
              </div>

              <button
                onClick={() => handleDownload(material)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                {material.material_type === 'link' ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Acessar
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum material disponível.</p>
        </div>
      )}
    </div>
  );
}

export default StudyMaterials;

