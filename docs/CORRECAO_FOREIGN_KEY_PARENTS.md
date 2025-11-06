# 🔧 CORREÇÃO: Foreign Key Constraint - Parent Student Relation

## 🎯 PROBLEMA IDENTIFICADO

### Erro:
```
Key is not present in table "parents".
insert or update on table "parent_student_relation" violates foreign key constraint 
"parent_student_relation_parent_id_fkey"
```

### Causa:
A tabela `parent_student_relation` tem uma **foreign key** para a tabela `parents`:

```sql
parent_student_relation.parent_id → parents.id
```

Mas o código estava tentando inserir o `user_id` (da tabela `users`) ao invés do `parent_id` (da tabela `parents`)!

---

## 🔍 ESTRUTURA DAS TABELAS

### Tabela `users`
```
id (UUID) ← user_id do Supabase Auth
name
email
role ('parent', 'student', 'teacher', 'coordinator')
```

### Tabela `parents`
```
id (UUID) ← parent_id (chave primária)
user_id (UUID) → users.id (foreign key)
```

### Tabela `parent_student_relation`
```
id (UUID)
parent_id (UUID) → parents.id (foreign key) ❌ AQUI ESTAVA O ERRO
student_id (UUID) → students.id (foreign key)
relationship ('pai', 'mae', 'responsavel')
created_by (UUID) → users.id
```

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. No `handleCreateLink`:

**ANTES (❌ ERRADO):**
```javascript
const linksToCreate = newStudents.map(studentId => ({
  parent_id: selectedParent, // ❌ selectedParent é um user_id, não parent_id!
  student_id: studentId,
  relationship,
  created_by: user?.id,
}));
```

**DEPOIS (✅ CORRETO):**
```javascript
// 1. Buscar o parent_id correspondente ao user_id
const { data: parentData, error: parentError } = await supabase
  .from('parents')
  .select('id')
  .eq('user_id', selectedParent) // selectedParent é o user_id
  .single();

const parentId = parentData.id; // ✅ Agora temos o parent_id correto!

// 2. Criar vínculos com o parent_id correto
const linksToCreate = newStudents.map(studentId => ({
  parent_id: parentId, // ✅ Usando parent_id da tabela parents
  student_id: studentId,
  relationship,
  created_by: user?.id,
}));
```

---

### 2. No `loadData`:

**ANTES (❌ ERRADO):**
```javascript
// Buscava apenas users
const parentsData = await supabase
  .from('users')
  .select('id, name, email, avatar_url')
  .eq('role', 'parent');

// Tentava enriquecer vínculos com user_id
const enrichedLinks = linksData.map(link => {
  const parent = parentsData.find(p => p.id === link.parent_id); // ❌ Não encontrava!
  // ...
});
```

**DEPOIS (✅ CORRETO):**
```javascript
// 1. Buscar users (para exibir na UI)
const parentsUsersData = await supabase
  .from('users')
  .select('id, name, email, avatar_url')
  .eq('role', 'parent');

// 2. Buscar parents table (para fazer o JOIN correto)
const parentsTableData = await supabase
  .from('parents')
  .select('id, user_id');

// 3. Enriquecer vínculos fazendo JOIN manual
const enrichedLinks = linksData.map(link => {
  // Encontrar parent_id → user_id
  const parentTable = parentsTableData.find(p => p.id === link.parent_id);
  // Encontrar user_id → nome/email
  const parentUser = parentsUsersData.find(u => u.id === parentTable?.user_id);
  // ...
});
```

---

## 🧪 TESTE

### Passo 1: Recarregar a página
```
Ctrl + Shift + R
```

### Passo 2: Abrir modal "Vincular Pais aos Filhos"

### Passo 3: Criar vínculo
- Selecione: **pais1**
- Selecione: **aluno1**
- Clique em: **Criar Vínculo** (UMA VEZ)

### Resultado Esperado:
```
✅ "1 vínculo(s) criado(s) com sucesso!"
```

### Verificar no banco:
```sql
SELECT 
  psr.id,
  psr.parent_id,
  psr.student_id,
  p.user_id as parent_user_id,
  u.name as parent_name
FROM parent_student_relation psr
JOIN parents p ON psr.parent_id = p.id
JOIN users u ON p.user_id = u.id;
```

---

## 📊 FLUXO CORRETO

```
1. UI: Usuário seleciona "pais1" (user_id)
   ↓
2. Buscar parent_id:
   SELECT id FROM parents WHERE user_id = 'pais1_user_id'
   → Retorna: parent_id = 'abc123...'
   ↓
3. Criar vínculo:
   INSERT INTO parent_student_relation (parent_id, student_id, ...)
   VALUES ('abc123...', 'student_id', ...)
   ↓
4. ✅ Sucesso! Foreign key constraint satisfeita!
```

---

## 🔐 PROBLEMA ADICIONAL: RLS na Tabela Parents

### Erro Encontrado:
```
"PGRST116": "The result contains 0 rows"
"Cannot coerce the result to a single JSON object"
```

### Causa:
A política RLS da tabela `parents` só permitia que cada pai visse seus próprios dados:

```sql
"Parents can view own data" → (user_id = auth.uid())
```

Mas o **coordenador** estava tentando buscar dados de **outros pais**, e a RLS bloqueava!

### Solução Aplicada:
```sql
CREATE POLICY "Coordinators can view all parents"
ON public.parents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coordinators
    WHERE coordinators.user_id = auth.uid()
  )
);
```

---

## ✅ STATUS

- ✅ Código corrigido
- ✅ Foreign key constraint respeitada
- ✅ Logs adicionados para debug
- ✅ Mensagens de erro melhoradas
- ✅ RLS corrigida para permitir coordenadores verem todos os pais
- ✅ Query otimizada (removido `.single()`)
- ⏳ **Aguardando teste do usuário**

---

**RECARREGUE A PÁGINA E TESTE AGORA!** 🚀

Pressione: **Ctrl + Shift + R**

