# 🧪 Guia de Teste - Login com Google

## ✅ Checklist de Verificação

### **1. Antes de Testar**

- [ ] Google OAuth configurado no Google Cloud Console
- [ ] Client ID e Secret configurados no Supabase Dashboard
- [ ] URL de redirecionamento configurada corretamente
- [ ] Rota `/auth/callback` configurada no App.jsx
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)

---

## 🧪 **Testes a Realizar**

### **Teste 1: Verificar Botão de Login com Google**

1. **Acesse:** `http://localhost:3000/login`
2. **Verifique:**
   - [ ] Botão "Continuar com Google" está visível
   - [ ] Ícone do Google está exibido corretamente
   - [ ] Botão está funcionando (não está desabilitado)

**Resultado Esperado:** ✅ Botão visível e funcional

---

### **Teste 2: Fluxo de Autenticação Google (Sem Configuração)**

1. **Acesse:** `http://localhost:3000/login`
2. **Clique em:** "Continuar com Google"
3. **Verifique:**
   - [ ] Mensagem de erro aparece se Google OAuth não estiver configurado
   - [ ] Erro é claro e informativo

**Resultado Esperado:** ✅ Mensagem de erro clara se não configurado

---

### **Teste 3: Fluxo de Autenticação Google (Com Configuração)**

**Pré-requisito:** Google OAuth configurado no Supabase

1. **Acesse:** `http://localhost:3000/login`
2. **Clique em:** "Continuar com Google"
3. **Verifique:**
   - [ ] Redireciona para página do Google
   - [ ] Página de consentimento do Google aparece
   - [ ] Após autorizar, retorna para `/auth/callback`
   - [ ] Página de callback mostra "Processando autenticação..."
   - [ ] Usuário é redirecionado para o portal correto

**Resultado Esperado:** ✅ Fluxo completo funcionando

---

### **Teste 4: Criação Automática de Usuário**

Após login com Google:

1. **Verifique no Supabase Dashboard:**
   - [ ] Usuário foi criado em `auth.users`
   - [ ] Registro foi criado em `public.users` (via trigger)
   - [ ] Registro foi criado em `students/teachers/parents` (via trigger)
   - [ ] Role padrão é `'student'` se não especificado

**Resultado Esperado:** ✅ Usuário criado automaticamente

---

### **Teste 5: Redirecionamento por Role**

1. **Teste com diferentes contas Google:**
   - [ ] Aluno → redireciona para `/student`
   - [ ] Professor → redireciona para `/teacher`
   - [ ] Pai → redireciona para `/parent`
   - [ ] Coordenador → redireciona para `/coordinator`

**Resultado Esperado:** ✅ Redirecionamento correto por role

---

### **Teste 6: Tratamento de Erros**

1. **Teste cenários de erro:**
   - [ ] Google OAuth não configurado → mensagem clara
   - [ ] Usuário cancela autorização → redireciona para login
   - [ ] Erro de rede → mensagem de erro
   - [ ] Callback inválido → mensagem de erro

**Resultado Esperado:** ✅ Erros tratados adequadamente

---

### **Teste 7: Console do Navegador**

1. **Abra o DevTools (F12)**
2. **Vá em:** Console
3. **Teste o login com Google**
4. **Verifique:**
   - [ ] Sem erros no console
   - [ ] Logs de debug (se em desenvolvimento)
   - [ ] Mensagens de erro claras (se houver)

**Resultado Esperado:** ✅ Console limpo, sem erros

---

## 🐛 **Problemas Comuns e Soluções**

### **Problema 1: Botão não aparece**

**Causa:** Componente não renderizado ou CSS ocultando

**Solução:**
```bash
# Verificar se o componente está sendo importado
grep -r "loginWithGoogle" src/components/auth/Login.jsx
```

---

### **Problema 2: Erro "redirect_uri_mismatch"**

**Causa:** URL de redirecionamento não configurada no Google Cloud Console

**Solução:**
1. Verifique a URL no Google Cloud Console
2. Deve ser: `https://seu-projeto-id.supabase.co/auth/v1/callback`
3. Remova espaços extras
4. Aguarde alguns minutos para propagação

---

### **Problema 3: Erro "OAuth client not found"**

**Causa:** Client ID incorreto no Supabase

**Solução:**
1. Verifique o Client ID no Supabase Dashboard
2. Copie novamente do Google Cloud Console
3. Salve no Supabase

---

### **Problema 4: Usuário não é criado após login**

**Causa:** Trigger não está funcionando

**Solução:**
1. Verifique se a trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Se não existir, execute o script de trigger
3. Verifique os logs do Supabase

---

### **Problema 5: Redirecionamento infinito**

**Causa:** Loop entre `/auth/callback` e `/login`

**Solução:**
1. Verifique se `handleAuthCallback` está retornando dados corretos
2. Verifique se `setAuth` está sendo chamado
3. Verifique se o `role` está sendo definido

---

## 📊 **Checklist de Testes**

### **Funcionalidade:**
- [ ] Botão "Continuar com Google" aparece
- [ ] Clique no botão redireciona para Google
- [ ] Autorização no Google funciona
- [ ] Callback processa corretamente
- [ ] Usuário é criado automaticamente
- [ ] Redirecionamento funciona por role
- [ ] Erros são tratados adequadamente

### **Interface:**
- [ ] Botão está visível e acessível
- [ ] Estados de loading funcionam
- [ ] Mensagens de erro são claras
- [ ] Página de callback exibe corretamente

### **Performance:**
- [ ] Redirecionamento é rápido
- [ ] Sem travamentos ou delays excessivos
- [ ] Console sem erros

---

## ✅ **Resultado Final**

Após todos os testes:

- ✅ **Funcionalidade:** Login com Google funcionando
- ✅ **Interface:** Botão e fluxo visual corretos
- ✅ **Tratamento de Erros:** Erros tratados adequadamente
- ✅ **Performance:** Fluxo rápido e responsivo

---

## 🎯 **Próximos Passos**

Após testes bem-sucedidos:

1. ✅ Testar em produção
2. ✅ Adicionar outros provedores (opcional)
3. ✅ Personalizar mensagens de erro
4. ✅ Adicionar analytics (opcional)

---

**Status:** ✅ **Pronto para Teste**

**Data:** $(date)

