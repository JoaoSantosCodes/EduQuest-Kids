# 🔧 RESOLVER LOGIN GOOGLE AGORA!

## ❌ **PROBLEMA IDENTIFICADO:**

Vejo no Supabase que você tem **3 usuários Google**, mas eles provavelmente **não têm `role` definido** na tabela `users`.

Quando o usuário faz login com Google, a trigger cria o registro na tabela `users`, mas o campo `role` fica NULL, e o app não sabe para onde redirecionar.

---

## ✅ **SOLUÇÃO RÁPIDA (2 minutos):**

### **Execute este SQL no Supabase Dashboard:**

```sql
-- Ver usuários sem role
SELECT id, email, name, role, created_at 
FROM users 
WHERE role IS NULL;

-- Atualizar usuários existentes com role
-- IMPORTANTE: Ajuste o email para os emails reais dos seus usuários

-- Exemplo: Definir um usuário como student
UPDATE users 
SET role = 'student' 
WHERE email = 'suporteshownerd@gmail.com';

-- Exemplo: Definir um usuário como teacher
UPDATE users 
SET role = 'teacher' 
WHERE email = 'supernerdconectado@gmail.com';

-- Exemplo: Definir um usuário como parent  
UPDATE users 
SET role = 'parent' 
WHERE email = 'jstudio.aurantis@gmail.com';

-- Verificar se funcionou
SELECT id, email, name, role 
FROM users;
```

---

## 🎯 **PASSO A PASSO:**

### **1. Abra o Supabase Dashboard**
- https://app.supabase.com
- Selecione seu projeto "EduQuest Kids"

### **2. Vá em SQL Editor**
- Menu lateral → SQL Editor
- New Query

### **3. Copie e Cole este SQL:**

```sql
-- Ver todos os usuários e seus roles atuais
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

### **4. Clique em "Run" (▶️)**

Você verá algo assim:
```
email                              | role
-----------------------------------|------
suporteshownerd@gmail.com         | null
supernerdconectado@gmail.com      | null  
jstudio.aurantis@gmail.com        | null
```

### **5. Atualize os Roles:**

Cole e execute:

```sql
-- Atualizar com os emails corretos dos seus usuários
UPDATE users SET role = 'student' WHERE email = 'suporteshownerd@gmail.com';
UPDATE users SET role = 'teacher' WHERE email = 'supernerdconectado@gmail.com';
UPDATE users SET role = 'coordinator' WHERE email = 'jstudio.aurantis@gmail.com';
```

### **6. Criar Registros nas Tabelas Específicas:**

Após definir os roles, execute:

```sql
-- Para o student
INSERT INTO students (user_id, grade, school)
SELECT id, 7, 'Escola Teste'
FROM users 
WHERE email = 'suporteshownerd@gmail.com' 
AND role = 'student'
ON CONFLICT (user_id) DO NOTHING;

-- Para o teacher
INSERT INTO teachers (user_id, school)
SELECT id, 'Escola Teste'
FROM users 
WHERE email = 'supernerdconectado@gmail.com' 
AND role = 'teacher'
ON CONFLICT (user_id) DO NOTHING;

-- Para o coordinator
INSERT INTO coordinators (user_id, school)
SELECT id, 'Escola Teste'
FROM users 
WHERE email = 'jstudio.aurantis@gmail.com' 
AND role = 'coordinator'
ON CONFLICT (user_id) DO NOTHING;
```

### **7. Verificar:**

```sql
SELECT 
  u.email, 
  u.role,
  CASE 
    WHEN s.id IS NOT NULL THEN 'students ✅'
    WHEN t.id IS NOT NULL THEN 'teachers ✅'
    WHEN p.id IS NOT NULL THEN 'parents ✅'
    WHEN c.id IS NOT NULL THEN 'coordinators ✅'
    ELSE 'FALTANDO ❌'
  END as registro_especifico
FROM users u
LEFT JOIN students s ON s.user_id = u.id
LEFT JOIN teachers t ON t.user_id = u.id
LEFT JOIN parents p ON p.user_id = u.id
LEFT JOIN coordinators c ON c.user_id = u.id
ORDER BY u.created_at DESC;
```

---

## 🧪 **TESTE AGORA:**

1. **Faça logout** (se estiver logado)
2. **Acesse:** http://localhost:3000/login
3. **Clique** em "Continuar com Google"
4. **Escolha** uma das contas que você atualizou
5. **PRONTO!** Deve logar e redirecionar corretamente!

---

## 🔄 **PARA NOVOS USUÁRIOS GOOGLE:**

Para que novos usuários funcionem automaticamente, execute a trigger atualizada:

```sql
-- Atualizar trigger para criar role student por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'student'), -- Define 'student' como padrão
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    role = COALESCE(users.role, EXCLUDED.role);

  -- Criar registro na tabela students para role student
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.students (user_id, grade, school)
    VALUES (NEW.id, 7, '')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
```

---

## ⚡ **SOLUÇÃO SUPER RÁPIDA (1 linha):**

Se você só quer testar AGORA, execute isto:

```sql
-- Define TODOS os usuários sem role como 'student' e cria os registros
WITH updated_users AS (
  UPDATE users SET role = 'student' WHERE role IS NULL RETURNING id
)
INSERT INTO students (user_id, grade, school)
SELECT id, 7, 'Escola Teste' FROM updated_users
ON CONFLICT (user_id) DO NOTHING;
```

**Depois teste o login!**

---

## 📊 **POR QUE ACONTECEU:**

1. Você configurou o Google OAuth ✅
2. Usuários fizeram login com sucesso ✅  
3. Trigger criou registros na tabela `users` ✅
4. **MAS** o campo `role` ficou NULL ❌
5. App não sabe onde redirecionar ❌

**Solução:** Definir role manualmente para usuários existentes!

---

## 🎯 **RESUMO:**

1. **Execute SQL:** Atualizar roles dos usuários existentes
2. **Criar registros:** Nas tabelas students/teachers/etc
3. **Teste:** Fazer login com Google
4. **Funcionará!** ✅

---

**Depois de executar, me diga se funcionou!** 🚀

