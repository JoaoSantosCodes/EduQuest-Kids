# 📋 PERFIL COORDENADOR - REVISÃO COMPLETA

## ✅ CAMPOS IMPLEMENTADOS

### **ProfileSettings.jsx** (Perfil Pessoal):
1. ✅ Nome Completo
2. ✅ Email (bloqueado)
3. ✅ Telefone
4. ✅ Endereço
5. ✅ Data de Nascimento
6. ❌ Avatar (RLS bloqueando upload)
7. ❓ **FALTA: Gênero**

---

## 🔍 CAMPOS QUE FALTAM

### **1. Gênero (Gender)**

**Status:** ❌ NÃO IMPLEMENTADO no ProfileSettings
**Já existe:** ✅ Coluna `gender` na tabela `users`
**Usado em:** EditUserProfile, EditStudentProfile, EditTeacherProfile

**Solução:** Adicionar campo Gender ao ProfileSettings.jsx

---

### **2. Campos Específicos do Coordenador**

Atualmente não há tabela `coordinators` com campos extras.
Se precisar, criar:

```sql
CREATE TABLE coordinators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school TEXT,
  department TEXT,
  hire_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Mas por enquanto, o coordenador usa apenas os campos de `users`.

---

## 📝 CHECKLIST COMPLETO

### **Funcionalidades do Coordenador:**

#### **Dashboard:**
- ✅ Estatísticas (turmas, professores, alunos, pais)
- ✅ Alertas (turmas sem professor, alunos sem turma, pais sem vínculo)
- ✅ Ações Rápidas (Nova Turma, Convidar Professor, Matricular Aluno, Vincular Pais)
- ✅ Gráficos e progresso

#### **Turmas:**
- ✅ Listar todas as turmas
- ✅ Filtrar por série (6ª, 7ª, 8ª, 9ª)
- ✅ Criar nova turma
- ✅ Editar turma
- ✅ Deletar turma
- ✅ Ver professores atribuídos
- ✅ Atribuir professor à turma
- ✅ Remover professor da turma
- ✅ Gerenciar alunos da turma

#### **Professores:**
- ✅ Listar todos os professores
- ✅ Convidar novo professor (criar conta)
- ✅ Editar perfil completo do professor:
  - ✅ Dados pessoais (nome, email, telefone, endereço, data nascimento, gênero)
  - ✅ Avatar
  - ✅ Matérias
  - ✅ Turmas (seleção múltipla)
- ✅ Remover professor

#### **Alunos:**
- ✅ Listar todos os alunos
- ✅ Filtrar por série
- ✅ Editar perfil completo do aluno:
  - ✅ Dados pessoais
  - ✅ Dados do responsável (nome, telefone, CPF, relação)
  - ✅ Dados acadêmicos (matrícula, status, data ingresso, observações)
  - ✅ Avatar
- ✅ Matricular aluno em turma

#### **Pais:**
- ✅ Listar todos os pais
- ✅ Editar perfil do pai
- ✅ Vincular pai ao filho (seleção múltipla)

#### **Perfil Próprio:**
- ✅ Nome
- ✅ Email
- ✅ Telefone
- ✅ Endereço
- ✅ Data de Nascimento
- ❌ Gênero (FALTA)
- ❌ Avatar (RLS bloqueando)

---

## 🔧 AÇÕES NECESSÁRIAS

### **PRIORIDADE ALTA:**

1. **Corrigir Upload de Avatar**
   - Configurar RLS no Supabase Storage
   - Ver arquivo: `CORRECAO_UPLOAD_AVATAR.md`

2. **Adicionar campo Gênero ao ProfileSettings**
   - Copiar do EditUserProfile.jsx
   - Adicionar select com opções: Masculino, Feminino, Outro, Prefiro não dizer

### **PRIORIDADE MÉDIA:**

3. **Sincronização Turmas ↔️ Professores**
   - ✅ Já corrigido (UPSERT)
   - ⚠️ Verificar se funciona após teste

---

## 📊 RESUMO

| Item | Status | Ação |
|------|--------|------|
| **Avatar Upload** | ❌ Bloqueado | Configurar RLS |
| **Campo Gênero** | ❌ Falta | Adicionar ao ProfileSettings |
| **Gerenciar Turmas** | ✅ OK | - |
| **Gerenciar Professores** | ✅ OK | - |
| **Gerenciar Alunos** | ✅ OK | - |
| **Gerenciar Pais** | ✅ OK | - |
| **Dashboard** | ✅ OK | - |
| **Sincronização** | ⚠️ Testar | Validar após fix |

---

**PRÓXIMOS PASSOS:**
1. Configurar RLS do Storage no Supabase
2. Adicionar campo Gênero ao ProfileSettings
3. Testar sincronização Turmas ↔️ Professores
4. Depois: Criar Portal do Professor

**Status Geral:** 90% completo

