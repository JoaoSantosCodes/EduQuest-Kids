# 📋 Pendências do Projeto - EduQuest Kids

## 📊 Status Atual: **95% COMPLETO**

---

## 🔴 **CRÍTICO - Segurança e Performance**

### **1. Política RLS Faltando**
- ❌ **Tabela `quiz_questions`** tem RLS habilitado mas **sem política criada**
- **Impacto:** Usuários não conseguem acessar dados da tabela
- **Solução:** Criar política RLS para `quiz_questions`

### **2. Views com SECURITY DEFINER (Erro de Segurança)**
- ❌ **View `student_stats`** usa `SECURITY DEFINER`
- ❌ **View `student_subject_performance`** usa `SECURITY DEFINER`
- ❌ **View `leaderboard`** usa `SECURITY DEFINER`
- **Impacto:** Potencial vulnerabilidade de segurança
- **Solução:** Revisar e ajustar views para não usar `SECURITY DEFINER` ou criar políticas RLS adequadas

### **3. Funções com Search Path Mutável (Aviso de Segurança)**
- ⚠️ **Função `handle_new_coordinator`** tem search_path mutável
- ⚠️ **Função `update_question_stats`** tem search_path mutável
- ⚠️ **Função `update_updated_at_column`** tem search_path mutável
- ⚠️ **Função `calculate_quiz_percentage`** tem search_path mutável
- **Impacto:** Potencial vulnerabilidade de segurança
- **Solução:** Adicionar `SET search_path = ''` nas funções

---

## 🟡 **IMPORTANTE - Performance**

### **1. Índices Não Utilizados**
- ℹ️ **Muitos índices nunca foram usados** (27 índices)
- **Impacto:** Espaço desperdiçado, pode melhorar performance
- **Solução:** Remover índices não utilizados ou verificar se são necessários

### **2. Foreign Keys Sem Índices**
- ⚠️ **Tabela `classroom_teachers`** - FK `assigned_by` sem índice
- ⚠️ **Tabela `classrooms`** - FK `coordinator_id` sem índice
- ⚠️ **Tabela `messages`** - FK `parent_message_id` sem índice
- ⚠️ **Tabela `parental_controls`** - FK `parent_id` sem índice
- ⚠️ **Tabela `questions`** - FK `approved_by` sem índice
- ⚠️ **Tabela `study_plans`** - FK `created_by` e `subject_id` sem índices
- ⚠️ **Tabela `study_sessions`** - FK `subject_id` sem índice
- **Impacto:** Queries podem ser mais lentas
- **Solução:** Criar índices para essas foreign keys

### **3. Políticas RLS Ineficientes (Performance)**
- ⚠️ **Todas as políticas RLS** reavaliam `auth.uid()` para cada linha
- **Impacto:** Performance degradada em escala
- **Solução:** Substituir `auth.uid()` por `(select auth.uid())` em todas as políticas

### **4. Múltiplas Políticas Permissivas (Performance)**
- ⚠️ **Várias tabelas** têm múltiplas políticas permissivas para a mesma ação
- **Impacto:** Cada política é executada para cada query
- **Solução:** Combinar políticas onde possível

---

## 🟢 **OPCIONAL - Melhorias**

### **1. Importação em Massa de Questões**
- ❌ Interface de upload de CSV/Excel
- ❌ Parser de arquivo
- ❌ Validação de dados
- **Prioridade:** Baixa

### **2. Exportação de Questões**
- ❌ Exportação em CSV/Excel
- **Prioridade:** Baixa

### **3. Proteção de Senha Vazada**
- ⚠️ **Supabase Auth** - Proteção contra senhas vazadas desabilitada
- **Solução:** Habilitar no dashboard do Supabase
- **Prioridade:** Média

---

## 📝 **Resumo das Pendências**

### **🔴 Crítico (Fazer Agora):**
1. ✅ Criar política RLS para `quiz_questions`
2. ✅ Corrigir views com `SECURITY DEFINER`
3. ✅ Corrigir funções com search_path mutável

### **🟡 Importante (Fazer em Breve):**
1. ✅ Criar índices para foreign keys sem cobertura
2. ✅ Otimizar políticas RLS (usar `(select auth.uid())`)
3. ✅ Remover índices não utilizados

### **🟢 Opcional (Quando Houver Tempo):**
1. ✅ Importação em massa de questões
2. ✅ Exportação de questões
3. ✅ Habilitar proteção de senha vazada

---

## 🎯 **Prioridades de Ação**

### **1. Segurança (Hoje)**
```sql
-- Criar política RLS para quiz_questions
-- Corrigir views com SECURITY DEFINER
-- Corrigir funções com search_path mutável
```

### **2. Performance (Esta Semana)**
```sql
-- Criar índices para foreign keys
-- Otimizar políticas RLS
-- Remover índices não utilizados
```

### **3. Funcionalidades (Quando Necessário)**
- Importação em massa
- Exportação de questões
- Habilitar proteção de senha

---

## ✅ **O Que Está Funcionando**

- ✅ Autenticação completa
- ✅ Todos os 4 portais (Aluno, Professor, Pais, Coordenador)
- ✅ RLS habilitado (exceto `quiz_questions`)
- ✅ Sistema de conquistas
- ✅ Plano de estudos
- ✅ Ranking
- ✅ Mensagens
- ✅ Exportação PDF
- ✅ Edição de questões
- ✅ Vinculação de pais e filhos
- ✅ Vinculação de professores e turmas
- ✅ Vinculação de coordenadores e professores

---

**Status:** O projeto está **funcional e quase completo**, mas precisa de **ajustes de segurança e performance** antes de produção.

