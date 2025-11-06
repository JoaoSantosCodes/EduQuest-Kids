# 🔧 Correção Final: Erro de RLS no Registro

## 🔴 Problemas Identificados

1. **Erro 406 (Not Acceptable)** nas requisições GET
   - Causa: `.single()` retorna erro 406 quando não encontra registro
   - Solução: Usar `.maybeSingle()` que retorna `null` sem erro

2. **Erro 42501 (RLS Violation)** na inserção manual
   - Causa: Política RLS bloqueando INSERT mesmo com `auth.uid() = id`
   - Solução: Usar trigger com `SECURITY DEFINER` que contorna RLS

3. **Timing Issue**
   - Causa: Trigger pode levar tempo para executar
   - Solução: Aumentar tempo de espera e número de tentativas

## ✅ Correções Aplicadas

### **1. Código Atualizado**

- ✅ Trocado `.single()` por `.maybeSingle()` para evitar erro 406
- ✅ Aumentado tempo de espera inicial de 500ms para 1000ms
- ✅ Aumentado número de tentativas de 3 para 5
- ✅ Melhorado tratamento de erros com fallback
- ✅ Adicionado try/catch nas tentativas

### **2. Trigger Melhorada**

- ✅ Função `handle_new_user()` atualizada com `SET search_path = public`
- ✅ Adicionado `ON CONFLICT DO UPDATE` para atualizar se já existir
- ✅ Melhor tratamento de valores nulos
- ✅ Trigger recriada para garantir que está ativa

### **3. Políticas RLS**

- ✅ Políticas de INSERT, UPDATE e SELECT recriadas
- ✅ Verificadas e corrigidas

## 🧪 Como Testar

1. **Limpar o console do navegador** (Ctrl+Shift+J → Clear console)
2. **Acessar a página de registro**
3. **Preencher os dados:**
   - Nome: "Teste Usuário"
   - Email: "teste@exemplo.com"
   - Senha: "senha123"
   - Role: "Aluno"
   - Série: "7"
4. **Clicar em "Criar Conta"**
5. **Verificar:**
   - ✅ Não deve ter erro 406
   - ✅ Não deve ter erro 42501 (RLS)
   - ✅ Deve criar o registro com sucesso
   - ✅ Deve redirecionar para o portal correto

## 📋 Verificações no Supabase

### **Verificar se a trigger está ativa:**

```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

### **Testar a função manualmente:**

```sql
-- Ver os últimos usuários criados
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Ver os últimos registros em users
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

### **Verificar políticas RLS:**

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## ⚠️ Se o Problema Persistir

Se ainda houver erros após estas correções, pode ser necessário:

1. **Desabilitar temporariamente RLS** para testar:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```
   **⚠️ IMPORTANTE:** Reabilitar após o teste!

2. **Verificar se o campo `password_hash` é nullable:**
   ```sql
   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
   ```

3. **Verificar logs do Supabase:**
   - Dashboard → Logs → Database
   - Verificar se há erros relacionados à trigger

## ✅ Status

- [x] Código atualizado com `.maybeSingle()`
- [x] Trigger melhorada e recriada
- [x] Políticas RLS verificadas
- [x] Tratamento de erros melhorado
- [ ] Teste de registro realizado
- [ ] Problema resolvido

---

## 🎯 Próximos Passos

1. **Testar o registro** seguindo os passos acima
2. **Verificar se funcionou** sem erros
3. **Se ainda houver problemas**, verificar os logs do Supabase
4. **Reportar** qualquer erro restante para correção

Teste agora e me avise o resultado! 🚀

