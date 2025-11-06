# 🧪 Teste Rápido - Login com Google

## ⚡ **Teste Rápido (5 minutos)**

### **1. Verificar se o código está correto** ✅

- [x] Botão "Continuar com Google" implementado
- [x] Função `loginWithGoogle()` criada
- [x] Função `handleAuthCallback()` criada
- [x] Rota `/auth/callback` configurada
- [x] Página `AuthCallback.jsx` criada

### **2. Verificar se o servidor está rodando**

```bash
# Se não estiver rodando, execute:
npm run dev
```

### **3. Acessar a página de login**

1. **Abra:** `http://localhost:3000/login`
2. **Verifique:**
   - ✅ Botão "Continuar com Google" aparece
   - ✅ Botão está habilitado (não está desabilitado)

### **4. Testar o botão (sem configuração)**

**Cenário:** Google OAuth não configurado no Supabase

1. **Clique em:** "Continuar com Google"
2. **Resultado esperado:**
   - ❌ Aparece mensagem de erro
   - ✅ Mensagem é clara: "Erro ao fazer login com Google. Verifique se o Google OAuth está configurado no Supabase."

### **5. Testar o fluxo completo (com configuração)**

**Pré-requisito:** Google OAuth configurado (seguir `docs/configuracao/GUIA_LOGIN_GOOGLE.md`)

1. **Clique em:** "Continuar com Google"
2. **Resultado esperado:**
   - ✅ Redireciona para página do Google
   - ✅ Página de consentimento aparece
   - ✅ Após autorizar, retorna para `/auth/callback`
   - ✅ Página mostra "Processando autenticação..."
   - ✅ Redireciona para o portal correto

---

## 🔍 **Verificações no Console**

Abra o DevTools (F12) → Console:

### **Sem configuração:**
```
[ERROR] Erro no login com Google: [mensagem de erro]
```

### **Com configuração:**
```
[SW] Service Worker registrado com sucesso: ...
```

**Sem erros críticos!**

---

## ✅ **Checklist de Teste**

### **Interface:**
- [ ] Botão "Continuar com Google" aparece
- [ ] Ícone do Google está visível
- [ ] Botão não está desabilitado
- [ ] Estados de loading funcionam

### **Funcionalidade (sem config):**
- [ ] Mensagem de erro aparece
- [ ] Mensagem é clara e informativa
- [ ] Botão volta ao estado normal após erro

### **Funcionalidade (com config):**
- [ ] Redireciona para Google
- [ ] Retorna para callback
- [ ] Processa autenticação
- [ ] Redireciona para portal correto

---

## 🐛 **Problemas Comuns**

### **Problema: Botão não aparece**

**Solução:**
1. Verifique se o componente foi salvo
2. Recarregue a página (Ctrl+F5)
3. Verifique o console para erros

### **Problema: Erro ao clicar**

**Solução:**
1. Verifique se Supabase está configurado
2. Verifique `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Verifique o console para detalhes do erro

### **Problema: Redirecionamento infinito**

**Solução:**
1. Verifique se a rota `/auth/callback` está configurada
2. Verifique se `handleAuthCallback` está funcionando
3. Verifique o console para erros

---

## 📊 **Resultado Esperado**

### **✅ Teste Bem-Sucedido:**
- Botão aparece e funciona
- Sem erros no console
- Fluxo completo funciona (se configurado)

### **❌ Teste Falhou:**
- Verificar erros no console
- Seguir troubleshooting
- Verificar configuração do Supabase

---

## 🎯 **Próximos Passos**

Após teste bem-sucedido:

1. ✅ Configurar Google OAuth no Supabase
2. ✅ Testar fluxo completo
3. ✅ Verificar criação de usuário
4. ✅ Testar redirecionamento por role

---

**Status:** ✅ **Pronto para Teste**

**Tempo estimado:** 5 minutos

