# 🔧 Como Configurar o Arquivo .env

## 📋 Crie o arquivo `.env` na raiz do projeto

Copie e cole o conteúdo abaixo em um arquivo chamado `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 🔑 Como Obter as Credenciais

### **Passo 1: Acessar o Supabase**
1. Acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione seu projeto (ou crie um novo)

### **Passo 2: Obter as Credenciais**
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **API**
3. Copie as seguintes informações:
   - **Project URL** → Cole em `VITE_SUPABASE_URL`
   - **anon/public** (em Project API keys) → Cole em `VITE_SUPABASE_ANON_KEY`

### **Passo 3: Criar o Arquivo**
1. Crie um arquivo chamado `.env` na raiz do projeto
2. Cole as credenciais
3. Salve o arquivo

## ✅ Exemplo Completo

```env
# Suas credenciais reais do Supabase
VITE_SUPABASE_URL=https://xyzabcdef.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ IMPORTANTE

- ❌ **NUNCA** compartilhe o arquivo `.env`
- ❌ **NUNCA** comite o `.env` no git (já está no .gitignore)
- ✅ Use `.env.example` como modelo (sem credenciais reais)

## 🧪 Testar Conexão

Após criar o `.env`:

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:3000/test-supabase

3. Você verá se a conexão foi bem-sucedida

---

**Consulte também:** `docs/configuracao/COMO_OBTER_CREDENCIAIS_SUPABASE.md`

