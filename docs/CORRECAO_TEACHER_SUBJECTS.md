# 🔧 CORREÇÃO: Tabela teacher_subjects

## ❌ PROBLEMA IDENTIFICADO

**Erro no Console:**
```
Erro ao carregar dados: Object { code: "PGRST205", details: null, hint: "Perhaps you meant the table 'public.teachers'", message: "Could not find the table 'public.teacher_subjects' in the schema cache" }
```

**Causa:**
A tabela `teacher_subjects` não existia no banco de dados, mas o componente `EditTeacherProfile.jsx` tentava buscar dados dela.

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Migration Aplicada: `create_teacher_subjects_table`

Criamos a tabela `teacher_subjects` para relacionar professores com as matérias que lecionam.

---

## 🗄️ ESTRUTURA DA TABELA

```sql
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id)
);
```

### Campos:
- **id**: UUID único (chave primária)
- **teacher_id**: Referência ao professor (FK para `teachers.id`)
- **subject_id**: Referência à matéria (FK para `subjects.id`)
- **created_at**: Data/hora de criação

### Constraints:
- **UNIQUE(teacher_id, subject_id)**: Evita duplicatas (um professor não pode ter a mesma matéria duas vezes)
- **ON DELETE CASCADE**: Se um professor ou matéria for deletado, as relações também são deletadas

---

## 📊 ÍNDICES CRIADOS

Para melhorar a performance das queries:

```sql
CREATE INDEX idx_teacher_subjects_teacher_id ON public.teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);
```

**Benefícios:**
- ✅ Busca rápida de matérias por professor
- ✅ Busca rápida de professores por matéria
- ✅ JOINs mais eficientes

---

## 🔐 RLS POLICIES

### 1. Coordenadores podem ver todas as relações
```sql
CREATE POLICY "Coordinators can view all teacher subjects"
  ON public.teacher_subjects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'coordinator'
    )
  );
```

### 2. Coordenadores podem inserir relações
```sql
CREATE POLICY "Coordinators can insert teacher subjects"
  ON public.teacher_subjects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'coordinator'
    )
  );
```

### 3. Coordenadores podem deletar relações
```sql
CREATE POLICY "Coordinators can delete teacher subjects"
  ON public.teacher_subjects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'coordinator'
    )
  );
```

### 4. Professores podem ver suas próprias matérias
```sql
CREATE POLICY "Teachers can view own subjects"
  ON public.teacher_subjects
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers
      WHERE user_id = auth.uid()
    )
  );
```

---

## 🔄 COMO FUNCIONA

### 1. Atribuir Matérias a um Professor

**Cenário:** Coordenador atribui "Matemática" e "Física" ao professor João.

```sql
-- Inserir matérias
INSERT INTO teacher_subjects (teacher_id, subject_id)
VALUES 
  ('uuid-do-joao', 'uuid-matematica'),
  ('uuid-do-joao', 'uuid-fisica');
```

### 2. Buscar Matérias de um Professor

```sql
SELECT 
  ts.*,
  s.name as subject_name
FROM teacher_subjects ts
JOIN subjects s ON ts.subject_id = s.id
WHERE ts.teacher_id = 'uuid-do-joao';
```

**Resultado:**
```
teacher_id          | subject_id      | subject_name
--------------------|-----------------|-------------
uuid-do-joao        | uuid-matematica | Matemática
uuid-do-joao        | uuid-fisica     | Física
```

### 3. Buscar Professores de uma Matéria

```sql
SELECT 
  ts.*,
  t.id,
  u.name as teacher_name
FROM teacher_subjects ts
JOIN teachers t ON ts.teacher_id = t.id
JOIN users u ON t.user_id = u.id
WHERE ts.subject_id = 'uuid-matematica';
```

**Resultado:**
```
teacher_id   | subject_id      | teacher_name
-------------|-----------------|-------------
uuid-do-joao | uuid-matematica | João Silva
uuid-da-maria| uuid-matematica | Maria Santos
```

### 4. Atualizar Matérias de um Professor

**Estratégia:** Delete + Insert (usado no `EditTeacherProfile.jsx`)

```sql
-- 1. Deletar todas as matérias antigas
DELETE FROM teacher_subjects WHERE teacher_id = 'uuid-do-joao';

-- 2. Inserir novas matérias
INSERT INTO teacher_subjects (teacher_id, subject_id)
VALUES 
  ('uuid-do-joao', 'uuid-matematica'),
  ('uuid-do-joao', 'uuid-quimica'),
  ('uuid-do-joao', 'uuid-biologia');
```

---

## 🎯 INTEGRAÇÃO COM O CÓDIGO

### EditTeacherProfile.jsx

**Buscar matérias do professor:**
```javascript
const { data: teacherSubjects, error } = await supabase
  .from('teacher_subjects')
  .select('subject_id')
  .eq('teacher_id', teacher.id);

setTeacherData((prev) => ({
  ...prev,
  subjects: teacherSubjects?.map((ts) => ts.subject_id) || [],
}));
```

**Salvar matérias do professor:**
```javascript
// 1. Deletar matérias antigas
await supabase
  .from('teacher_subjects')
  .delete()
  .eq('teacher_id', teacher.id);

// 2. Inserir novas matérias
if (teacherData.subjects.length > 0) {
  const subjectsToInsert = teacherData.subjects.map((subjectId) => ({
    teacher_id: teacher.id,
    subject_id: subjectId,
  }));

  await supabase
    .from('teacher_subjects')
    .insert(subjectsToInsert);
}
```

---

## 📊 DIAGRAMA DE RELACIONAMENTO

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│    teachers     │       │  teacher_subjects    │       │    subjects     │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ teacher_id (FK)      │       │ id (PK)         │
│ user_id         │       │ subject_id (FK)      ├──────►│ name            │
│ school          │       │ created_at           │       │ description     │
│ specialization  │       │                      │       │ created_at      │
└─────────────────┘       └──────────────────────┘       └─────────────────┘
                          UNIQUE(teacher_id, subject_id)
```

**Tipo de Relacionamento:** Muitos-para-Muitos (N:N)
- Um professor pode lecionar várias matérias
- Uma matéria pode ser lecionada por vários professores

---

## ✅ VERIFICAÇÃO

### Verificar se a tabela foi criada:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'teacher_subjects';
```

### Verificar constraints:
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'teacher_subjects';
```

### Verificar índices:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'teacher_subjects';
```

### Verificar RLS policies:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'teacher_subjects';
```

---

## 🎉 RESULTADO

Após aplicar a migration:

- ✅ Tabela `teacher_subjects` criada
- ✅ Índices criados para performance
- ✅ RLS policies configuradas
- ✅ Constraints de integridade aplicadas
- ✅ Erro no console resolvido
- ✅ `EditTeacherProfile.jsx` funcionando corretamente

---

## 🧪 TESTE MANUAL

### 1. Criar uma relação:
```sql
INSERT INTO teacher_subjects (teacher_id, subject_id)
VALUES (
  (SELECT id FROM teachers LIMIT 1),
  (SELECT id FROM subjects LIMIT 1)
);
```

### 2. Verificar:
```sql
SELECT * FROM teacher_subjects;
```

### 3. Testar no frontend:
1. Acesse "Gerenciar Professores"
2. Clique em "Editar" em um professor
3. Selecione algumas matérias
4. Salve
5. Reabra e verifique que as matérias estão selecionadas

---

## 📝 NOTAS IMPORTANTES

1. **Constraint UNIQUE**: Garante que um professor não pode ter a mesma matéria duplicada
2. **ON DELETE CASCADE**: Se um professor ou matéria for deletado, as relações são automaticamente removidas
3. **RLS Policies**: Apenas coordenadores podem gerenciar as relações; professores podem apenas visualizar suas próprias matérias
4. **Índices**: Melhoram significativamente a performance de queries que buscam por `teacher_id` ou `subject_id`

---

**Data da Correção:** 05/11/2025  
**Status:** ✅ RESOLVIDO

