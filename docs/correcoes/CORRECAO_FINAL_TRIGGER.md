# ✅ Correção Final: Trigger e Erros 406

## 🔴 Problemas Identificados

1. **Trigger `on_user_created_role` no lugar errado**
   - Estava sendo executada em `public.users`
   - Tentava acessar `NEW.raw_user_meta_data` que não existe em `users`
   - Deveria ser executada em `auth.users` ou criar tudo de uma vez

2. **Erro 406 (PGRST116) ao buscar aluno**
   - Uso de `.single()` quando registro ainda não existe
   - Causa erro "Cannot coerce the result to a single JSON object"

3. **Erro 401 (Unauthorized) ao criar registros**
   - RLS bloqueando INSERT mesmo com políticas criadas
   - Problema de timing: usuário não está totalmente autenticado ainda

## ✅ Soluções Aplicadas

### **1. Trigger Unificada** ✅

**Antes:**
- `on_auth_user_created`: Criava registro em `users`
- `on_user_created_role`: Tentava criar em `students/teachers/parents` (mas falhava)

**Agora:**
- `on_auth_user_created`: Cria TUDO de uma vez:
  - Registro em `users`
  - Registro em `students/teachers/parents` baseado no role
  - Usa `SECURITY DEFINER` para contornar RLS
  - Acessa `raw_user_meta_data` diretamente de `auth.users`

### **2. Correção de Erros 406** ✅

**Trocado `.single()` por `.maybeSingle()`:**
- ✅ `getStudentByUserId()` - agora usa `.maybeSingle()`
- ✅ `getStudentStats()` - agora usa `.maybeSingle()`
- ✅ Evita erro 406 quando registro não existe ainda

### **3. Retry Logic no Hook** ✅

**Atualizado `useStudent.js`:**
- ✅ Ignora erro 406 (PGRST116) se não houver registro
- ✅ Aguarda 2 segundos se registro não encontrado
- ✅ Tenta buscar novamente (para dar tempo da trigger executar)
- ✅ Trata graciosamente quando registro não existe

## 📋 Fluxo Completo Atualizado

### **1. Usuário faz SignUp**
```javascript
supabase.auth.signUp({
  email: 'aluno@teste.com',
  password: 'senha123',
  options: {
    data: {
      name: 'Aluno Teste',
      role: 'student',
      grade: 7,
      school: 'Escola Teste'
    }
  }
})
```

### **2. Trigger `on_auth_user_created` executa automaticamente**
- ✅ Cria registro em `public.users` com dados do `auth.users`
- ✅ Detecta `role = 'student'`
- ✅ Cria registro em `public.students` com `grade` e `school`
- ✅ Usa `SECURITY DEFINER` para contornar RLS
- ✅ Tudo acontece em uma única transação

### **3. Código aguarda e busca os registros**
- ✅ Aguarda 1000ms para trigger executar
- ✅ Busca registro em `users` (criado pela trigger)
- ✅ Busca registro em `students` (criado pela trigger)
- ✅ Se não encontrar, aguarda 2s e tenta novamente (retry)
- ✅ Se ainda não encontrar, continua sem erro (fallback)

## ✅ Vantagens desta Solução

1. **✅ Trigger Unificada**
   - Tudo acontece em uma única transação
   - Não depende de timing entre triggers
   - Mais confiável e consistente

2. **✅ Sem Erros 406**
   - `.maybeSingle()` retorna `null` se não encontrar
   - Não lança erro quando registro não existe
   - Tratamento gracioso de casos onde registro ainda não foi criado

3. **✅ Retry Logic Inteligente**
   - Aguarda se registro não encontrado
   - Tenta novamente após alguns segundos
   - Continua mesmo se não encontrar (fallback)

## 🧪 Como Testar

1. **Limpar console** (F12 → Console → Clear)
2. **Acessar página de registro**
3. **Preencher dados:**
   - Nome: "Aluno Teste"
   - Email: "aluno@teste.com"
   - Senha: "senha123"
   - Role: "Aluno"
   - Série: "7"
   - Escola: "Escola Teste"
4. **Clicar em "Criar Conta"**
5. **Verificar:**
   - ✅ Não deve ter erro 406
   - ✅ Não deve ter erro 42501 (RLS)
   - ✅ Não deve ter erro 401 (Unauthorized)
   - ✅ Deve criar registro com sucesso
   - ✅ Deve redirecionar para `/student`
   - ✅ Dashboard deve carregar sem erros

## 📋 Verificações no Supabase

### **Verificar trigger:**

```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
```

### **Verificar função:**

```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### **Testar registro manualmente:**

```sql
-- Ver último usuário criado no auth
SELECT id, email, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- Ver último registro em users
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;

-- Ver último registro em students
SELECT * FROM students ORDER BY created_at DESC LIMIT 1;
```

## ✅ Status

- [x] Trigger unificada criada
- [x] Trigger antiga removida
- [x] Função `handle_new_user_role` removida
- [x] `.single()` trocado por `.maybeSingle()` em `getStudentByUserId`
- [x] `.single()` trocado por `.maybeSingle()` em `getStudentStats`
- [x] Retry logic implementado em `useStudent`
- [x] Tratamento de erros 406 melhorado
- [ ] Teste de registro realizado
- [ ] Problema resolvido

---

## 🎯 Resultado Esperado

Após todas as correções:

1. ✅ **Usuário faz signUp()**
2. ✅ **Trigger cria tudo de uma vez** (users + students/teachers/parents)
3. ✅ **Código busca os registros** (verificação)
4. ✅ **Se não encontrar, aguarda e tenta novamente** (retry)
5. ✅ **Registro completo criado** ✅
6. ✅ **Redirecionamento para portal correto** ✅
7. ✅ **Dashboard carrega sem erros** ✅

---

## 🚀 Próximos Passos

1. **Testar o registro** seguindo os passos acima
2. **Verificar se funcionou** sem erros
3. **Se funcionar**, o sistema está completo!
4. **Se ainda houver problemas**, verificar logs do Supabase

Teste agora e me avise o resultado! 🎉

