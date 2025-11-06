# 🔑 Como Obter Credenciais do Supabase

## 📍 Passo a Passo

### 1. Acesse o Dashboard do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta

### 2. Selecione seu Projeto
- Clique no projeto "EduQuest Kids" (ou o nome do seu projeto)

### 3. Vá para Settings > API
- No menu lateral esquerdo, clique em **Settings** (ícone de engrenagem)
- Depois clique em **API**

### 4. Copie as Credenciais
Você verá duas informações importantes:

**a) Project URL:**
- Exemplo: `https://xxxxx.supabase.co`
- Copie esta URL completa

**b) anon public key:**
- É uma chave longa que começa com `eyJ...`
- Copie esta chave completa

### 5. Criar arquivo `.env` no projeto

1. **Na raiz do projeto** (mesma pasta onde está `package.json`)

2. **Crie um arquivo chamado `.env`** (sem nome antes do ponto)

3. **Adicione o seguinte conteúdo:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Substitua** `https://xxxxx.supabase.co` pela sua URL real
5. **Substitua** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` pela sua chave real

### 6. Reiniciar o Servidor

Após criar o arquivo `.env`:

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Inicie novamente:**
   ```bash
   npm run dev
   ```

### 7. Testar Conexão

1. Acesse: http://localhost:3000/test-supabase
2. Clique em "Testar Conexão"
3. Deve mostrar: ✅ "Conexão Supabase bem-sucedida!"

---

## ⚠️ Importante

- **NÃO compartilhe** o arquivo `.env` publicamente
- **NÃO faça commit** do `.env` no Git
- O arquivo `.env` já está no `.gitignore` (não será enviado)

---

## 📝 Exemplo de Arquivo .env

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## ✅ Verificação

Após configurar, teste:
- Acesse: http://localhost:3000/test-supabase
- Deve mostrar sucesso!

Se ainda não funcionar:
1. Verifique se copiou a URL e a chave corretamente
2. Verifique se não há espaços extras
3. Reinicie o servidor (`npm run dev`)

