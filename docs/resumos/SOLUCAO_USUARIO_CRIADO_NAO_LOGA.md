# 🔧 Solução: Usuário Criado Mas Não Loga

## 🎯 Situação

- ✅ Usuário criado no Supabase (`auth.users`)
- ✅ Usuário aparece na lista de autenticação (3 usuários com Google OAuth)
- ✅ Trigger executou e criou registros
- ❌ Login não funciona após callback do OAuth
- ⚠️ Aviso de clock skew continua aparecendo

## 🔍 Diagnóstico Necessário

### **Passo 1: Verificar dados do usuário no banco**

Execute as queries em `docs/testes/QUERY_VERIFICAR_USUARIO.sql` no SQL Editor do Supabase:

1. **Query básica:**
```sql
SELECT id, email, name, role, created_at
FROM public.users
WHERE email = 'suporteshownerd@gmail.com';
```

2. **Query completa de diagnóstico (Query 13):**
```sql
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
```

### **Passo 2: Interpretar resultados**

Com base nos resultados da query:

#### **Se `role` for NULL:**
- ✅ **Comportamento esperado** - Deve mostrar tela de seleção de role
- ❌ **Problema:** A tela não está aparecendo
- **Solução:** Verificar logs no console para ver se `needsRoleSelection` está sendo chamado

#### **Se `role` for 'student' mas não tiver registro em `students`:**
- ❌ **Problema:** Trigger não criou o registro
- **Solução:** Executar Query 9 para criar registro manualmente

#### **Se tiver `role` e registro correspondente:**
- ✅ **Dados corretos** no banco
- ❌ **Problema:** Sessão não está sendo estabelecida
- **Solução:** Verificar logs de debug no console

## 🔧 Soluções por Cenário

### **Cenário 1: role é NULL (esperado)**

**O que deve acontecer:**
1. OAuth callback processa tokens
2. Busca usuário na tabela `users`
3. Detecta `role = NULL`
4. Chama `needsRoleSelection()`
5. Retorna `true`
6. Mostra componente `RoleSelection`

**Se não está funcionando:**
- Verificar se os logs aparecem no console
- Se não aparecerem, o código não foi recarregado
- Seguir passos em `docs/testes/FORCAR_RECARREGAMENTO.md`

### **Cenário 2: role definido mas sem registro na tabela correspondente**

**Executar a query correspondente:**

```sql
-- Para student
INSERT INTO public.students (user_id, grade, school)
SELECT id, 7, ''
FROM public.users
WHERE email = 'suporteshownerd@gmail.com'
  AND role = 'student';

-- Para teacher
INSERT INTO public.teachers (user_id, school)
SELECT id, ''
FROM public.users
WHERE email = 'suporteshownerd@gmail.com'
  AND role = 'teacher';

-- Para parent
INSERT INTO public.parents (user_id)
SELECT id
FROM public.users
WHERE email = 'suporteshownerd@gmail.com'
  AND role = 'parent';

-- Para coordinator
INSERT INTO public.coordinators (user_id, school)
SELECT id, ''
FROM public.users
WHERE email = 'suporteshownerd@gmail.com'
  AND role = 'coordinator';
```

### **Cenário 3: Tudo correto no banco mas login não funciona**

**Problema:** Sessão não está sendo estabelecida após callback.

**Causas possíveis:**
1. **Clock skew:** Relógio desincronizado
2. **Código não recarregado:** Logs não aparecem
3. **Erro no callback:** Sessão não é processada corretamente

**Soluções:**

1. **Sincronizar relógio:**
   - `Win + I` → "Hora e idioma" → "Sincronizar agora"
   - PowerShell (Admin): `w32tm /resync`

2. **Forçar recarregamento:**
   - Seguir `docs/testes/FORCAR_RECARREGAMENTO.md`
   - Parar servidor completamente
   - Limpar cache do navegador
   - Reiniciar servidor
   - Abrir em modo anônimo

3. **Verificar logs:**
   - Logs devem aparecer em 3 níveis (log, warn, error)
   - Se não aparecerem, há problema de recarregamento
   - Se aparecerem, verificar qual é o erro específico

## 📋 Checklist de Verificação

- [ ] Executar Query 13 (diagnóstico completo)
- [ ] Verificar se `role` está definido
- [ ] Verificar se existe registro na tabela correspondente
- [ ] Sincronizar relógio do Windows
- [ ] Parar servidor completamente
- [ ] Limpar cache do navegador
- [ ] Reiniciar servidor
- [ ] Abrir navegador em modo anônimo
- [ ] Verificar se logs aparecem no console
- [ ] Testar login com Google novamente

## 🎯 Próximos Passos

1. **Execute a Query 13** no SQL Editor do Supabase
2. **Copie e me envie os resultados** (ou faça print)
3. **Verifique os logs no console** após reiniciar
4. **Informe o que aparece:**
   - Se logs aparecem ou não
   - Se tela de seleção de role aparece
   - Se há algum erro específico

Com essas informações, posso identificar exatamente onde está o problema e fornecer a solução específica.

---

**IMPORTANTE:** Execute a Query 13 e me envie os resultados para diagnóstico preciso.

