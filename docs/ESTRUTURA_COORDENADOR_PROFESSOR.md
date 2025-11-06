# 📋 ESTRUTURA COMPLETA: COORDENADOR vs PROFESSOR

## 🎯 HIERARQUIA DE PERMISSÕES

```
┌─────────────────────────────────────────────────────────┐
│                     COORDENADOR                         │
│                  (Acesso Total)                         │
├─────────────────────────────────────────────────────────┤
│ ✅ Criar/Editar/Deletar TURMAS                          │
│ ✅ Adicionar/Remover ALUNOS nas turmas                  │
│ ✅ Convidar/Gerenciar PROFESSORES                       │
│ ✅ Atribuir PROFESSORES às turmas                       │
│ ✅ Ver TODOS os alunos                                  │
│ ✅ Ver TODOS os pais                                    │
│ ✅ Gerenciar relacionamento Pai-Filho                   │
│ ✅ Ver relatórios gerais                                │
│ ✅ Configurar escola                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      PROFESSOR                          │
│              (Acesso Limitado às suas turmas)           │
├─────────────────────────────────────────────────────────┤
│ ✅ Ver SUAS turmas                                      │
│ ✅ Adicionar/Remover ALUNOS nas SUAS turmas             │
│ ✅ Ver ALUNOS das SUAS turmas                           │
│ ✅ Criar/Editar ATIVIDADES nas SUAS turmas              │
│ ✅ Lançar NOTAS dos SEUS alunos                         │
│ ✅ Ver relatórios das SUAS turmas                       │
│ ❌ NÃO pode criar turmas                                │
│ ❌ NÃO pode deletar turmas                              │
│ ❌ NÃO pode convidar outros professores                 │
│ ❌ NÃO pode ver alunos de outras turmas                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 COMPARATIVO DETALHADO

| Funcionalidade | Coordenador | Professor |
|----------------|-------------|-----------|
| **TURMAS** | | |
| Criar turma | ✅ Sim | ❌ Não |
| Editar turma | ✅ Todas | ✅ Apenas suas |
| Deletar turma | ✅ Todas | ❌ Não |
| Ver turmas | ✅ Todas | ✅ Apenas suas |
| **ALUNOS** | | |
| Ver alunos | ✅ Todos | ✅ Apenas de suas turmas |
| Adicionar aluno na turma | ✅ Em qualquer turma | ✅ Apenas em suas turmas |
| Remover aluno da turma | ✅ De qualquer turma | ✅ Apenas de suas turmas |
| Editar dados do aluno | ✅ Qualquer aluno | ❌ Não |
| **PROFESSORES** | | |
| Ver professores | ✅ Todos | ❌ Não |
| Convidar professor | ✅ Sim | ❌ Não |
| Atribuir professor à turma | ✅ Sim | ❌ Não |
| Remover professor da turma | ✅ Sim | ❌ Não |
| **PAIS** | | |
| Ver pais | ✅ Todos | ✅ Apenas pais de seus alunos |
| Vincular pai a aluno | ✅ Sim | ❌ Não |
| **ATIVIDADES** | | |
| Criar atividade | ✅ Em qualquer turma | ✅ Apenas em suas turmas |
| Editar atividade | ✅ Qualquer | ✅ Apenas suas |
| Deletar atividade | ✅ Qualquer | ✅ Apenas suas |
| **NOTAS** | | |
| Lançar notas | ✅ Qualquer aluno | ✅ Apenas seus alunos |
| Editar notas | ✅ Qualquer | ✅ Apenas suas |
| Ver notas | ✅ Todas | ✅ Apenas de seus alunos |
| **RELATÓRIOS** | | |
| Relatório geral da escola | ✅ Sim | ❌ Não |
| Relatório por turma | ✅ Todas | ✅ Apenas suas |
| Relatório por aluno | ✅ Todos | ✅ Apenas seus |

---

## 🎨 PORTAL DO COORDENADOR

### Abas Principais:
```
┌────────────────────────────────────────────────────┐
│  📚 Turmas  │  👨‍🏫 Professores  │  🎓 Alunos  │  👪 Pais  │
└────────────────────────────────────────────────────┘
```

### 📚 ABA TURMAS
**Funcionalidades:**
- ✅ **Criar Nova Turma**
  - Nome da turma
  - Série (1ª a 9ª)
  - Matéria (opcional)
  - Escola
  - Descrição
  
- ✅ **Editar Turma**
  - Alterar qualquer informação
  
- ✅ **Deletar Turma**
  - Remover turma (com confirmação)
  
- ✅ **Atribuir Professores**
  - Adicionar professor à turma
  - Definir professor principal
  - Remover professor da turma
  
- ✅ **Gerenciar Alunos da Turma**
  - Ver lista de alunos
  - Adicionar alunos
  - Remover alunos

### 👨‍🏫 ABA PROFESSORES
**Funcionalidades:**
- ✅ **Ver Todos os Professores**
  - Lista completa
  - Informações de contato
  
- ✅ **Convidar Professor**
  - Enviar convite por email
  - Gerar link de cadastro
  
- ✅ **Remover Professor**
  - Desativar acesso

### 🎓 ABA ALUNOS
**Funcionalidades:**
- ✅ **Ver Todos os Alunos**
  - Lista completa
  - Busca por nome/email/escola
  - Filtro por série
  
- ✅ **Adicionar Aluno em Turma**
  - Selecionar aluno
  - Selecionar turma
  - Matricular
  
- ✅ **Ver Detalhes do Aluno**
  - Turmas matriculadas
  - Notas
  - Pais vinculados

### 👪 ABA PAIS
**Funcionalidades:**
- ✅ **Ver Todos os Pais**
  - Lista completa
  - Informações de contato
  
- ✅ **Vincular Pai a Aluno**
  - Selecionar pai
  - Selecionar filho(s)
  - Criar vínculo

---

## 🎨 PORTAL DO PROFESSOR

### Abas Principais:
```
┌────────────────────────────────────────────────────┐
│  📚 Minhas Turmas  │  🎓 Meus Alunos  │  📝 Atividades  │
└────────────────────────────────────────────────────┘
```

### 📚 ABA MINHAS TURMAS
**Funcionalidades:**
- ✅ **Ver Suas Turmas**
  - Lista de turmas atribuídas
  - Informações da turma
  
- ✅ **Gerenciar Alunos da Turma**
  - Ver lista de alunos
  - Adicionar alunos (da lista geral)
  - Remover alunos
  
- ✅ **Ver Atividades da Turma**
  - Lista de atividades criadas
  
- ❌ **NÃO pode:**
  - Criar turma
  - Deletar turma
  - Atribuir outros professores

### 🎓 ABA MEUS ALUNOS
**Funcionalidades:**
- ✅ **Ver Alunos de Suas Turmas**
  - Lista filtrada
  - Busca por nome
  
- ✅ **Ver Detalhes do Aluno**
  - Notas nas suas disciplinas
  - Atividades entregues
  - Desempenho
  
- ✅ **Lançar Notas**
  - Adicionar nota
  - Editar nota
  
- ❌ **NÃO pode:**
  - Ver alunos de outras turmas
  - Editar dados pessoais do aluno

### 📝 ABA ATIVIDADES
**Funcionalidades:**
- ✅ **Criar Atividade**
  - Título
  - Descrição
  - Data de entrega
  - Turma(s)
  - Pontuação
  
- ✅ **Editar Atividade**
  - Apenas suas atividades
  
- ✅ **Deletar Atividade**
  - Apenas suas atividades
  
- ✅ **Corrigir Atividades**
  - Ver entregas
  - Dar nota
  - Feedback

---

## 🗄️ ESTRUTURA DE DADOS

### Tabela: `classrooms` (Turmas)
```sql
- id (UUID)
- name (VARCHAR) - Nome da turma
- grade_level (INTEGER) - Série (1-9)
- school (VARCHAR) - Nome da escola
- subject_id (UUID) - Matéria (FK)
- description (TEXT) - Descrição
- created_by (UUID) - Coordenador que criou (FK users)
- created_at (TIMESTAMP)
```

### Tabela: `classroom_teachers` (Professores nas Turmas)
```sql
- id (UUID)
- classroom_id (UUID) - FK classrooms
- teacher_id (UUID) - FK teachers
- is_primary (BOOLEAN) - Professor principal?
- is_active (BOOLEAN) - Ativo?
- assigned_at (TIMESTAMP)
- assigned_by (UUID) - Quem atribuiu (FK users)
```

### Tabela: `classroom_students` (Alunos nas Turmas)
```sql
- id (UUID)
- classroom_id (UUID) - FK classrooms
- student_id (UUID) - FK students
- enrolled_at (TIMESTAMP) - Data de matrícula
- enrolled_by (UUID) - Quem matriculou (FK users)
- is_active (BOOLEAN) - Ativo?
```

### Tabela: `activities` (Atividades)
```sql
- id (UUID)
- classroom_id (UUID) - FK classrooms
- teacher_id (UUID) - FK teachers (criador)
- title (VARCHAR) - Título
- description (TEXT) - Descrição
- due_date (DATE) - Data de entrega
- max_score (INTEGER) - Pontuação máxima
- created_at (TIMESTAMP)
```

### Tabela: `activity_submissions` (Entregas)
```sql
- id (UUID)
- activity_id (UUID) - FK activities
- student_id (UUID) - FK students
- submission_text (TEXT) - Resposta
- submitted_at (TIMESTAMP)
- score (INTEGER) - Nota
- feedback (TEXT) - Feedback do professor
- graded_at (TIMESTAMP)
- graded_by (UUID) - FK teachers
```

### Tabela: `parent_student_relation` (Vínculo Pai-Filho)
```sql
- id (UUID)
- parent_id (UUID) - FK users (role='parent')
- student_id (UUID) - FK students
- relationship (VARCHAR) - 'pai', 'mãe', 'responsável'
- created_at (TIMESTAMP)
- created_by (UUID) - Quem criou o vínculo
```

---

## 🔐 POLÍTICAS RLS (Row Level Security)

### Para COORDENADORES:
```sql
-- Coordenadores veem TUDO
CREATE POLICY "Coordinators see all classrooms"
ON classrooms FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'coordinator'
  )
);
```

### Para PROFESSORES:
```sql
-- Professores veem apenas SUAS turmas
CREATE POLICY "Teachers see own classrooms"
ON classrooms FOR SELECT
USING (
  id IN (
    SELECT classroom_id 
    FROM classroom_teachers 
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
    AND is_active = true
  )
);

-- Professores podem adicionar alunos em SUAS turmas
CREATE POLICY "Teachers manage students in own classrooms"
ON classroom_students FOR ALL
USING (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_teachers 
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
    AND is_active = true
  )
);
```

---

## 🎯 FLUXO DE TRABALHO

### COORDENADOR:
```
1. Cria turma (ex: "7º Ano A - Matemática")
2. Convida professores
3. Atribui professor à turma
4. Adiciona alunos na turma
5. Vincula pais aos alunos
6. Monitora tudo
```

### PROFESSOR:
```
1. Recebe convite do coordenador
2. É atribuído a uma ou mais turmas
3. Vê suas turmas no portal
4. Adiciona/remove alunos nas suas turmas
5. Cria atividades para suas turmas
6. Lança notas dos seus alunos
7. Vê relatórios das suas turmas
```

---

## 📱 INTERFACE - PRÓXIMOS COMPONENTES A CRIAR

### Para COORDENADOR:
- [x] `ManageTeachers.jsx` - Gerenciar professores ✅
- [x] `ManageStudents.jsx` - Gerenciar alunos ✅
- [x] `ManageParents.jsx` - Gerenciar pais ✅
- [ ] `AssignStudentsToClassroom.jsx` - Adicionar alunos em turma
- [ ] `LinkParentToStudent.jsx` - Vincular pai a filho
- [ ] `InviteTeacher.jsx` - Convidar professor

### Para PROFESSOR:
- [ ] `TeacherClassrooms.jsx` - Minhas turmas
- [ ] `TeacherStudents.jsx` - Meus alunos
- [ ] `ManageClassroomStudents.jsx` - Gerenciar alunos da turma
- [ ] `CreateActivity.jsx` - Criar atividade
- [ ] `GradeActivity.jsx` - Corrigir atividade
- [ ] `StudentGrades.jsx` - Lançar notas

---

## ✅ RESUMO

### COORDENADOR pode:
✅ Criar/Editar/Deletar turmas
✅ Adicionar alunos em qualquer turma
✅ Convidar e gerenciar professores
✅ Atribuir professores às turmas
✅ Ver todos os alunos e pais
✅ Vincular pais a alunos
✅ Acesso total ao sistema

### PROFESSOR pode:
✅ Ver suas turmas
✅ Adicionar/remover alunos nas suas turmas
✅ Criar atividades para suas turmas
✅ Lançar notas dos seus alunos
✅ Ver relatórios das suas turmas
❌ NÃO pode criar/deletar turmas
❌ NÃO pode convidar professores
❌ NÃO pode ver alunos de outras turmas

---

**Quer que eu implemente alguma dessas funcionalidades agora?** 🚀

Posso começar por:
1. **Adicionar alunos em turmas** (coordenador e professor)
2. **Portal do professor** (com suas turmas e alunos)
3. **Sistema de atividades**
4. **Vincular pais a alunos**

**Qual prefere?** 🎯

