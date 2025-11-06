# 🔐 Solução: Row Level Security (RLS) - Professores e Alunos

## 🐛 Problema Identificado

O coordenador não conseguia visualizar professores e alunos devido a políticas **Row Level Security (RLS)** restritivas no Supabase.

### Erro Observado:
- ❌ Modal "Atribuir Professor" mostrava: "Nenhum professor cadastrado no sistema ainda"
- ❌ Aba "Professores" mostrava: "Nenhum professor encontrado"
- ✅ No banco de dados: **6 professores** e **9 alunos** cadastrados

## 🔍 Causa Raiz

### Políticas RLS Existentes (Restritivas):

**Tabela `teachers`:**
```sql
-- ❌ Política antiga: Apenas o próprio professor vê seus dados
"Teachers can view own data"
FOR SELECT
USING (user_id = auth.uid())
```

**Problema:** Quando um **coordenador** tentava buscar professores, a política RLS bloqueava porque:
- O `user_id` do professor ≠ `auth.uid()` do coordenador
- Resultado: **0 professores retornados**

## ✅ Solução Aplicada

### Migration: `add_coordinator_view_teachers_policy`

Foram criadas **duas novas políticas RLS**:

#### 1. Coordenadores podem ver todos os professores
```sql
CREATE POLICY "Coordinators can view all teachers"
ON public.teachers
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'coordinator'
  )
);
```

#### 2. Coordenadores podem ver todos os alunos
```sql
CREATE POLICY "Coordinators can view all students"
ON public.students
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'coordinator'
  )
);
```

### Como Funciona:

1. **Verifica se o usuário logado é um coordenador:**
   ```sql
   users.id = auth.uid() AND users.role = 'coordinator'
   ```

2. **Se SIM:** O coordenador pode ver **TODOS** os registros das tabelas `teachers` e `students`
3. **Se NÃO:** As políticas antigas continuam valendo (cada um vê apenas seus próprios dados)

## 🎯 Resultado Esperado

Agora, quando você **recarregar a página** e entrar no Portal do Coordenador:

### ✅ Aba "Professores":
- Deve listar os **6 professores** cadastrados:
  1. Super Nerd Conectado
  2. professor10
  3. professor6
  4. professor2
  5. professor1
  6. Prof. Carlos Silva

### ✅ Modal "Atribuir Professor":
- Deve listar todos os professores disponíveis (não atribuídos àquela turma)
- Permitir selecionar e atribuir professores às turmas

### ✅ Logs no Console:
```
✅ Professores carregados no hook: 6 [...]
👥 Professores disponíveis: [...]
📚 Total de professores: 6
🔍 Calculando professores disponíveis...
  - Turma selecionada: 7ª série Português
  - Total de professores: 6
  - Professores atribuídos: 0
  ✅ Todos os professores disponíveis: 6
```

## 🔒 Segurança Mantida

As políticas RLS continuam seguras porque:

1. **Professores:** Continuam vendo apenas seus próprios dados
2. **Alunos:** Continuam vendo apenas seus próprios dados
3. **Coordenadores:** Agora podem ver todos (necessário para gerenciamento)
4. **Pais:** Continuam vendo apenas seus filhos (política existente)

## 🧪 Como Testar

1. **Recarregue a página** (F5 ou Ctrl+R)
2. **Abra o Console** (F12)
3. **Acesse: Portal do Coordenador → Aba "Professores"**
   - ✅ Deve mostrar 6 professores

4. **Volte para "Turmas" → Clique "Atribuir Professor"**
   - ✅ Deve listar professores disponíveis

5. **Atribua um professor a uma turma**
   - ✅ Professor deve aparecer na lista "Professores Atribuídos"

## 📝 Políticas RLS Completas

### Tabela `teachers`:
1. ✅ Teachers can view own data (professor vê próprios dados)
2. ✅ Teachers can insert own data (professor cria próprios dados)
3. ✅ Teachers can update own data (professor atualiza próprios dados)
4. ✅ **Coordinators can view all teachers** (coordenador vê todos) **← NOVA**

### Tabela `students`:
1. ✅ Students can view own data (aluno vê próprios dados)
2. ✅ **Coordinators can view all students** (coordenador vê todos) **← NOVA**

---
**Data:** 04/11/2025  
**Migration:** `add_coordinator_view_teachers_policy`  
**Status:** ✅ Aplicado com sucesso  
**Próximo Passo:** Recarregar a página e testar

