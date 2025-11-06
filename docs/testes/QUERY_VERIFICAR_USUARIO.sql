-- ================================================
-- QUERIES PARA VERIFICAR DADOS DO USUÁRIO
-- ================================================

-- 1. Buscar todos os dados do usuário na tabela users
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  updated_at
FROM public.users
WHERE email = 'suporteshownerd@gmail.com';

-- 2. Buscar dados do usuário em auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'suporteshownerd@gmail.com';

-- 3. Verificar se existe registro em students
SELECT 
  s.id,
  s.user_id,
  s.grade,
  s.school,
  s.created_at,
  u.email,
  u.name,
  u.role
FROM public.students s
LEFT JOIN public.users u ON s.user_id = u.id
WHERE u.email = 'suporteshownerd@gmail.com';

-- 4. Verificar se existe registro em teachers
SELECT 
  t.id,
  t.user_id,
  t.school,
  t.created_at,
  u.email,
  u.name,
  u.role
FROM public.teachers t
LEFT JOIN public.users u ON t.user_id = u.id
WHERE u.email = 'suporteshownerd@gmail.com';

-- 5. Verificar se existe registro em parents
SELECT 
  p.id,
  p.user_id,
  p.created_at,
  u.email,
  u.name,
  u.role
FROM public.parents p
LEFT JOIN public.users u ON p.user_id = u.id
WHERE u.email = 'suporteshownerd@gmail.com';

-- 6. Verificar se existe registro em coordinators
SELECT 
  c.id,
  c.user_id,
  c.school,
  c.created_at,
  u.email,
  u.name,
  u.role
FROM public.coordinators c
LEFT JOIN public.users u ON c.user_id = u.id
WHERE u.email = 'suporteshownerd@gmail.com';

-- 7. Verificar se a trigger existe e está habilitada
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  tgtype as trigger_type
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 8. Verificar a função da trigger
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- ================================================
-- QUERIES PARA CORRIGIR PROBLEMAS
-- ================================================

-- 9. Se role for 'student' mas não existir registro em students, criar:
INSERT INTO public.students (user_id, grade, school)
SELECT 
  id,
  7,
  ''
FROM public.users
WHERE email = 'suporteshownerd@gmail.com'
  AND role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM public.students WHERE user_id = public.users.id
  );

-- 10. Se role for NULL, definir como NULL explicitamente para forçar seleção:
UPDATE public.users 
SET role = NULL 
WHERE email = 'suporteshownerd@gmail.com'
  AND role IS NULL;

-- 11. Verificar todas as políticas RLS da tabela users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 12. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'students', 'teachers', 'parents', 'coordinators');

-- ================================================
-- QUERY COMPLETA PARA DIAGNÓSTICO
-- ================================================

-- 13. Query completa para ver todos os dados do usuário
WITH user_data AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    au.email_confirmed_at,
    au.raw_user_meta_data
  FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE u.email = 'suporteshownerd@gmail.com'
)
SELECT 
  ud.*,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.students WHERE user_id = ud.user_id) THEN 'Sim'
    ELSE 'Não'
  END as tem_registro_student,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.teachers WHERE user_id = ud.user_id) THEN 'Sim'
    ELSE 'Não'
  END as tem_registro_teacher,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.parents WHERE user_id = ud.user_id) THEN 'Sim'
    ELSE 'Não'
  END as tem_registro_parent,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.coordinators WHERE user_id = ud.user_id) THEN 'Sim'
    ELSE 'Não'
  END as tem_registro_coordinator
FROM user_data ud;

