import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Search, Filter, Users, Mail, Calendar, Heart, Edit } from 'lucide-react';
import EditUserProfile from './EditUserProfile';

export default function ManageParents({ onLinkClick }) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Iniciando busca de pais...');
      
      // Buscar TODOS os usuários com role 'parent'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'parent')
        .order('created_at', { ascending: false });

      console.log('📊 Resposta do Supabase (pais):', { data, error });

      if (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
      }

      console.log('✅ Pais carregados:', data?.length || 0, data);
      setParents(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar pais:', error);
      console.error('❌ Stack trace:', error.stack);
      toast.error(`Erro ao carregar pais: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(parent => {
    const searchLower = searchTerm.toLowerCase();
    return (
      parent.name?.toLowerCase().includes(searchLower) ||
      parent.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando pais...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gerenciar Pais</h2>
          <p className="text-gray-600">{parents.length} pai(s)/mãe(s) cadastrado(s)</p>
        </div>
        {onLinkClick && (
          <button
            onClick={onLinkClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Heart className="w-5 h-5" />
            Vincular Pais aos Filhos
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Parents List */}
      {filteredParents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'Nenhum pai/mãe encontrado' : 'Nenhum pai/mãe cadastrado'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Tente buscar com outros termos'
              : 'Ainda não há pais cadastrados no sistema'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParents.map((parent) => (
            <div
              key={parent.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {parent.name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">
                    {parent.name || 'Sem nome'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{parent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Cadastrado em {new Date(parent.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser({ ...parent, role: 'parent' })}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Editar perfil"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar URL (se existir) */}
              {parent.avatar_url && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <img 
                    src={parent.avatar_url} 
                    alt={parent.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit User Profile Modal */}
      {editingUser && (
        <EditUserProfile
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => {
            setEditingUser(null);
            loadParents();
          }}
        />
      )}
    </div>
  );
}

