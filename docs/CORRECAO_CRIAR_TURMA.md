# 🔧 CORREÇÃO: Erro ao Criar Turma

## ❌ PROBLEMA IDENTIFICADO

```
Erro ao criar turma: null value in column "grade_level" of relation "classrooms" violates not-null constraint
```

### 🔍 Causa Raiz

A tabela `classrooms` possui **DOIS** campos para série:
- `grade_level` (INTEGER, **NOT NULL**) - Campo antigo/legado
- `grade` (INTEGER, NULLABLE) - Campo novo adicionado recentemente

O componente `CreateClassroomModal.jsx` estava inserindo apenas o campo `grade`, mas o campo `grade_level` é obrigatório e não estava sendo preenchido.

---

## ✅ SOLUÇÃO APLICADA

### Arquivo: `src/components/coordinator/CreateClassroomModal.jsx`

**ANTES:**
```javascript
const { data, error } = await supabase
  .from('classrooms')
  .insert([
    {
      name: formData.name,
      grade: formData.grade,
      shift: formData.shift,
      school_year: formData.school_year,
      max_students: formData.max_students,
      description: formData.description || null,
    },
  ])
  .select();
```

**DEPOIS:**
```javascript
const { data, error } = await supabase
  .from('classrooms')
  .insert([
    {
      name: formData.name,
      grade: formData.grade,
      grade_level: formData.grade, // ✅ Campo obrigatório (mesmo valor que grade)
      shift: formData.shift,
      school_year: formData.school_year,
      max_students: formData.max_students,
      description: formData.description || null,
    },
  ])
  .select();
```

---

## 🎯 RESULTADO

✅ **Agora é possível criar turmas sem erros!**

### Campos Preenchidos Automaticamente:
- `name` - Nome da turma (ex: "B")
- `grade` - Série/Ano (ex: 6)
- `grade_level` - Série/Ano (ex: 6) - **MESMO VALOR QUE `grade`**
- `shift` - Turno (ex: "morning")
- `school_year` - Ano letivo (ex: 2025)
- `max_students` - Máximo de alunos (ex: 30)
- `description` - Descrição (opcional)

---

## 📝 OBSERVAÇÃO

**Por que temos dois campos?**

- `grade_level` - Campo original do banco de dados (obrigatório)
- `grade` - Campo novo adicionado para melhorar a organização

**Solução ideal futura:**
- Migrar todos os dados para usar apenas `grade`
- Remover o campo `grade_level` após migração completa
- Por enquanto, mantemos ambos sincronizados

---

## 🧪 TESTE

1. **Abra o Dashboard do Coordenador**
2. **Clique em "Nova Turma"**
3. **Preencha:**
   - Nome: `B`
   - Série: `6ª Série`
   - Turno: `Manhã`
   - Ano Letivo: `2025`
   - Máximo de Alunos: `30`
4. **Clique em "Criar Turma"**
5. **✅ Sucesso!** A turma será criada sem erros

---

**Status:** ✅ CORRIGIDO
**Data:** 05/11/2025
**Arquivo:** `src/components/coordinator/CreateClassroomModal.jsx`

