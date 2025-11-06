-- ============================================
-- MIGRAÇÃO: Tornar password_hash nullable
-- ============================================
-- Esta migração torna o campo password_hash nullable
-- porque quando usamos Supabase Auth, a senha é gerenciada
-- na tabela auth.users do Supabase, não na nossa tabela users

-- Tornar password_hash nullable
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Opcional: Adicionar um valor default para compatibilidade
-- ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';

-- Verificar se funcionou
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';

