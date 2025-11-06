# 🔧 SOLUÇÃO: Turmas não aparecem no modal

## ❌ PROBLEMA

**Sintoma:** As turmas criadas aparecem na aba "Turmas", mas não aparecem todas no modal "Editar Perfil do Professor".

**Turmas no banco de dados:**
- A (6º ano) - 2 turmas
- B (7º ano)
- C (8º ano)
- D (9º ano)
- E (6º ano)

**Total:** 6 turmas

---

## 🔍 POSSÍVEIS CAUSAS

### 1. Cache do Navegador
O navegador pode estar usando dados antigos em cache.

### 2. RLS (Row Level Security)
Pode haver políticas de segurança bloqueando o acesso.

### 3. Estado do React
O componente pode não estar recarregando os dados.

---

## ✅ SOLUÇÕES

### Solução 1: Limpar Cache Completamente

**Passo 1:** Abra o DevTools (F12)

**Passo 2:** Clique com botão direito no ícone de recarregar

**Passo 3:** Selecione "Esvaziar cache e atualizar forçadamente"

**Ou use o atalho:**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

### Solução 2: Verificar RLS Policies

Vou verificar se o coordenador tem permissão para ver todas as turmas:

```sql
-- Verificar policies da tabela classrooms
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'classrooms';
```

---

### Solução 3: Forçar Recarregamento dos Dados

Adicionar um timestamp na query para evitar cache:

```javascript
const { data: classroomsData } = await supabase
  .from('classrooms')
  .select('id, name, grade, shift, school_year, max_students, description')
  .order('grade', { ascending: true })
  .order('name', { ascending: true });
```

---

## 🧪 TESTE PASSO A PASSO

### 1. Verificar no Console

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Edite um professor
4. Veja o log: `📚 Turmas carregadas:`

**O que verificar:**
- Quantas turmas aparecem no array?
- Todas as 6 turmas estão lá?

**Exemplo esperado:**
```javascript
📚 Turmas carregadas: Array(6) [
  { id: "...", name: "A", grade: 6, ... },
  { id: "...", name: "A", grade: 6, ... },
  { id: "...", name: "E", grade: 6, ... },
  { id: "...", name: "B", grade: 7, ... },
  { id: "...", name: "C", grade: 8, ... },
  { id: "...", name: "D", grade: 9, ... }
]
```

---

### 2. Verificar Visualmente

No modal "Editar Perfil do Professor", role até "Turmas".

**Deve aparecer:**
```
Turmas (X selecionadas)

☐ 6º Ano A  [6ª Série]
  🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☐ 6º Ano A  [6ª Série]
  🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☐ 6º Ano E  [6ª Série]
  🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☐ 7º Ano B  [7ª Série]
  🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☐ 8º Ano C  [8ª Série]
  🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☐ 9º Ano D  [9ª Série]
  🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos
```

---

## 🔧 SE AINDA NÃO APARECER

### Verificar RLS Policies

Execute este SQL para garantir que coordenadores podem ver todas as turmas:

```sql
-- Verificar se existe policy para coordenadores
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'classrooms';

-- Se não existir, criar policy
CREATE POLICY "Coordinators can view all classrooms"
  ON public.classrooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'coordinator'
    )
  );
```

---

## 📊 VERIFICAÇÃO FINAL

### No Banco de Dados:
```sql
SELECT 
  id, 
  name, 
  grade, 
  shift, 
  school_year
FROM classrooms 
ORDER BY grade, name;
```

**Resultado esperado:**
```
name | grade | shift   | school_year
-----|-------|---------|------------
A    | 6     | morning | 2025
A    | 6     | morning | 2025
E    | 6     | morning | 2025
B    | 7     | morning | 2025
C    | 8     | morning | 2025
D    | 9     | morning | 2025
```

### No Console do Navegador:
```javascript
📚 Turmas carregadas: Array(6) [ {...}, {...}, {...}, {...}, {...}, {...} ]
```

### No Modal:
- 6 turmas visíveis na lista
- Todas com nome, ano e detalhes

---

## 🎯 AÇÃO IMEDIATA

**FAÇA AGORA:**

1. **Limpe o cache:**
   - Ctrl + Shift + R (ou Cmd + Shift + R)

2. **Abra o Console:**
   - F12 → Console

3. **Edite um professor:**
   - Veja os logs

4. **Conte as turmas:**
   - Devem ser 6 turmas

5. **Me avise:**
   - Quantas turmas aparecem no log?
   - Quantas turmas aparecem visualmente?

---

## 📝 INFORMAÇÕES ADICIONAIS

### Turmas Duplicadas

Você tem 2 turmas com o nome "A" (ambas do 6º ano). Isso é normal se:
- São turmas diferentes (ex: Turma A da manhã e Turma A da tarde)
- Foram criadas em momentos diferentes

Se quiser renomear para diferenciar:
```sql
-- Renomear uma das turmas A para A1
UPDATE classrooms 
SET name = 'A1' 
WHERE id = 'ad9cb71f-b74f-4230-8589-4a16987ced8f';
```

---

**Me avise o que aparece no console para eu poder ajudar melhor!** 🔍

