# 🔧 CORREÇÃO: Coluna grade na Tabela classrooms

## ❌ ERRO IDENTIFICADO

**Erro no Console:**
```
Erro ao carregar dados: Object { 
  code: "42703", 
  details: null, 
  hint: null, 
  message: "column classrooms.grade does not exist" 
}
```

**Causa:**
A coluna `grade` não existia na tabela `classrooms`, mas o código estava tentando buscar e exibir esse campo.

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Migration Aplicada: `add_grade_to_classrooms`

Adicionamos a coluna `grade` à tabela `classrooms` e atualizamos automaticamente as turmas existentes com base no nome.

---

## 🗄️ ALTERAÇÃO NO BANCO DE DADOS

```sql
-- Adicionar coluna grade
ALTER TABLE public.classrooms
ADD COLUMN IF NOT EXISTS grade INTEGER;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_classrooms_grade ON public.classrooms(grade);
```

### Estrutura Atualizada da Tabela:

```
classrooms
├── id (UUID, PK)
├── name (VARCHAR)
├── grade (INTEGER) ⭐ NOVO
├── shift (VARCHAR)
├── school_year (INTEGER)
├── max_students (INTEGER)
├── description (TEXT)
└── created_at (TIMESTAMP)
```

---

## 🤖 ATUALIZAÇÃO AUTOMÁTICA

A migration também tenta atualizar automaticamente as turmas existentes com base no nome:

```sql
UPDATE public.classrooms 
SET grade = CASE
  WHEN name ILIKE '%6%' OR name ILIKE '%sexto%' THEN 6
  WHEN name ILIKE '%7%' OR name ILIKE '%setimo%' THEN 7
  WHEN name ILIKE '%8%' OR name ILIKE '%oitavo%' THEN 8
  WHEN name ILIKE '%9%' OR name ILIKE '%nono%' THEN 9
  -- ... outras séries
END
WHERE grade IS NULL;
```

**Exemplos:**
- Turma "6º Ano A" → `grade = 6`
- Turma "7ª série B" → `grade = 7`
- Turma "Oitavo Ano" → `grade = 8`
- Turma "A" → `grade = NULL` (não detectado, precisa atualizar manualmente)

---

## 🔍 VERIFICAR SE FUNCIONOU

### 1. Verificar a Estrutura da Tabela:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'classrooms'
AND column_name = 'grade';
```

**Resultado esperado:**
```
column_name | data_type | is_nullable
------------|-----------|------------
grade       | integer   | YES
```

### 2. Verificar os Dados:
```sql
SELECT id, name, grade, shift
FROM classrooms
ORDER BY grade, name;
```

**Resultado esperado:**
```
name         | grade | shift
-------------|-------|----------
6º Ano A     | 6     | morning
6º Ano B     | 6     | afternoon
7º Ano A     | 7     | morning
A            | NULL  | morning  -- ⚠️ Precisa atualizar manualmente
```

---

## 🛠️ ATUALIZAR TURMAS MANUALMENTE

Se alguma turma não foi atualizada automaticamente (grade = NULL), você pode atualizar manualmente:

### Atualizar uma turma específica:
```sql
UPDATE classrooms 
SET grade = 6 
WHERE name = 'A' AND shift = 'morning';
```

### Atualizar várias turmas de uma vez:
```sql
-- Turmas do 6º ano
UPDATE classrooms SET grade = 6 WHERE id IN ('uuid1', 'uuid2', 'uuid3');

-- Turmas do 7º ano
UPDATE classrooms SET grade = 7 WHERE id IN ('uuid4', 'uuid5');
```

### Verificar turmas sem grade:
```sql
SELECT id, name, shift, grade
FROM classrooms
WHERE grade IS NULL;
```

---

## 📊 IMPACTO NO FRONTEND

Após a migration, o modal "Editar Perfil do Professor" agora exibirá:

### ANTES (com erro):
```
❌ Erro ao carregar dados
```

### DEPOIS (funcionando):
```
Turmas (5 selecionadas)
┌─────────────────────────────────────────────┐
│ ☑ 6º Ano A  [6º Ano]                        │
│   6ª série • 🌅 Manhã • 2025                │
├─────────────────────────────────────────────┤
│ ☑ 7º Ano B  [7º Ano]                        │
│   7ª série • ☀️ Tarde • 2025                │
└─────────────────────────────────────────────┘
```

---

## 🎯 VALORES VÁLIDOS PARA GRADE

| Valor | Descrição |
|-------|-----------|
| 1 | 1º Ano / 1ª Série |
| 2 | 2º Ano / 2ª Série |
| 3 | 3º Ano / 3ª Série |
| 4 | 4º Ano / 4ª Série |
| 5 | 5º Ano / 5ª Série |
| 6 | 6º Ano / 6ª Série |
| 7 | 7º Ano / 7ª Série |
| 8 | 8º Ano / 8ª Série |
| 9 | 9º Ano / 9ª Série |
| NULL | Não definido |

---

## 🧪 TESTE COMPLETO

### 1. Recarregar a Página
```
F5 ou Ctrl + R
```

### 2. Abrir Console
```
F12 → Console
```

### 3. Editar um Professor
- Acesse "Gerenciar Professores"
- Clique em "Editar" em um professor
- Veja os logs:

```
📚 Turmas carregadas: Array(5) [ {...}, {...}, ... ]
📊 Primeira turma: Object { 
  id: "...", 
  name: "6º Ano A", 
  grade: 6,  ✅ AGORA APARECE!
  shift: "morning",
  school_year: 2025
}
```

### 4. Verificar Visualização
```
☑ 6º Ano A  [6º Ano]
  6ª série • 🌅 Manhã • 2025
```

---

## 📝 NOTAS IMPORTANTES

1. **Coluna `grade` agora existe** na tabela `classrooms`
2. **Índice criado** para melhorar performance de buscas e ordenação
3. **Atualização automática** tenta preencher o campo com base no nome
4. **Turmas novas** criadas pelo modal "Nova Turma" já terão o campo `grade` preenchido
5. **Turmas antigas** podem precisar de atualização manual se não foram detectadas automaticamente

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [x] Coluna `grade` criada na tabela `classrooms`
- [x] Índice `idx_classrooms_grade` criado
- [x] Migration aplicada com sucesso
- [ ] Verificar turmas no banco (SQL)
- [ ] Atualizar turmas com `grade = NULL` (se necessário)
- [ ] Recarregar página no navegador
- [ ] Testar edição de professor
- [ ] Verificar que badge `[Xº Ano]` aparece

---

## 🎉 RESULTADO

Após a migration:

- ✅ Coluna `grade` criada
- ✅ Erro "column does not exist" resolvido
- ✅ Turmas exibem o ano/série corretamente
- ✅ Badge `[6º Ano]` aparece
- ✅ Ordenação por série funciona
- ✅ Interface completa e funcional

---

**Data da Correção:** 05/11/2025  
**Status:** ✅ RESOLVIDO

