# 🔧 SOLUÇÃO: Login com Google não funciona

## ❌ PROBLEMA

Login com Google está configurado no Supabase e Google Cloud, mas não está funcionando.

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### **1. Configuração no Google Cloud Console** ☑️

Você mencionou que já configurou, mas vamos confirmar:

#### **URLs Autorizadas de JavaScript (JavaScript origins):**
```
http://localhost:3000
http://127.0.0.1:3000
https://seu-projeto.supabase.co
```

#### **URLs de Redirecionamento Autorizadas (Authorized redirect URIs):**
```
https://seu-projeto.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

**⚠️ IMPORTANTE:** Copie a URL EXATA do Supabase Dashboard → Authentication → Providers → Google → "Callback URL"

---

### **2. Configuração no Supabase** ☑️

#### **No Supabase Dashboard:**

1. **Authentication → Providers → Google**
2. **Ativar Google enabled:** ✅ ON
3. **Client ID (Google):** Cole o Client ID do Google Cloud
4. **Client Secret (Google):** Cole o Secret do Google Cloud
5. **Redirect URL:** Deve ser `https://[seu-projeto].supabase.co/auth/v1/callback`

---

### **3. URL de Callback no App** ☑️

Verifique se o `redirectTo` está correto. Atualmente está:

```javascript
redirectTo: `${window.location.origin}/auth/callback`
```

Isso deve gerar: `http://localhost:3000/auth/callback` ✅

---

## 🐛 PROBLEMAS COMUNS

### **Problema 1: URL de Callback Incorreta**

**Sintoma:** Google redireciona, mas dá erro "redirect_uri_mismatch"

**Solução:**
1. Vá no Google Cloud Console
2. Copie a URL EXATA do Supabase: `https://[projeto].supabase.co/auth/v1/callback`
3. Cole nas "Authorized redirect URIs"
4. Aguarde 5 minutos (propagação do Google)

---

### **Problema 2: Client ID ou Secret Incorretos**

**Sintoma:** Nada acontece ao clicar em "Continuar com Google"

**Solução:**
1. Vá no Google Cloud Console
2. Copie o Client ID e Secret novamente
3. Cole no Supabase Dashboard → Authentication → Providers → Google
4. **IMPORTANTE:** Clique em "Save" no Supabase!

---

### **Problema 3: Site Settings no Supabase**

**Sintoma:** Callback funciona, mas não redireciona corretamente

**Solução:**
1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:** Adicione:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

---

### **Problema 4: OAuth Consent Screen**

**Sintoma:** Google mostra erro "This app isn't verified"

**Solução:**
1. Google Cloud Console → OAuth consent screen
2. **Status:** Deve estar "In production" ou "Testing"
3. Se "Testing", adicione seu email em "Test users"

---

## 🔧 CORREÇÕES APLICADAS NO CÓDIGO

✅ Melhorei o tratamento de erros e adicionei logs detalhados para debug do login com Google.

Agora você verá no console:
```
[GOOGLE LOGIN] Iniciando login com Google...
[GOOGLE LOGIN] Redirect URL: http://localhost:3000/auth/callback
[GOOGLE LOGIN] Resposta do Supabase: ...
```

---

## 🧪 TESTE PASSO A PASSO

### **Passo 1: Limpar Cache e Cookies**
