# 🎯 LÓGICA CORRETA: Filtro de Alunos para Vínculos

## 📋 REGRAS DE NEGÓCIO

### ✅ O QUE DEVE ACONTECER:

1. **PAI pode ter MÚLTIPLOS FILHOS**
   - pais1 → aluno1 ✅
   - pais1 → aluno2 ✅
   - pais1 → aluno3 ✅

2. **ALUNO pode ter MÚLTIPLOS PAIS** (pai, mãe, responsável)
   - pais1 (pai) → aluno1 ✅
   - pais2 (mãe) → aluno1 ✅
   - pais3 (responsável) → aluno1 ✅

3. **ALUNO NÃO pode ser vinculado ao MESMO PAI duas vezes**
   - pais1 → aluno1 ✅
   - pais1 → aluno1 ❌ (DUPLICADO!)

---

## 🔧 IMPLEMENTAÇÃO

### 1. Filtro Inteligente de Alunos

Quando um **pai é selecionado**, a lista de alunos deve **esconder** os alunos que já estão vinculados a esse pai:

```javascript
// 🔥 CRIAR MAPEAMENTO: user_id → parent_id
const [parentIdForSelectedUser, setParentIdForSelectedUser] = React.useState(null);

// Buscar parent_id quando um pai é selecionado
React.useEffect(() => {
  const fetchParentId = async () => {
    if (!selectedParent) {
      setParentIdForSelectedUser(null);
      return;
    }
    
    const { data, error } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', selectedParent)
      .single();
    
    if (!error && data) {
      setParentIdForSelectedUser(data.id);
    }
  };
  
  fetchParentId();
}, [selectedParent]);

// 🔥 FILTRAR ALUNOS: Remover alunos já vinculados
const filteredStudents = students.filter(student => {
  const user = student.users;
  
  // Filtro de busca
  const matchesSearch = (
    user?.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchStudent.toLowerCase())
  );
  
  if (!matchesSearch) return false;
  
  // Se um pai está selecionado, verificar se o aluno já está vinculado
  if (selectedParent && parentIdForSelectedUser) {
    const isAlreadyLinked = links.some(link => 
      link.student_id === student.id && 
      link.parent_id === parentIdForSelectedUser
    );
    
    return !isAlreadyLinked; // Mostrar apenas alunos NÃO vinculados
  }
  
  return true;
});
```

---

## 🎬 FLUXO DE USO

### Cenário 1: Criar Primeiro Vínculo

```
1. Coordenador abre modal
   → Lista mostra: TODOS os pais | TODOS os alunos

2. Coordenador seleciona: pais1
   → Lista mostra: pais1 | aluno1, aluno2, aluno3 (todos disponíveis)

3. Coordenador seleciona: aluno1
   → Clica em "Criar Vínculo"
   → ✅ "1 vínculo(s) criado(s) com sucesso!"

4. Modal recarrega
   → Lista mostra: TODOS os pais | TODOS os alunos
```

---

### Cenário 2: Criar Segundo Vínculo (Mesmo Pai)

```
1. Coordenador abre modal
   → Vínculos existentes: pais1 → aluno1

2. Coordenador seleciona: pais1
   → Lista mostra: pais1 | aluno2, aluno3 (aluno1 NÃO aparece!)
   → ❌ aluno1 está ESCONDIDO porque já está vinculado a pais1

3. Coordenador seleciona: aluno2
   → Clica em "Criar Vínculo"
   → ✅ "1 vínculo(s) criado(s) com sucesso!"

4. Modal recarrega
   → Vínculos existentes: pais1 → aluno1, pais1 → aluno2
```

---

### Cenário 3: Criar Vínculo com Outro Pai (Mesmo Aluno)

```
1. Coordenador abre modal
   → Vínculos existentes: pais1 → aluno1

2. Coordenador seleciona: pais2 (mãe)
   → Lista mostra: pais2 | aluno1, aluno2, aluno3 (TODOS disponíveis!)
   → ✅ aluno1 APARECE porque NÃO está vinculado a pais2

3. Coordenador seleciona: aluno1
   → Clica em "Criar Vínculo"
   → ✅ "1 vínculo(s) criado(s) com sucesso!"

4. Modal recarrega
   → Vínculos existentes: 
     - pais1 (pai) → aluno1
     - pais2 (mãe) → aluno1
```

---

## 📊 EXEMPLOS VISUAIS

### Antes (❌ ERRADO):
```
Pai selecionado: pais1
Vínculos existentes: pais1 → aluno1

Lista de alunos disponíveis:
☑️ aluno1  ← ❌ NÃO DEVERIA APARECER!
☐ aluno2
☐ aluno3
```

### Depois (✅ CORRETO):
```
Pai selecionado: pais1
Vínculos existentes: pais1 → aluno1

Lista de alunos disponíveis:
☐ aluno2  ← ✅ Apenas alunos NÃO vinculados!
☐ aluno3
```

---

## 🔍 VERIFICAÇÃO DE VÍNCULOS EXISTENTES

### No Código (Filtro da UI):
```javascript
// Esconde alunos já vinculados ao pai selecionado
const isAlreadyLinked = links.some(link => 
  link.student_id === student.id && 
  link.parent_id === parentIdForSelectedUser
);

return !isAlreadyLinked;
```

### No Banco (Ao Criar):
```javascript
// Verifica no banco antes de inserir
const { data: existingLinksData } = await supabase
  .from('parent_student_relation')
  .select('student_id')
  .eq('parent_id', parentId)
  .in('student_id', selectedStudents);

const existingStudentIds = new Set(existingLinksData?.map(link => link.student_id) || []);
const newStudents = selectedStudents.filter(studentId => !existingStudentIds.has(studentId));
```

### No Banco (Constraint UNIQUE):
```sql
ALTER TABLE parent_student_relation
ADD CONSTRAINT parent_student_relation_unique 
UNIQUE (parent_id, student_id);
```

---

## ✅ BENEFÍCIOS

1. **UX Melhorada:** Usuário não vê alunos que já estão vinculados
2. **Prevenção de Erros:** Impossível selecionar aluno já vinculado
3. **Feedback Visual:** Lista de alunos muda dinamicamente
4. **Múltiplas Camadas:** Validação na UI + Código + Banco de Dados

---

## 🧪 TESTE

### Passo 1: Criar Vínculo Inicial
1. Selecione: **pais1**
2. Selecione: **aluno1**
3. Clique em "Criar Vínculo"
4. ✅ Sucesso!

### Passo 2: Tentar Vincular Mesmo Aluno
1. Selecione: **pais1** (de novo)
2. Observe: **aluno1 NÃO aparece na lista!** ✅
3. Selecione: **aluno2**
4. Clique em "Criar Vínculo"
5. ✅ Sucesso!

### Passo 3: Vincular Mesmo Aluno a Outro Pai
1. Selecione: **pais2**
2. Observe: **aluno1 APARECE na lista!** ✅
3. Selecione: **aluno1**
4. Clique em "Criar Vínculo"
5. ✅ Sucesso! (aluno1 agora tem 2 pais)

---

## ✅ STATUS

- ✅ Filtro inteligente implementado
- ✅ Mapeamento user_id → parent_id
- ✅ Alunos já vinculados são escondidos
- ✅ Pais podem ter múltiplos filhos
- ✅ Alunos podem ter múltiplos pais
- ✅ Impossível criar vínculos duplicados
- ⏳ **Aguardando teste do usuário**

---

**RECARREGUE A PÁGINA E TESTE!** 🚀

Pressione: **Ctrl + Shift + R**

Selecione um pai e veja como a lista de alunos muda automaticamente!

