# 🔧 Corrigir URL do Supabase

## ✅ Progresso

O Supabase está sendo detectado! As variáveis estão configuradas:
- ✅ URL: Configurada
- ✅ Anon Key: Configurada

## ❌ Problema Atual

Erro: `ERR_NAME_NOT_RESOLVED` ao conectar com:
```
https://iqzvgnmipfyzubwqux.supabase.co
```

## 🔍 Verificar URL Correta

A URL do Supabase geralmente tem um formato diferente. Verifique:

### No Dashboard do Supabase:

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto:** "EduQuest Kids"
3. **Vá em:** Settings → API
4. **Procure por:** "Project URL" ou "API URL"

### Formatos Possíveis:

- ✅ `https://iqzvgnmipfyzubwqux.supabase.co` (pode estar correto)
- ✅ `https://iqzvgnmipfyzubwqux.supabase.io` (com .io)
- ✅ Pode ter um formato diferente

## 📝 Como Corrigir

1. **Copie a URL exata** do Dashboard do Supabase
2. **Edite o arquivo `.env`** na raiz do projeto
3. **Substitua a linha `VITE_SUPABASE_URL=`** pela URL correta
4. **Salve o arquivo**
5. **Reinicie o servidor** (Ctrl+C e depois `npm run dev`)

## 🔄 Exemplo de Correção

Se a URL correta for diferente, o arquivo `.env` deve ficar assim:

```env
VITE_SUPABASE_URL=https://url-correta-do-supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Depois de Corrigir

1. Reinicie o servidor
2. Teste em: http://localhost:3000/test-supabase
3. Deve mostrar: ✅ "Conexão Supabase bem-sucedida!"

