# 🧪 GUIA DE TESTE - PORTAL DO PROFESSOR

## 📋 PRÉ-REQUISITOS

Antes de começar os testes, certifique-se de que:

1. ✅ O servidor de desenvolvimento está rodando (`npm run dev`)
2. ✅ Existe pelo menos um usuário com role `teacher` no banco
3. ✅ O professor está atribuído a pelo menos uma turma
4. ✅ As turmas têm alunos matriculados

---

## 🔐 PASSO 1: LOGIN

1. Acesse `http://localhost:3000/login`
2. Faça login com credenciais de um professor
3. Verifique se foi redirecionado para `/teacher`

**Resultado esperado:**
```
✅ Login bem-sucedido
✅ Redirecionado para o Portal do Professor
✅ Nome do professor aparece no header
```

---

## 📊 PASSO 2: DASHBOARD

**O que testar:**

1. **Estatísticas:**
   - ✅ Total de turmas está correto?
   - ✅ Total de alunos está correto?
   - ✅ Total de matérias está correto?

2. **Preview de Turmas:**
   - ✅ Aparecem até 6 turmas?
   - ✅ Cada turma mostra:
     - Badge com a série (6ª, 7ª, etc.)
     - Nome da turma
     - Turno (com emoji)
     - Ano letivo

3. **Interações:**
   - ✅ Clicar em uma turma no preview leva para a aba "Minhas Turmas"?

**Comandos SQL para verificar dados:**
```sql
-- Ver turmas do professor
SELECT 
  c.id, 
  c.name, 
  c.grade, 
  c.shift, 
  c.school_year
FROM classroom_teachers ct
JOIN classrooms c ON c.id = ct.classroom_id
WHERE ct.teacher_id = (
  SELECT id FROM teachers WHERE user_id = '[SEU_USER_ID]'
) AND ct.is_active = true;

-- Ver alunos do professor
SELECT COUNT(DISTINCT cs.student_id) as total_alunos
FROM classroom_students cs
WHERE cs.classroom_id IN (
  SELECT classroom_id FROM classroom_teachers
  WHERE teacher_id = (
    SELECT id FROM teachers WHERE user_id = '[SEU_USER_ID]'
  ) AND is_active = true
);

-- Ver matérias do professor
SELECT COUNT(*) as total_materias
FROM teacher_subjects
WHERE teacher_id = (
  SELECT id FROM teachers WHERE user_id = '[SEU_USER_ID]'
);
```

---

## 📚 PASSO 3: MINHAS TURMAS

**O que testar:**

1. **Navegação:**
   - ✅ Clique na aba "Minhas Turmas"
   - ✅ A página carrega sem erros?

2. **Lista de Turmas:**
   - ✅ Todas as turmas do professor aparecem?
   - ✅ Cada card mostra:
     - Badge grande com a série
     - Nome da turma
     - Turno com emoji
     - Ano letivo
     - Capacidade máxima

3. **Busca:**
   - ✅ Digite "A" no campo de busca
   - ✅ Apenas turmas com "A" no nome aparecem?
   - ✅ Digite "6" no campo de busca
   - ✅ Apenas turmas da 6ª série aparecem?
   - ✅ Limpe o campo de busca
   - ✅ Todas as turmas voltam a aparecer?

4. **Clique em uma Turma:**
   - ✅ Clique em qualquer turma
   - ✅ Um modal abre com os detalhes?

---

## 🎓 PASSO 4: DETALHES DA TURMA (Modal)

**O que testar:**

1. **Header do Modal:**
   - ✅ Mostra a série em destaque?
   - ✅ Mostra o nome da turma?
   - ✅ Mostra turno, ano letivo, e contagem de alunos?

2. **Lista de Alunos:**
   - ✅ Todos os alunos da turma aparecem?
   - ✅ Cada aluno mostra:
     - Avatar (foto ou inicial)
     - Nome completo
     - Número de matrícula
     - Email
     - Telefone

3. **Busca no Modal:**
   - ✅ Digite o nome de um aluno
   - ✅ Apenas esse aluno aparece?
   - ✅ Digite "Mat: 2025"
   - ✅ Alunos com essa matrícula aparecem?

4. **Fechar Modal:**
   - ✅ Clique no "X"
   - ✅ Modal fecha e volta para "Minhas Turmas"?
   - ✅ Clique no botão "Voltar"
   - ✅ Modal fecha?

**Verificar no Console do Navegador:**
```
Abra DevTools (F12) → Console
✅ Não deve ter erros em vermelho
✅ Pode ter logs de debug (azul/verde)
```

---

## 👥 PASSO 5: ALUNOS

**O que testar:**

1. **Navegação:**
   - ✅ Clique na aba "Alunos"
   - ✅ A página carrega sem erros?

2. **Lista de Alunos:**
   - ✅ Todos os alunos de todas as turmas do professor aparecem?
   - ✅ Não há duplicatas?
   - ✅ Cada card mostra:
     - Avatar
     - Nome completo
     - Número de matrícula
     - Email
     - Telefone

3. **Busca:**
   - ✅ Digite um nome parcial (ex: "João")
   - ✅ Apenas alunos com "João" no nome aparecem?
   - ✅ Digite um email
   - ✅ Apenas alunos com esse email aparecem?
   - ✅ Digite uma matrícula
   - ✅ Apenas alunos com essa matrícula aparecem?

4. **Layout Responsivo:**
   - ✅ Redimensione a janela
   - ✅ Os cards se ajustam (3 → 2 → 1 coluna)?

---

## 👤 PASSO 6: PERFIL

**O que testar:**

1. **Abrir Modal:**
   - ✅ Clique no botão "Perfil" no header
   - ✅ Modal abre com os dados do professor?

2. **Editar Dados:**
   - ✅ Altere o nome
   - ✅ Altere o telefone
   - ✅ Altere a data de nascimento
   - ✅ Altere o gênero
   - ✅ Altere o endereço
   - ✅ Clique em "Salvar"
   - ✅ Mensagem de sucesso aparece?
   - ✅ Os dados foram salvos no banco?

3. **Upload de Avatar:**
   - ✅ Clique em "Escolher arquivo"
   - ✅ Selecione uma imagem
   - ✅ Preview aparece?
   - ✅ Clique em "Salvar"
   - ✅ Avatar aparece no header?

**Verificar no Banco:**
```sql
SELECT 
  name, 
  phone, 
  birth_date, 
  gender, 
  address, 
  avatar_url
FROM users
WHERE id = '[SEU_USER_ID]';
```

---

## 🚪 PASSO 7: LOGOUT

**O que testar:**

1. ✅ Clique no botão "Sair" no header
2. ✅ Foi redirecionado para `/login`?
3. ✅ Não consegue acessar `/teacher` sem login?

---

## 🐛 VERIFICAÇÃO DE ERROS

### **Console do Navegador (F12):**

**Erros que NÃO devem aparecer:**
```
❌ TypeError: Cannot read property 'map' of undefined
❌ Failed to load resource: net::ERR_CONNECTION_REFUSED
❌ Uncaught (in promise) Error: Network error
❌ 403 Forbidden (Supabase RLS)
❌ 500 Internal Server Error
```

**Logs que PODEM aparecer (são normais):**
```
✅ [React] Component mounted
✅ [Supabase] Query executed successfully
✅ [useTeacher] Loading teacher data...
✅ [useTeacher] Teacher data loaded
```

### **Network Tab (F12 → Network):**

**Requisições que devem retornar 200 OK:**
- `GET /rest/v1/classroom_teachers?...`
- `GET /rest/v1/classroom_students?...`
- `GET /rest/v1/teacher_subjects?...`
- `GET /rest/v1/users?...`
- `POST /storage/v1/object/avatars/...` (upload de avatar)

**Se alguma requisição falhar (status 400, 403, 500):**
- Verifique RLS policies no Supabase
- Verifique se o professor está atribuído a turmas
- Verifique se as turmas têm alunos

---

## ✅ CHECKLIST FINAL

Marque cada item testado:

- [ ] Login como professor
- [ ] Dashboard carrega com estatísticas corretas
- [ ] Preview de turmas funciona
- [ ] Aba "Minhas Turmas" mostra todas as turmas
- [ ] Busca de turmas funciona
- [ ] Clicar em turma abre modal
- [ ] Modal mostra alunos da turma
- [ ] Busca de alunos no modal funciona
- [ ] Aba "Alunos" mostra todos os alunos
- [ ] Busca global de alunos funciona
- [ ] Perfil abre e permite edição
- [ ] Avatar pode ser alterado
- [ ] Dados salvam corretamente
- [ ] Logout funciona
- [ ] Não há erros no console
- [ ] Layout responsivo funciona

---

## 🎉 SE TODOS OS TESTES PASSARAM:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ PORTAL DO PROFESSOR 100% FUNCIONAL                   ║
║                                                           ║
║   Todos os testes passaram!                               ║
║   O sistema está pronto para uso em produção.             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🐛 SE ALGUM TESTE FALHOU:

1. **Anote qual teste falhou**
2. **Copie a mensagem de erro do console**
3. **Tire um screenshot**
4. **Abra o DevTools → Network → Verifique requisições falhadas**
5. **Informe ao desenvolvedor**

---

**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Versão:** 1.0  
**Status:** 📝 Documento de Teste Completo

