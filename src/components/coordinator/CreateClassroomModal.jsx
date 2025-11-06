import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { X, BookOpen, Loader2, Save } from 'lucide-react';

export default function CreateClassroomModal({ onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: 6,
    shift: 'morning',
    school_year: new Date().getFullYear(),
    max_students: 30,
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da turma é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('classrooms')
        .insert([
          {
            name: formData.name,
            grade: formData.grade,
            grade_level: formData.grade, // Campo obrigatório (mesmo valor que grade)
            shift: formData.shift,
            school_year: formData.school_year,
            max_students: formData.max_students,
            description: formData.description || null,
          },
        ])
        .select();

      if (error) throw error;

      toast.success('Turma criada com sucesso!');
      
      if (onSave) {
        onSave(data[0]);
      }
      
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error(`Erro ao criar turma: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-7 h-7" />
                Nova Turma
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Criar uma nova turma/classe
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Nome da Turma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Turma *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                placeholder="Ex: 6º Ano A, Turma da Manhã, etc."
                required
              />
            </div>

            {/* Série e Turno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Série/Ano *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
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
                  Turno *
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noite</option>
                  <option value="full_time">Integral</option>
                </select>
              </div>
            </div>

            {/* Ano Letivo e Máximo de Alunos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano Letivo *
                </label>
                <input
                  type="number"
                  value={formData.school_year}
                  onChange={(e) => setFormData({ ...formData, school_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  min="2020"
                  max="2030"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Alunos
                </label>
                <input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                placeholder="Informações adicionais sobre a turma..."
                rows="3"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors font-semibold flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Criar Turma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

