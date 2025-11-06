# 🔍 Verificar Dados do Usuário no Banco

## 🎯 Situação Atual

- ✅ Usuário criado no Supabase (`auth.users`)
- ✅ Usuário aparece na tabela de autenticação
- ❌ Login não funciona - sessão não é estabelecida

## 📋 Verificações Necessárias

### **1. Verificar se o usuário tem `role` definido**

1. Abra o Supabase Dashboard
2. Vá para "Table Editor"
3. Abra a tabela `users`
4. Procure pelo email do usuário logado
5. Verifique as colunas:
   - `id`: Deve existir
   - `email`: Deve existir
   - `role`: **VERIFICAR SE NÃO É NULL**
   - `created_at`: Deve existir

### **2. Verificar se o registro existe na tabela correspondente**

Dependendo do `role` do usuário, verifique:

- Se `role = 'student'`: Verifique se existe registro em `students` com `user_id` correspondente
- Se `role = 'teacher'`: Verifique se existe registro em `teachers` com `user_id` correspondente
- Se `role = 'parent'`: Verifique se existe registro em `parents` com `user_id` correspondente
- Se `role = 'coordinator'`: Verifique se existe registro em `coordinators` com `user_id` correspondente

### **3. Verificar se a trigger executou corretamente**

Execute esta query no SQL Editor do Supabase:

```sql
-- Verificar se a trigger existe
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Verificar a função da trigger
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

## 🔧 Possíveis Problemas e Soluções

### **Problema 1: `role` é NULL**

**Causa:** A trigger não definiu o `role` ao criar o usuário.

**Solução:**
1. Abra o SQL Editor no Supabase
2. Execute:
```sql
-- Atualizar role para NULL explicitamente (para forçar seleção)
UPDATE public.users 
SET role = NULL 
WHERE email = 'suporteshownerd@gmail.com';
```
3. Tente fazer login novamente
4. Você deve ver a tela de seleção de role

### **Problema 2: Registro não existe na tabela correspondente**

**Causa:** A trigger não criou o registro na tabela `students/teachers/parents/coordinators`.

**Solução:**
1. Verifique qual `role` o usuário tem na tabela `users`
2. Execute a query correspondente:

```sql
-- Para students
INSERT INTO public.students (user_id, grade, school)
VALUES (
  (SELECT id FROM public.users WHERE email = 'suporteshownerd@gmail.com'),
  7,
  ''
)
ON CONFLICT (user_id) DO NOTHING;

-- Para teachers
INSERT INTO public.teachers (user_id, school)
VALUES (
  (SELECT id FROM public.users WHERE email = 'suporteshownerd@gmail.com'),
  ''
)
ON CONFLICT (user_id) DO NOTHING;

-- Para parents
INSERT INTO public.parents (user_id)
VALUES (
  (SELECT id FROM public.users WHERE email = 'suporteshownerd@gmail.com')
)
ON CONFLICT (user_id) DO NOTHING;

-- Para coordinators
INSERT INTO public.coordinators (user_id, school)
VALUES (
  (SELECT id FROM public.users WHERE email = 'suporteshownerd@gmail.com'),
  ''
)
ON CONFLICT (user_id) DO NOTHING;
```

### **Problema 3: Clock Skew está impedindo a sessão**

**Causa:** O relógio do Windows está desincronizado.

**Solução:**
1. Pressione `Win + I`
2. Vá para "Hora e idioma" → "Data e hora"
3. Ative "Definir hora automaticamente"
4. Clique em "Sincronizar agora"
5. Abra o PowerShell como Administrador
6. Execute: `w32tm /resync`
7. Reinicie o navegador e tente novamente

### **Problema 4: RLS está bloqueando a leitura**

**Causa:** As políticas RLS podem estar impedindo a leitura dos dados do usuário.

**Solução temporária para teste:**
1. Abra o SQL Editor no Supabase
2. Execute:
```sql
-- Desabilitar RLS temporariamente para teste
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinators DISABLE ROW LEVEL SECURITY;
```
3. Tente fazer login novamente
4. Se funcionar, o problema é RLS
5. **IMPORTANTE:** Reative RLS depois do teste:
```sql
-- Reativar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinators ENABLE ROW LEVEL SECURITY;
```

## 📝 Próximos Passos

1. **Verifique os dados do usuário no banco:**
   - Email: `suporteshownerd@gmail.com`
   - Verificar se tem `role` definido
   - Verificar se existe registro na tabela correspondente

2. **Execute as queries acima conforme necessário**

3. **Sincronize o relógio do Windows**

4. **Teste novamente:**
   - Reinicie o servidor (`Ctrl + C` e `npm run dev`)
   - Limpe o cache do navegador
   - Faça logout
   - Tente fazer login com Google novamente

5. **Verifique os logs no console:**
   - Agora os logs devem aparecer em três níveis (log, warn, error)
   - Se não aparecerem, o código não foi recarregado

## ⚠️ Informações Importantes

- Os 3 usuários no banco têm `Provider: Google` e `Provider type: Social`
- Isso confirma que o OAuth está funcionando
- O problema está no estabelecimento da sessão após o callback

---

**Próximo passo recomendado:** Verificar se o usuário `suporteshownerd@gmail.com` tem `role` definido na tabela `users` e se existe registro na tabela correspondente.

