# 🎯 FLUXO DE CONTROLE DE ACESSOS - Lógica Simples e Clara

## 📊 HIERARQUIA DE ACESSOS

```
┌─────────────────────────────────────────┐
│         👔 COORDENADOR                   │
│         Acesso a TUDO                    │
│  ✅ Pais                                 │
│  ✅ Alunos                               │
│  ✅ Professores                          │
│  ✅ Turmas                               │
│  ✅ Todas as funcionalidades             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         👨‍🏫 PROFESSOR                     │
│         Acesso Limitado                  │
│  ✅ Sua turma                            │
│  ✅ Alunos da sua turma                  │
│  ❌ Outros professores                   │
│  ❌ Pais                                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         👪 PAIS                          │
│         Acesso Muito Limitado            │
│  ✅ Seus filhos                          │
│  ✅ Desempenho dos filhos                │
│  ❌ Outros alunos                        │
│  ❌ Professores                          │
│  ❌ Turmas                               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         🎓 ALUNO                         │
│         Acesso Mínimo                    │
│  ✅ Seu cronograma                       │
│  ✅ Seus quizzes                         │
│  ✅ Seu progresso                        │
│  ❌ Outros alunos                        │
│  ❌ Professores                          │
│  ❌ Turmas                               │
└─────────────────────────────────────────┘
```

## 🔐 POLÍTICAS RLS NECESSÁRIAS

### 1. Coordenador (Acesso Total)
```sql
-- Coordenador vê TUDO
CREATE POLICY "Coordinators see everything"
ON [tabela]
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coordinators
    WHERE coordinators.user_id = auth.uid()
  )
);
```

### 2. Professor (Acesso à Sua Turma)
```sql
-- Professor vê apenas alunos das SUAS turmas
CREATE POLICY "Teachers see their students"
ON students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM classroom_students cs
    JOIN classroom_teachers ct ON ct.classroom_id = cs.classroom_id
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE t.user_id = auth.uid()
    AND cs.student_id = students.id
  )
);
```

### 3. Pais (Acesso aos Filhos)
```sql
-- Pais veem apenas SEUS filhos
CREATE POLICY "Parents see their children"
ON students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    WHERE p.user_id = auth.uid()
    AND psr.student_id = students.id
  )
);
```

### 4. Alunos (Acesso Próprio)
```sql
-- Alunos veem apenas SEUS dados
CREATE POLICY "Students see own data"
ON students
FOR SELECT
USING (user_id = auth.uid());
```

## 📱 UX - INTERFACES POR PAPEL

### 👔 Portal do Coordenador
```
┌─────────────────────────────────────────┐
│  📚 Turmas  |  👨‍🏫 Professores  |  🎓 Alunos  │
└─────────────────────────────────────────┘

Funcionalidades:
✅ Ver TODAS as turmas
✅ Criar/Editar/Excluir turmas
✅ Ver TODOS os professores
✅ Convidar novos professores
✅ Atribuir professores às turmas
✅ Ver TODOS os alunos
✅ Gerenciar matrículas
✅ Relatórios completos
```

### 👨‍🏫 Portal do Professor
```
┌─────────────────────────────────────────┐
│  📚 Minhas Turmas  |  🎓 Meus Alunos     │
└─────────────────────────────────────────┘

Funcionalidades:
✅ Ver apenas SUAS turmas
✅ Ver apenas alunos DAS SUAS turmas
✅ Criar questões/quizzes
✅ Ver desempenho dos SEUS alunos
✅ Enviar mensagens aos SEUS alunos
❌ NÃO vê outros professores
❌ NÃO vê outras turmas
❌ NÃO vê todos os alunos
```

### 👪 Portal dos Pais
```
┌─────────────────────────────────────────┐
│  👶 Meus Filhos  |  📊 Desempenho       │
└─────────────────────────────────────────┘

Funcionalidades:
✅ Ver lista de SEUS filhos
✅ Ver desempenho de CADA filho
✅ Ver cronograma de CADA filho
✅ Vincular novos filhos
❌ NÃO vê outros alunos
❌ NÃO vê professores
❌ NÃO vê turmas
```

### 🎓 Portal do Aluno
```
┌─────────────────────────────────────────┐
│  📅 Cronograma  |  🎮 Quizzes  |  📊 Progresso │
└─────────────────────────────────────────┘

Funcionalidades:
✅ Ver SEU cronograma
✅ Fazer SEUS quizzes
✅ Ver SEU progresso
✅ Ver SEU ranking
❌ NÃO vê outros alunos (exceto ranking)
❌ NÃO vê professores
❌ NÃO vê turmas
```

## 🎯 IMPLEMENTAÇÃO

### Ordem de Implementação:

1. ✅ **Coordenador** (PRIORIDADE 1)
   - Já está funcionando!
   - Vê tudo: professores, alunos, turmas

2. 🔄 **Professor** (PRIORIDADE 2)
   - Filtrar turmas: apenas as que ele leciona
   - Filtrar alunos: apenas das suas turmas
   - Criar políticas RLS específicas

3. 🔄 **Pais** (PRIORIDADE 3)
   - Filtrar filhos: apenas os vinculados
   - Mostrar desempenho de cada filho
   - Criar políticas RLS específicas

4. 🔄 **Aluno** (PRIORIDADE 4)
   - Mostrar apenas dados próprios
   - Cronograma personalizado
   - Políticas RLS já existem

## 📋 CHECKLIST DE VERIFICAÇÃO

### Coordenador:
- [ ] Vê TODOS os professores
- [ ] Vê TODOS os alunos
- [ ] Vê TODAS as turmas
- [ ] Pode criar/editar/excluir tudo

### Professor:
- [ ] Vê APENAS suas turmas
- [ ] Vê APENAS alunos das suas turmas
- [ ] NÃO vê outros professores
- [ ] NÃO vê outras turmas

### Pais:
- [ ] Vê APENAS seus filhos
- [ ] Vê desempenho dos filhos
- [ ] NÃO vê outros alunos
- [ ] NÃO vê professores/turmas

### Aluno:
- [ ] Vê APENAS seus dados
- [ ] Vê seu cronograma
- [ ] NÃO vê outros alunos (exceto ranking)

---
**Data:** 04/11/2025  
**Status:** 📝 Documentado  
**Próximo:** Implementar políticas RLS para cada papel

