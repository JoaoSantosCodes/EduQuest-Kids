# 🔧 Correção do Erro de Registro

## ❌ Problema

Erro ao criar conta:
```
null value in column "password_hash" of relation "users" violates not-null constraint
```

## 🔍 Causa

O schema SQL exige que `password_hash` seja `NOT NULL`, mas quando usamos **Supabase Auth**, a senha é gerenciada na tabela `auth.users` do Supabase, não na nossa tabela `users` customizada.

## ✅ Solução

### Opção 1: Tornar password_hash nullable (Recomendado)

Execute este SQL no Supabase SQL Editor:

```sql
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

Ou use o arquivo `fix_password_hash_nullable.sql` que foi criado.

### Opção 2: Usar hash placeholder

O código já foi ajustado para usar um placeholder vazio (`''`), mas o schema ainda requer NOT NULL.

## 📋 Passos para Corrigir

1. **Acesse o Supabase Dashboard:**
   - Vá em: SQL Editor
   
2. **Execute a migração:**
   ```sql
   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
   ```

3. **Ou execute o arquivo completo:**
   - Copie o conteúdo de `fix_password_hash_nullable.sql`
   - Cole no SQL Editor
   - Execute

4. **Teste novamente:**
   - Acesse: http://localhost:3000/register
   - Crie uma conta de teste
   - Deve funcionar agora!

## ✅ Depois de Corrigir

O registro funcionará corretamente:
- ✅ Criar usuário no Supabase Auth
- ✅ Criar registro na tabela `users` (sem erro de password_hash)
- ✅ Criar registro na tabela específica (students, teachers, parents)
- ✅ Redirecionar para o portal correto

## 📝 Nota

Esta é a melhor prática quando se usa Supabase Auth:
- A senha é armazenada em `auth.users` (gerenciado pelo Supabase)
- Nossa tabela `users` armazena apenas metadados (nome, role, etc.)
- Não precisamos duplicar o `password_hash`

