# 🔐 Guia de Configuração - Login com Google

## 📋 Passo a Passo para Configurar Google OAuth no Supabase

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Clique em **"Selecionar projeto"** → **"Novo projeto"**
4. Preencha:
   - **Nome do projeto**: EduQuest Kids (ou o nome que preferir)
   - **Organização**: (opcional)
5. Clique em **"Criar"**
6. Aguarde alguns segundos e selecione o projeto criado

### 2. Configurar OAuth Consent Screen

1. No menu lateral, vá em **"APIs e Serviços"** → **"Tela de consentimento OAuth"**
2. Selecione **"Externo"** (para uso público) e clique em **"Criar"**
3. Preencha os campos obrigatórios:
   - **Nome do app**: EduQuest Kids
   - **Email de suporte do usuário**: seu email
   - **Email de contato do desenvolvedor**: seu email
4. Clique em **"Salvar e continuar"**
5. **Escopos** (opcional): Clique em **"Salvar e continuar"**
6. **Usuários de teste** (opcional): Adicione seu email para testar
7. Clique em **"Voltar ao painel"**

### 3. Criar Credenciais OAuth

1. No menu lateral, vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth"**
3. Selecione **"Aplicativo da Web"**
4. Preencha:
   - **Nome**: EduQuest Kids Web Client
   - **URIs de redirecionamento autorizados**: 
     - Adicione: `https://seu-projeto-id.supabase.co/auth/v1/callback`
     - Substitua `seu-projeto-id` pelo ID do seu projeto Supabase
     - Exemplo: `https://iqzqvgnimpfyzunbuqx.supabase.co/auth/v1/callback`
5. Clique em **"Criar"**
6. **Copie** o **ID do cliente** e o **Segredo do cliente**
7. **⚠️ IMPORTANTE**: Guarde o segredo do cliente, você não poderá vê-lo novamente!

### 4. Configurar no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **"Authentication"** → **"Providers"**
4. Encontre **"Google"** na lista de provedores
5. Ative o toggle **"Enable Google provider"**
6. Preencha:
   - **Client ID (for OAuth)**: Cole o ID do cliente do Google
   - **Client Secret (for OAuth)**: Cole o Segredo do cliente do Google
7. Clique em **"Save"**

### 5. Configurar URL de Redirecionamento

1. No Supabase Dashboard, vá em **"Authentication"** → **"URL Configuration"**
2. Verifique se a **Redirect URLs** inclui:
   - `http://localhost:3000/auth/callback` (desenvolvimento)
   - `https://seu-dominio.com/auth/callback` (produção)
3. Se não estiver, adicione e clique em **"Save"**

### 6. Testar Login com Google

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000/login`

3. Clique em **"Continuar com Google"**

4. Você será redirecionado para o Google para fazer login

5. Após autorizar, você será redirecionado de volta para o app

6. O sistema criará automaticamente o usuário na tabela `users` (via trigger)

---

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa:** A URL de redirecionamento não está configurada corretamente no Google Cloud Console.

**Solução:**
1. Verifique se a URL no Google Cloud Console está exatamente assim:
   - `https://seu-projeto-id.supabase.co/auth/v1/callback`
2. Remova espaços extras ou caracteres especiais
3. Salve e aguarde alguns minutos para propagação

### Erro: "OAuth client not found"

**Causa:** O Client ID está incorreto no Supabase.

**Solução:**
1. Verifique se o Client ID copiado está completo
2. Cole novamente no Supabase Dashboard
3. Clique em "Save"

### Erro: "Invalid client secret"

**Causa:** O Client Secret está incorreto no Supabase.

**Solução:**
1. Se você perdeu o secret, crie uma nova credencial no Google Cloud Console
2. Copie o novo secret e cole no Supabase
3. Atualize a URL de redirecionamento na nova credencial

### Usuário não é criado após login com Google

**Causa:** A trigger `handle_new_user` pode não estar funcionando para OAuth.

**Solução:**
1. Verifique se a trigger está criada no Supabase:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Se não existir, execute o script `SUPABASE_TRIGGER_HANDLE_NEW_USER.sql`
3. Verifique os logs do Supabase para erros

### Redirecionamento não funciona

**Causa:** A URL de callback pode estar incorreta no código.

**Solução:**
1. Verifique `src/services/supabaseAuthService.js`
2. A URL deve ser: `${window.location.origin}/auth/callback`
3. Verifique se a rota `/auth/callback` está configurada no `App.jsx`

---

## ✅ Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] Tela de consentimento OAuth configurada
- [ ] Credenciais OAuth criadas (Client ID e Secret)
- [ ] URL de redirecionamento configurada no Google Cloud Console
- [ ] Google OAuth habilitado no Supabase Dashboard
- [ ] Client ID e Secret configurados no Supabase
- [ ] URL de callback configurada no Supabase
- [ ] Rota `/auth/callback` configurada no App.jsx
- [ ] Teste de login com Google realizado com sucesso

---

## 📝 Notas Importantes

1. **Ambiente de Desenvolvimento:**
   - Use `http://localhost:3000` para desenvolvimento
   - Configure a URL de redirecionamento no Google Cloud Console

2. **Ambiente de Produção:**
   - Atualize a URL de redirecionamento para o domínio de produção
   - Configure no Supabase Dashboard também

3. **Segurança:**
   - Nunca commite o Client Secret no código
   - Use variáveis de ambiente se necessário
   - O Supabase armazena o secret de forma segura

4. **Primeiro Login:**
   - O sistema criará automaticamente o usuário na tabela `users`
   - O role padrão será `'student'` se não especificado
   - O usuário pode atualizar o role posteriormente se necessário

---

## 🎉 Pronto!

Após seguir todos os passos, o login com Google estará funcionando! 🚀

