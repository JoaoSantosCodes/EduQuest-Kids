# ✅ Solução Definitiva: Erro de RLS no Registro

## 🔴 Problema Identificado

O erro `42501: new row violates row-level security policy for table "users"` ocorria porque:

1. **Timing Issue:** Quando o usuário se registra via `supabase.auth.signUp()`, o `auth.uid()` pode não estar disponível imediatamente no momento da inserção na tabela `users`.

2. **Política RLS:** Mesmo com a política de INSERT (`auth.uid() = id`), o contexto de autenticação pode não estar totalmente estabelecido.

## ✅ Solução Implementada

### **1. Trigger Automático no Supabase**

Criamos uma **trigger** que cria automaticamente o registro na tabela `users` quando um usuário é criado no `auth.users`:

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
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Vantagens:**
- ✅ Executa automaticamente após criação no `auth.users`
- ✅ Usa `SECURITY DEFINER` para contornar RLS
- ✅ Evita problemas de timing
- ✅ Mais seguro e confiável

### **2. Código Atualizado**

O código em `supabaseAuthService.js` foi atualizado para:

1. **Aguardar a trigger** executar (500ms)
2. **Buscar o registro** criado pela trigger
3. **Fallback:** Se não encontrar, tentar criar manualmente (com retry)
4. **Tratamento de erros** melhorado

## 🧪 Como Testar

1. **Acesse a página de registro**
2. **Preencha os dados:**
   - Nome
   - Email
   - Senha
   - Role (Aluno, Professor ou Pai)
   - Dados adicionais (série, escola, etc.)
3. **Clique em "Criar Conta"**
4. **Resultado esperado:**
   - ✅ Registro criado com sucesso
   - ✅ Redirecionamento para o portal correto
   - ✅ Sem erros de RLS no console

## 📋 Verificações

### **Verificar se a trigger foi criada:**

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### **Verificar se a função existe:**

```sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### **Testar a trigger manualmente:**

```sql
-- Isso não deve funcionar diretamente, mas a trigger deve ser executada
-- quando um novo usuário é criado via Supabase Auth
```

## ⚠️ Se o Problema Persistir

Se ainda houver erros, verifique:

1. **A trigger foi criada?**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **A função tem permissões corretas?**
   - A função usa `SECURITY DEFINER`, então deve ter permissões adequadas

3. **Verificar logs do Supabase:**
   - Acesse o Dashboard do Supabase
   - Vá em "Logs" → "Database"
   - Verifique se há erros relacionados à trigger

4. **Verificar se o campo `password_hash` é nullable:**
   ```sql
   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
   ```

## 🎯 Status

- [x] Trigger criada
- [x] Função `handle_new_user()` criada
- [x] Código atualizado com retry logic
- [x] Tratamento de erros melhorado
- [ ] Teste de registro realizado
- [ ] Problema resolvido

---

## 📝 Notas Técnicas

### **Por que usar SECURITY DEFINER?**

A função usa `SECURITY DEFINER` para executar com as permissões do criador da função (geralmente o superusuário), permitindo contornar as políticas RLS durante a inserção automática.

### **Por que ON CONFLICT DO NOTHING?**

Evita erros se o registro já existir (por exemplo, se o usuário tentar registrar novamente ou se houver algum problema de timing).

### **Por que aguardar 500ms?**

Dá tempo para a trigger executar antes de tentar buscar o registro. Em sistemas com alta carga, pode ser necessário aumentar esse tempo.

---

## ✅ Conclusão

A solução implementada é mais robusta e confiável que a abordagem anterior. A trigger garante que o registro seja criado automaticamente, evitando problemas de timing e RLS.

Teste agora e me avise se funcionou! 🚀

