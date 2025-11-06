# 📚 COMO FUNCIONA A ATRIBUIÇÃO DE TURMAS AOS PROFESSORES

## 🎯 RESPOSTA RÁPIDA

**SIM!** O sistema **ADICIONA E REMOVE** automaticamente o professor das turmas quando você marca/desmarca os checkboxes.

---

## 🔄 COMO FUNCIONA

### 1️⃣ **MARCAR CHECKBOX (☑️)**
Quando você **MARCA** uma turma:
- ✅ O professor é **ADICIONADO** à turma
- ✅ Um registro é criado/ativado na tabela `classroom_teachers`
- ✅ O professor passa a ter acesso à turma

### 2️⃣ **DESMARCAR CHECKBOX (☐)**
Quando você **DESMARCA** uma turma:
- ❌ O professor é **REMOVIDO** da turma
- ❌ O registro é **DESATIVADO** na tabela `classroom_teachers` (`is_active = false`)
- ❌ O professor perde acesso à turma

---

## 🔧 LÓGICA IMPLEMENTADA

### Arquivo: `src/components/coordinator/EditTeacherProfile.jsx`

```javascript
// 4. Atualizar turmas do professor
// Desativar turmas antigas
const { error: deactivateClassroomsError } = await supabase
  .from('classroom_teachers')
  .update({ is_active: false })
  .eq('teacher_id', teacher.id);

// Inserir/ativar novas turmas
if (teacherData.classrooms.length > 0) {
  for (const classroomId of teacherData.classrooms) {
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('classroom_teachers')
      .select('id')
      .eq('teacher_id', teacher.id)
      .eq('classroom_id', classroomId)
      .single();

    if (existing) {
      // ✅ REATIVAR turma existente
      await supabase
        .from('classroom_teachers')
        .update({ is_active: true })
        .eq('id', existing.id);
    } else {
      // ✅ INSERIR nova turma
      await supabase
        .from('classroom_teachers')
        .insert({
          teacher_id: teacher.id,
          classroom_id: classroomId,
          assigned_by: user?.id,
          is_active: true,
        });
    }
  }
}
```

---

## 📊 FLUXO COMPLETO

### **CENÁRIO 1: Professor sem turmas**
```
Estado Inicial: Professor João - Nenhuma turma
↓
Ação: Marcar ☑️ 6º Ano A e ☑️ 7º Ano B
↓
Resultado: Professor João agora está em 2 turmas
```

### **CENÁRIO 2: Professor já tem turmas**
```
Estado Inicial: Professor João - 6º Ano A, 7º Ano B
↓
Ação: Desmarcar ☐ 6º Ano A, Manter ☑️ 7º Ano B, Marcar ☑️ 8º Ano C
↓
Resultado: 
  - 6º Ano A: DESATIVADO (is_active = false)
  - 7º Ano B: MANTIDO (is_active = true)
  - 8º Ano C: ADICIONADO (is_active = true)
```

---

## 🎨 INTERFACE

### No Modal de Editar Professor:

```
📚 Turmas (Seleção Múltipla)

☑️ 6º Ano A  [6ª Série]
   🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☐ 7º Ano A  [7ª Série]
   🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos

☑️ 7º Ano B  [7ª Série]
   🌅 Manhã • 📅 2025 • 👥 Máx: 30 alunos
```

**✅ Marcado** = Professor está na turma
**☐ Desmarcado** = Professor NÃO está na turma

---

## 💡 VANTAGENS DESTE SISTEMA

### ✅ **Histórico Preservado**
- Os registros não são deletados, apenas desativados
- É possível rastrear quem atribuiu cada turma (`assigned_by`)
- Mantém histórico de quando foi criado (`created_at`)

### ✅ **Reativação Inteligente**
- Se você desmarcar e depois marcar novamente, o sistema reativa o registro existente
- Não cria duplicatas

### ✅ **Controle Total**
- O coordenador pode adicionar/remover professores de qualquer turma
- Mudanças são aplicadas imediatamente ao salvar

---

## 🧪 TESTE PRÁTICO

### **Passo a Passo:**

1. **Abra a aba "Professores"**
2. **Clique em "Editar" (ícone ✏️) em um professor**
3. **Role até "Turmas"**
4. **Marque/desmarque as turmas desejadas**
5. **Clique em "Salvar"**
6. **✅ Pronto!** As turmas foram atualizadas

### **Verificar:**
- Abra novamente o modal do professor
- Veja que os checkboxes refletem as turmas atuais
- As turmas desmarcadas não aparecem mais

---

## 📝 RESUMO

| Ação | Resultado | Banco de Dados |
|------|-----------|----------------|
| ☑️ **Marcar turma** | Professor ENTRA na turma | `INSERT` ou `UPDATE is_active = true` |
| ☐ **Desmarcar turma** | Professor SAI da turma | `UPDATE is_active = false` |
| 💾 **Salvar** | Aplica todas as mudanças | Atualiza `classroom_teachers` |

---

**Status:** ✅ FUNCIONANDO
**Sistema:** Adiciona e Remove automaticamente
**Histórico:** Preservado (soft delete)

