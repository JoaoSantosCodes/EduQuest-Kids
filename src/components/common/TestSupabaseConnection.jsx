import React, { useState, useEffect } from 'react';
import { testConnection, isSupabaseConfigured } from '../../config/supabase';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function TestSupabaseConnection() {
  const [status, setStatus] = useState('idle'); // idle, testing, success, error
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTest = async () => {
    setStatus('testing');
    setMessage('');
    setError('');

    const result = await testConnection();

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
    } else {
      setStatus('error');
      setError(result.error);
    }
  };

  useEffect(() => {
    // Testar automaticamente ao montar o componente
    if (isSupabaseConfigured()) {
      handleTest();
    } else {
      setStatus('error');
      setError('Variáveis do Supabase não configuradas');
    }
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Supabase não configurado
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Teste de Conexão Supabase</h3>
        <button
          onClick={handleTest}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === 'testing' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar Novamente'
          )}
        </button>
      </div>

      {status === 'idle' && (
        <div className="text-gray-600 text-sm">Clique em "Testar Novamente" para verificar a conexão</div>
      )}

      {status === 'testing' && (
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Testando conexão com Supabase...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-3 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 text-red-600">
          <XCircle className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium">Erro na conexão:</span>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Informações da Configuração:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <span className="font-medium">URL:</span>{' '}
            {import.meta.env.VITE_SUPABASE_URL ? (
              <span className="text-green-600">✓ Configurada</span>
            ) : (
              <span className="text-red-600">✗ Não configurada</span>
            )}
          </div>
          <div>
            <span className="font-medium">Anon Key:</span>{' '}
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
              <span className="text-green-600">✓ Configurada</span>
            ) : (
              <span className="text-red-600">✗ Não configurada</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

