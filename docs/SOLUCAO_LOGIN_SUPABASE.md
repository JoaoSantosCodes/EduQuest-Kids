# 🔧 SOLUÇÃO: Erro de Login com Supabase

## ❌ PROBLEMA IDENTIFICADO

Você configurou o Supabase (✅ conexão funcionando!), mas o usuário `aluno@teste.com` não existe no banco de dados do Supabase.

**Erro visto:**
```
AuthApiError: Invalid login credentials
```

---

## ✅ SOLUÇÃO: Criar Usuário no Supabase

### **Opção 1: Registrar pela Interface (MAIS FÁCIL)**

1. **Acesse a página de registro:**
   ```
   http://localhost:3000/register
   ```

2. **Preencha o formulário:**
   - **Nome:** João Silva
   - **Email:** aluno@teste.com
   - **Senha:** 123456
   - **Tipo:** Student (Aluno)
   - **Série:** 7º ano
   - **Escola:** Escola Teste

3. **Clique em "Criar Conta"**

4. **Pronto!** O usuário será criado no Supabase e você será logado automaticamente!

---

### **Opção 2: Criar Usuário Direto no Supabase Dashboard**

1. **Acesse o Supabase Dashboard:**
   - https://app.supabase.com
   - Selecione seu projeto

2. **Vá em Authentication → Users**

3. **Clique em "Add User"**

4. **Preencha:**
   - Email: aluno@teste.com
   - Password: 123456
   - Confirm: Yes

5. **Salve**

6. **Agora tente fazer login novamente!**

---

### **Opção 3: Usar Sistema Mock (Sem Supabase)**

Se você quer testar SEM o Supabase agora, desative temporariamente:

1. **Renomeie ou delete o arquivo `.env`:**
   ```bash
   # Renomear
   ren .env .env.backup
   
   # Ou deletar temporariamente
   del .env
   ```

2. **Reinicie o servidor:**
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

3. **Agora use os usuários mock:**
   - aluno@teste.com / 123456
   - professor@teste.com / 123456
   - pai@teste.com / 123456
   - coordenador@teste.com / 123456

---

## 🎯 RECOMENDAÇÃO

**Use a Opção 1!** É a mais fácil e rápida:

```
1. Acesse: http://localhost:3000/register
2. Crie sua conta
3. Faça login automaticamente!
```

---

## ⚠️ IMPORTANTE

### **Por que não funcionou?**

O sistema detecta automaticamente se o Supabase está configurado:
- ✅ **Se .env existe:** Usa Supabase (precisa de usuários no banco)
- ❌ **Se .env NÃO existe:** Usa Mock (usuários de teste em memória)

Como você configurou o `.env`, o sistema está tentando usar o Supabase real, mas os usuários mock não existem lá!

### **Solução:**
- **Registre os usuários no Supabase** OU
- **Remova o .env temporariamente para usar o Mock**

---

## 📝 VERIFICAR SE SCHEMA SQL FOI EXECUTADO

Antes de registrar, verifique se você executou o schema SQL no Supabase:

1. **Abra o Supabase Dashboard**
2. **Vá em SQL Editor**
3. **Execute os arquivos SQL (se ainda não executou):**
   - Schema principal (veja `docs/EduQuiz - Schema SQL Completo.txt`)
   - `docs/fix_password_hash_nullable.sql`
   - `docs/SUPABASE_RLS_POLICIES.sql`
   - `docs/SUPABASE_RLS_OTIMIZACAO_FINAL.sql`
   - `docs/configuracao/ATUALIZAR_TRIGGER_ROLE_NULL.sql`

**Guia completo:** `docs/guias/GUIA_SUPABASE.md`

---

## 🚀 PRÓXIMO PASSO

### **REGISTRE-SE AGORA:**

```
👉 http://localhost:3000/register

Preencha:
- Nome: Seu Nome
- Email: seuemail@teste.com
- Senha: 123456 (ou outra)
- Tipo: Student/Teacher/Parent/Coordinator

CLIQUE "CRIAR CONTA"
```

**Você será logado automaticamente após criar a conta!** ✅

---

**Dúvidas?** Veja:
- `COMO_FAZER_LOGIN.md` - Guia de login
- `ENV_EXEMPLO.md` - Configuração do .env
- `docs/guias/GUIA_SUPABASE.md` - Setup completo do Supabase

