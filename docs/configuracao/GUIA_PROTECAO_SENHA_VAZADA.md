# 🔒 Guia: Habilitar Proteção de Senha Vazada no Supabase

## 📋 O Que É

O Supabase Auth oferece proteção contra senhas vazadas, verificando se a senha do usuário está em uma lista de senhas comprometidas (HaveIBeenPwned.org).

## ⚠️ Status Atual

**Proteção de senha vazada está DESABILITADA** no seu projeto Supabase.

## ✅ Como Habilitar

### **Passo 1: Acessar Configurações de Auth**

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Settings** → **Auth** → **Password**

### **Passo 2: Habilitar Proteção**

1. Na seção **"Password Security"**, encontre a opção:
   - **"Leaked Password Protection"** ou **"HIBP (Have I Been Pwned)"**
2. Ative a opção (toggle ON)
3. Clique em **"Save"** ou **"Update"**

### **Passo 3: Testar (Opcional)**

1. Tente registrar um novo usuário com uma senha comum (ex: "password123")
2. O sistema deve rejeitar a senha com uma mensagem de erro

## 📊 Benefícios

- ✅ **Segurança:** Previne uso de senhas comprometidas
- ✅ **Proteção:** Reduz risco de contas comprometidas
- ✅ **Conformidade:** Alinha com boas práticas de segurança

## ⚠️ Observações

- **Performance:** A verificação adiciona uma pequena latência ao registro
- **Rate Limiting:** O Supabase gerencia automaticamente as requisições ao HIBP
- **Privacy:** A senha não é enviada completa, apenas um hash parcial

## 🔗 Links Úteis

- [Supabase Auth - Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Have I Been Pwned](https://haveibeenpwned.com/)

---

**Status:** ⏳ **Pendente** - Habilitar manualmente no Supabase Dashboard

