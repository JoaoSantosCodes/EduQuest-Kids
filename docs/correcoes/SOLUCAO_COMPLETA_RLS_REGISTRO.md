# ✅ Solução Completa: Erros de RLS no Registro

## 🔴 Problemas Identificados

1. **Erro 42501 na tabela `users`** - RLS bloqueando INSERT
2. **Erro 42501 na tabela `students`** - RLS bloqueando INSERT
3. **Erro 42501 na tabela `teachers`** - RLS bloqueando INSERT  
4. **Erro 42501 na tabela `parents`** - RLS bloqueando INSERT
5. **Erro 406 (Not Acceptable)** - `.single()` retornando erro quando não encontra

## ✅ Soluções Aplicadas

### **1. Trigger Automática para `users`** ✅

Criada trigger `on_auth_user_created` que:
- Executa automaticamente após `signUp()`
- Usa `SECURITY DEFINER` para contornar RLS
- Cria registro na tabela `users` automaticamente
- Atualiza se já existir (`ON CONFLICT DO UPDATE`)

### **2. Políticas RLS para INSERT** ✅

Criadas políticas para permitir INSERT:

**Tabela `users`:**
- ✅ "Users can insert own data" - Permite INSERT quando `auth.uid() = id`

**Tabela `students`:**
- ✅ "Students can insert own data" - Permite INSERT quando `user_id = auth.uid()` e role é 'student'

**Tabela `teachers`:**
- ✅ "Teachers can insert own data" - Permite INSERT quando `user_id = auth.uid()` e role é 'teacher'

**Tabela `parents`:**
- ✅ "Parents can insert own data" - Permite INSERT quando `user_id = auth.uid()` e role é 'parent'

### **3. Código Atualizado** ✅

- ✅ Trocado `.single()` por `.maybeSingle()` para evitar erro 406
- ✅ Aumentado tempo de espera inicial (1000ms)
- ✅ Aumentado número de tentativas (5 tentativas)
- ✅ Melhor tratamento de erros de RLS com retry
- ✅ Não lança erro se falhar - continua o fluxo
- ✅ Aguarda autenticação completa antes de criar registros específicos

## 🧪 Como Testar

1. **Limpar console** (Ctrl+Shift+J → Clear)
2. **Acessar página de registro**
3. **Preencher dados:**
   - Nome: "Teste Aluno"
   - Email: "aluno@teste.com"
   - Senha: "senha123"
   - Role: "Aluno"
   - Série: "7"
4. **Clicar em "Criar Conta"**
5. **Verificar:**
   - ✅ Não deve ter erro 406
   - ✅ Não deve ter erro 42501 (RLS)
   - ✅ Não deve ter erro 401 (Unauthorized)
   - ✅ Deve criar o registro com sucesso
   - ✅ Deve redirecionar para `/student`

## 📋 Verificações no Supabase

### **Verificar políticas de INSERT:**

```sql
-- Ver todas as políticas de INSERT
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE cmd = 'INSERT'
ORDER BY tablename;
```

### **Verificar trigger:**

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### **Testar registro manualmente:**

```sql
-- Ver último usuário criado
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Ver último registro em users
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;

-- Ver último registro em students
SELECT * FROM students ORDER BY created_at DESC LIMIT 1;
```

## ⚠️ Se o Problema Persistir

Se ainda houver erros após todas as correções:

### **Opção 1: Desabilitar RLS temporariamente (APENAS PARA TESTE)**

```sql
-- ⚠️ ATENÇÃO: Desabilitar RLS apenas para testes!
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;

-- ⚠️ IMPORTANTE: Reabilitar após os testes!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
```

### **Opção 2: Verificar se a sessão está sendo usada**

O problema pode ser que após `signUp()`, a sessão não está sendo salva automaticamente. Verificar:

1. Se o Supabase está configurado para salvar sessão automaticamente
2. Se a sessão está sendo passada nas requisições subsequentes

### **Opção 3: Usar triggers para todas as tabelas**

Criar triggers que criam automaticamente os registros em `students`, `teachers`, `parents` quando um registro é criado em `users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.students (user_id, grade, school)
    VALUES (NEW.id, 7, '')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'teacher' THEN
    INSERT INTO public.teachers (user_id, school)
    VALUES (NEW.id, '')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'parent' THEN
    INSERT INTO public.parents (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_role
  AFTER INSERT ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_role();
```

## ✅ Status

- [x] Trigger para `users` criada
- [x] Políticas RLS para INSERT em `users` criadas
- [x] Políticas RLS para INSERT em `students` criadas
- [x] Políticas RLS para INSERT em `teachers` criadas
- [x] Políticas RLS para INSERT em `parents` criadas
- [x] Código atualizado com `.maybeSingle()`
- [x] Tratamento de erros melhorado
- [x] Retry logic implementado
- [ ] Teste de registro realizado
- [ ] Problema resolvido

---

## 🎯 Próximos Passos

1. **Testar o registro** seguindo os passos acima
2. **Verificar se funcionou** sem erros
3. **Se ainda houver problemas**, considerar usar triggers para todas as tabelas (Opção 3)
4. **Reportar** qualquer erro restante

Teste agora e me avise o resultado! 🚀

