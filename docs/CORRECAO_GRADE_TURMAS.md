# 🔧 CORREÇÃO: Campo Grade nas Turmas

## ❌ PROBLEMA IDENTIFICADO

**Sintoma:**
As turmas estão aparecendo apenas com o nome (A, B, etc.) e o ícone do turno (🌅 Integral), mas **não está aparecendo o ano/série** (6º, 7º, 8º, 9º).

**Exemplo do que está aparecendo:**
```
☑ A
  🌅 Integral
```

**Exemplo do que deveria aparecer:**
```
☑ A  [6º Ano]
  6ª série • 🌅 Integral • 2025
```

---

## 🔍 CAUSA PROVÁVEL

O campo `grade` pode não estar preenchido nas turmas do banco de dados, ou a query não está buscando esse campo corretamente.

---

## ✅ CORREÇÕES APLICADAS

### 1. Query Melhorada

**ANTES:**
```javascript
const { data: classroomsData } = await supabase
  .from('classrooms')
  .select('*')
  .order('name');
```

**DEPOIS:**
```javascript
const { data: classroomsData } = await supabase
  .from('classrooms')
  .select('id, name, grade, shift, school_year, max_students, description')
  .order('grade', { ascending: true })
  .order('name', { ascending: true });
```

**Melhorias:**
- ✅ Campos explícitos (incluindo `grade`)
- ✅ Ordenação por `grade` primeiro (6º, 7º, 8º, 9º)
- ✅ Depois ordena por `name` (A, B, C, D)

### 2. Logs Adicionados

```javascript
console.log('📚 Turmas carregadas:', classroomsData);
console.log('📊 Primeira turma:', classroomsData?.[0]);
```

**Para verificar:**
1. Abra o Console do navegador (F12)
2. Clique em "Editar" em um professor
3. Veja os logs com os dados das turmas

---

## 🔍 COMO VERIFICAR OS DADOS NO BANCO

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em "Table Editor"
3. Selecione a tabela `classrooms`
4. Verifique a coluna `grade`

**O que verificar:**
- ✅ A coluna `grade` existe?
- ✅ As turmas têm valores em `grade`?
- ✅ Os valores são números (6, 7, 8, 9)?

### Opção 2: Via SQL Editor

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
name | grade | shift    | school_year
-----|-------|----------|------------
A    | 6     | morning  | 2025
B    | 6     | afternoon| 2025
A    | 7     | morning  | 2025
B    | 7     | afternoon| 2025
```

---

## 🛠️ COMO CORRIGIR DADOS NO BANCO

Se as turmas não têm o campo `grade` preenchido, você precisa atualizar:

### Atualizar uma turma específica:
```sql
UPDATE classrooms 
SET grade = 6 
WHERE name = 'A' AND shift = 'morning';
```

### Atualizar várias turmas:
```sql
-- Turmas do 6º ano
UPDATE classrooms SET grade = 6 WHERE name IN ('A', 'B') AND grade IS NULL;

-- Turmas do 7º ano
UPDATE classrooms SET grade = 7 WHERE name IN ('C', 'D') AND grade IS NULL;

-- Turmas do 8º ano
UPDATE classrooms SET grade = 8 WHERE name IN ('E', 'F') AND grade IS NULL;

-- Turmas do 9º ano
UPDATE classrooms SET grade = 9 WHERE name IN ('G', 'H') AND grade IS NULL;
```

### Verificar turmas sem grade:
```sql
SELECT id, name, shift, grade
FROM classrooms
WHERE grade IS NULL;
```

---

## 🎯 ESTRUTURA ESPERADA DA TABELA

```sql
CREATE TABLE classrooms (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade INTEGER,  -- ⚠️ ESTE CAMPO É IMPORTANTE!
  shift VARCHAR(50),
  school_year INTEGER,
  max_students INTEGER,
  description TEXT,
  created_at TIMESTAMP
);
```

**Valores válidos para `grade`:**
- 1, 2, 3, 4, 5, 6, 7, 8, 9

---

## 🧪 TESTE PASSO A PASSO

### 1. Verificar Console do Navegador

1. Abra o navegador (F12 → Console)
2. Acesse "Gerenciar Professores"
3. Clique em "Editar" em um professor
4. Veja os logs:

```
📚 Turmas carregadas: Array(5) [ {...}, {...}, ... ]
📊 Primeira turma: Object { id: "...", name: "A", grade: 6, ... }
```

**O que verificar:**
- ✅ `grade` aparece nos logs?
- ✅ `grade` tem um valor numérico?
- ✅ `grade` não é `null` ou `undefined`?

### 2. Verificar Visualização

Se `grade` estiver correto nos logs, você deve ver:

```
☑ A  [6º Ano]
  6ª série • 🌅 Manhã • 2025
```

Se `grade` estiver `null`, você verá:

```
☑ A
  🌅 Manhã • 2025
```

---

## 🔧 SOLUÇÃO RÁPIDA

Se as turmas não têm `grade`, você pode criar turmas novas com o campo correto usando o modal "Nova Turma" no Dashboard:

1. Vá no Dashboard
2. Clique em "Nova Turma"
3. Preencha:
   - Nome: "6º Ano A"
   - **Série/Ano: 6** ⚠️ IMPORTANTE!
   - Turno: Manhã
   - Ano Letivo: 2025
4. Salve

---

## 📊 EXEMPLO COMPLETO

### Dados no Banco:
```json
{
  "id": "uuid-123",
  "name": "6º Ano A",
  "grade": 6,
  "shift": "morning",
  "school_year": 2025,
  "max_students": 30
}
```

### Visualização no Modal:
```
☑ 6º Ano A  [6º Ano]
  6ª série • 🌅 Manhã • 2025
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Abrir Console do navegador (F12)
- [ ] Editar um professor
- [ ] Verificar logs das turmas
- [ ] Confirmar que `grade` aparece nos logs
- [ ] Confirmar que `grade` tem valor numérico
- [ ] Verificar visualização no modal
- [ ] Confirmar que badge `[Xº Ano]` aparece
- [ ] Confirmar que série aparece nos detalhes

---

## 🎉 RESULTADO ESPERADO

Após a correção, as turmas devem aparecer assim:

```
Turmas (5 selecionadas)
┌─────────────────────────────────────────────┐
│ ☑ 6º Ano A  [6º Ano]                        │
│   6ª série • 🌅 Manhã • 2025                │
├─────────────────────────────────────────────┤
│ ☑ 6º Ano B  [6º Ano]                        │
│   6ª série • ☀️ Tarde • 2025                │
├─────────────────────────────────────────────┤
│ ☑ 7º Ano A  [7º Ano]                        │
│   7ª série • 🌅 Manhã • 2025                │
├─────────────────────────────────────────────┤
│ ☑ 8º Ano A  [8º Ano]                        │
│   8ª série • 🌙 Noite • 2025                │
├─────────────────────────────────────────────┤
│ ☑ 9º Ano A  [9º Ano]                        │
│   9ª série • ⏰ Integral • 2025             │
└─────────────────────────────────────────────┘
```

---

## 📝 NOTAS IMPORTANTES

1. **Campo `grade` é opcional no código**, mas **essencial para uma boa UX**
2. Se `grade` for `null`, o badge e a série não aparecem
3. A ordenação por `grade` ajuda a organizar as turmas por ano
4. Os logs no console ajudam a diagnosticar problemas

---

**Data da Correção:** 05/11/2025  
**Status:** ✅ CORREÇÃO APLICADA - AGUARDANDO VERIFICAÇÃO DOS DADOS

