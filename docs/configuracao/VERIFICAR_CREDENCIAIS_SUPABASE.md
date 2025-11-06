# ⚠️ Verificação de Credenciais do Supabase

## 📋 Credenciais Recebidas

Você forneceu:
- `sb_publishable_-RcteW9SYbYf5MqeAr8Wvw_fmZmo75V`
- `sb_secret_isx9ipDpzC-bFZi1hExhHg_jBA6MyCD`

## ⚠️ Atenção

Essas chaves **não parecem ser do formato padrão do Supabase**. 

As credenciais do Supabase geralmente têm estes formatos:

### ✅ Formato Correto do Supabase:

1. **Project URL:**
   - Formato: `https://xxxxx.supabase.co`
   - Exemplo: `https://abcdefghijklmnop.supabase.co`

2. **anon/public key:**
   - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT muito longo)
   - Começa com `eyJ` e tem centenas de caracteres

3. **service_role key:**
   - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT muito longo)
   - Também começa com `eyJ` e é muito longa

## 🔍 Onde Encontrar as Credenciais Corretas

### No Dashboard do Supabase:

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto:** "EduQuest Kids"
3. **Vá em:** Settings (⚙️) → API
4. **Você verá:**

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   Copie esta URL completa

   **Project API keys:**
   - **anon public** - Esta é a que você precisa!
   - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (muito longa)
   - Copie esta chave completa

## 📝 Exemplo de Arquivo .env Correto

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## ❓ As Chaves Fornecidas São de Outro Serviço?

Se as chaves que você forneceu (`sb_publishable_` e `sb_secret_`) são de outro serviço ou plataforma, você precisará:

1. **Acessar o Supabase Dashboard**
2. **Encontrar as credenciais corretas** seguindo os passos acima
3. **Criar o arquivo .env** com as credenciais do Supabase

## ✅ Depois de Configurar Corretamente

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Teste a conexão:**
   - Acesse: http://localhost:3000/test-supabase
   - Deve mostrar: ✅ "Conexão Supabase bem-sucedida!"

