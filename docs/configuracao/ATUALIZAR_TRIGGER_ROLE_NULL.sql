-- ============================================
-- ATUALIZAR TRIGGER PARA PERMITIR ROLE NULL
-- ============================================
-- Este script atualiza a trigger handle_new_user para não definir
-- role padrão como 'student', permitindo que o usuário selecione
-- o role após login com Google.

-- ============================================
-- 1. Atualizar função handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    -- Não definir role padrão - deixar NULL para permitir seleção
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), NULL),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    -- Atualizar role apenas se não estiver definido
    role = COALESCE(users.role, EXCLUDED.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================
-- 2. Verificar se a trigger existe
-- ============================================
-- Se a trigger não existir, criá-la:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ============================================
-- 3. Verificar função e trigger
-- ============================================
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Esta atualização permite que novos usuários façam login com Google
--    sem role definido, permitindo seleção posterior.
--
-- 2. Usuários existentes não serão afetados (role mantido).
--
-- 3. A função usa ON CONFLICT para atualizar registros existentes
--    sem sobrescrever o role se já estiver definido.
--
-- 4. O role NULL permite que o sistema mostre a tela de seleção
--    de role após login com Google.

