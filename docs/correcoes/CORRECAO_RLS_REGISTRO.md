# 🔧 Correção: Erro de RLS no Registro de Usuários

## ❌ Problema Identificado

O erro `42501: new row violates row-level security policy for table "users"` ocorre porque:

1. **A política RLS para INSERT não existia** - Quando tentamos inserir um registro na tabela `users` durante o registro, a política RLS estava bloqueando porque não havia uma política que permitisse INSERT.

2. **Políticas existentes:**
   - ✅ "Users can view own data" - SELECT
   - ✅ "Users can update own data" - UPDATE
   - ❌ **Faltava:** "Users can insert own data" - INSERT

## ✅ Solução Aplicada

Foi criada uma migração no Supabase que adiciona a política de INSERT:

```sql
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

Esta política permite que usuários autenticados insiram seus próprios dados quando o `id` corresponde ao `auth.uid()`.

## 📝 Verificação

Para verificar se a política foi criada:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT';
```

## 🧪 Teste

Agora você pode testar novamente o registro:

1. Acesse a página de registro
2. Preencha os dados
3. Clique em "Criar Conta"
4. O registro deve funcionar sem erros de RLS

## ⚠️ Nota Importante

Se o erro persistir, pode ser necessário usar uma **trigger** no Supabase que cria automaticamente o registro na tabela `users` quando um usuário é criado no Supabase Auth. Isso é uma prática comum e mais segura.

### Solução Alternativa (se necessário):

Criar uma função trigger que insere automaticamente na tabela `users` quando um usuário é criado no Supabase Auth:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    '' -- password_hash é gerenciado pelo Supabase Auth
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Esta solução alternativa é mais segura porque:
- Não requer que o cliente tenha permissão de INSERT
- Garante que o registro é criado automaticamente
- Evita problemas de sincronização

---

## ✅ Status

- [x] Política de INSERT criada
- [ ] Teste de registro realizado
- [ ] Problema resolvido

