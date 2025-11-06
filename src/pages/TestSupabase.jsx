import React from 'react';
import { useNavigate } from 'react-router-dom';
import TestSupabaseConnection from '../components/common/TestSupabaseConnection';
import { ArrowLeft } from 'lucide-react';

export default function TestSupabase() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-6">
            Teste de Conexão Supabase
          </h1>

          <TestSupabaseConnection />

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Como configurar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>Acesse seu projeto no Supabase Dashboard</li>
              <li>Vá em Settings → API</li>
              <li>Copie a URL do projeto e a anon key</li>
              <li>Adicione no arquivo .env:
                <pre className="mt-2 bg-blue-100 p-2 rounded text-xs">
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui`}
                </pre>
              </li>
              <li>Execute o schema SQL no SQL Editor do Supabase</li>
              <li>Recarregue esta página e teste novamente</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

