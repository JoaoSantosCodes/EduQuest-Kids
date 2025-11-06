import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { bulkImportQuestions } from '../../services/teachersService';
import { parseCSVQuestions, parseJSONQuestions, validateQuestions } from '../../utils/importQuestions';
import { toast } from 'sonner';

export default function BulkImportQuestions({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      setFileType('csv');
    } else if (fileName.endsWith('.json')) {
      setFileType('json');
    } else {
      toast.error('Formato de arquivo não suportado. Use CSV ou JSON.');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (selectedFile) => {
    try {
      setLoading(true);
      const text = await selectedFile.text();
      let parsedQuestions = [];

      if (fileType === 'csv' || selectedFile.name.toLowerCase().endsWith('.csv')) {
        parsedQuestions = parseCSVQuestions(text);
      } else if (fileType === 'json' || selectedFile.name.toLowerCase().endsWith('.json')) {
        parsedQuestions = parseJSONQuestions(text);
      } else {
        throw new Error('Formato de arquivo não reconhecido');
      }

      // Validar questões
      const validationResult = validateQuestions(parsedQuestions);
      setValidation(validationResult);
      setQuestions(validationResult.validQuestions);

      if (validationResult.errors.length > 0) {
        toast.warning(`${validationResult.errors.length} questão(ões) com erros encontradas`);
      } else {
        toast.success(`${validationResult.valid} questão(ões) válidas encontradas`);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo: ' + error.message);
      setValidation(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!questions.length) {
      toast.error('Nenhuma questão válida para importar');
      return;
    }

    try {
      setImporting(true);
      const { importedIds, error } = await bulkImportQuestions(questions);

      if (error) {
        throw new Error(error);
      }

      toast.success(`${importedIds.length} questão(ões) importadas com sucesso!`);
      
      // Limpar estado
      setFile(null);
      setFileType(null);
      setQuestions([]);
      setValidation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Chamar callback se fornecido
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro ao importar questões:', error);
      toast.error('Erro ao importar questões: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileType(null);
    setQuestions([]);
    setValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Importar Questões em Massa
      </h3>

      <div className="space-y-4">
        {/* Área de Upload */}
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-600 font-medium">
                  Clique para selecionar arquivo
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Formatos suportados: CSV, JSON
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-800">{file.name}</span>
                <span className="text-sm text-gray-500">({fileType?.toUpperCase()})</span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processando arquivo...</span>
              </div>
            )}

            {validation && !loading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">
                    <strong>{validation.valid}</strong> questão(ões) válidas
                  </span>
                </div>
                {validation.errors.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">
                      <strong>{validation.errors.length}</strong> questão(ões) com erros
                    </span>
                  </div>
                )}

                {/* Lista de erros */}
                {validation.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto border border-yellow-200 rounded p-2 bg-yellow-50">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">Erros encontrados:</p>
                    {validation.errors.slice(0, 5).map((error, idx) => (
                      <div key={idx} className="text-xs text-yellow-700 mb-1">
                        Linha {error.index}: {error.errors.join(', ')}
                      </div>
                    ))}
                    {validation.errors.length > 5 && (
                      <p className="text-xs text-yellow-700">
                        ... e mais {validation.errors.length - 5} erro(s)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botão de Importar */}
        {questions.length > 0 && (
          <button
            onClick={handleImport}
            disabled={importing || questions.length === 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Importar {questions.length} Questão(ões)
              </>
            )}
          </button>
        )}

        {/* Formato esperado */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Formato CSV esperado:</p>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`Matéria,Questão,Opção A,Opção B,Opção C,Opção D,Resposta Correta,Dificuldade,Série,Pontos,Explicacao,Tags
Matemática,Qual é 2+2?,4,5,6,7,A,easy,7,10,2+2=4,matemática;álgebra`}
          </pre>
        </div>
      </div>
    </div>
  );
}

