# 🔒 SISTEMA DE PERMISSÕES E ROLES - EduQuest Kids

## ❌ PROBLEMAS IDENTIFICADOS

1. **Qualquer pessoa pode se registrar como Coordenador**
2. **Falta interface para atribuições e vinculações**
3. **Não há controle de quem pode criar cada tipo de conta**

---

## ✅ SOLUÇÃO PROPOSTA

### **REGISTRO PÚBLICO (Sem restrições):**
- 🎓 **Student** (Aluno) - Qualquer pessoa pode se registrar
- 👪 **Parent** (Pai/Mãe) - Qualquer pessoa pode se registrar

### **REGISTRO RESTRITO (Apenas por convite/admin):**
- 👨‍🏫 **Teacher** (Professor) - Apenas coordenador pode criar
- 📊 **Coordinator** (Coordenador) - Apenas primeiro usuário ou admin

---

## 🔧 IMPLEMENTAÇÃO

### **1. Atualizar Componente de Registro**

#### **Arquivo: `src/components/auth/Register.jsx`**

```javascript
// Remover opções restritas do formulário público
const publicRoles = [
  { value: 'student', label: 'Sou Aluno', icon: '🎓' },
  { value: 'parent', label: 'Sou Pai/Mãe', icon: '👪' },
];

// Roles restritos não aparecem no formulário público
// Serão criados por interfaces específicas
```

---

### **2. Atualizar RoleSelection (Login Google)**

#### **Arquivo: `src/components/auth/RoleSelection.jsx`**

```javascript
// Apenas permitir roles públicos na seleção pós-Google
const allowedRoles = [
  { value: 'student', label: 'Sou Aluno', icon: '🎓' },
  { value: 'parent', label: 'Sou Pai/Mãe', icon: '👪' },
];

// Nota: "Sou Professor" ou "Sou Coordenador" não aparecem
// Esses roles são atribuídos pelo sistema
```

---

### **3. Interface de Gestão do Coordenador**

#### **Novo Componente: `src/components/coordinator/ManageTeachers.jsx`**

```javascript
/**
 * Interface para Coordenador criar e gerenciar professores
 */

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Listar professores da escola
  const loadTeachers = async () => {
    const { data } = await supabase
      .from('teachers')
      .select('*, users(email, name)')
      .eq('school', coordinatorSchool);
    setTeachers(data);
  };

  // Convidar novo professor
  const inviteTeacher = async (email, name) => {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: 'teacher',
      }
    });

    if (authError) {
      toast.error('Erro ao criar usuário');
      return;
    }

    // 2. Criar registro na tabela users
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        role: 'teacher',
      });

    // 3. Criar registro na tabela teachers
    const { error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user_id: authData.user.id,
        school: coordinatorSchool,
      });

    if (!userError && !teacherError) {
      toast.success('Professor convidado com sucesso!');
      // Enviar email com link de acesso
      sendInviteEmail(email, name);
      loadTeachers();
    }
  };

  return (
    <div>
      <h2>Gerenciar Professores</h2>
      
      <button onClick={() => setShowInviteForm(true)}>
        + Convidar Professor
      </button>

      {showInviteForm && (
        <InviteTeacherForm 
          onSubmit={inviteTeacher}
          onCancel={() => setShowInviteForm(false)}
        />
      )}

      <TeachersList teachers={teachers} />
    </div>
  );
}
```

---

### **4. Interface de Vinculação de Filhos (Pais)**

#### **Componente Existente: `src/components/parent/LinkChildView.jsx`**

```javascript
/**
 * Interface para Pais vincularem filhos
 * JÁ EXISTE NO CÓDIGO!
 */

// Pai busca filho por:
// - Email do aluno
// - Código de vinculação
// - Nome + Escola

const linkChild = async (studentEmail) => {
  // 1. Buscar aluno
  const { data: student } = await supabase
    .from('students')
    .select('*, users(email, name)')
    .eq('users.email', studentEmail)
    .single();

  if (!student) {
    toast.error('Aluno não encontrado');
    return;
  }

  // 2. Criar vinculação
  const { error } = await supabase
    .from('parent_student_relations')
    .insert({
      parent_id: currentParent.id,
      student_id: student.id,
      relation_type: 'parent', // pai, mãe, responsável
    });

  if (!error) {
    toast.success('Filho vinculado com sucesso!');
  }
};
```

---

### **5. Sistema de Convites (Tabela nova)**

#### **SQL: Criar tabela de convites**

```sql
-- Tabela para gerenciar convites de professores
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- 'teacher', 'coordinator'
  invited_by UUID REFERENCES users(id),
  school VARCHAR(255),
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Coordenadores podem criar e ver seus convites
CREATE POLICY "Coordinators can manage invitations"
ON invitations FOR ALL
USING (
  invited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM coordinators 
    WHERE coordinators.user_id = auth.uid()
  )
);

-- Qualquer pessoa pode aceitar convite com token válido
CREATE POLICY "Anyone can accept invitation with valid token"
ON invitations FOR SELECT
USING (status = 'pending' AND expires_at > NOW());
```

---

## 📊 FLUXO COMPLETO

### **FLUXO 1: Registro de Aluno (Público)**

```
1. Usuário acessa /register
2. Escolhe "Sou Aluno"
3. Preenche: Nome, Email, Senha, Série
4. Sistema cria:
   - Registro em users (role: student)
   - Registro em students
5. ✅ Aluno pode fazer login
```

### **FLUXO 2: Registro de Pai (Público)**

```
1. Usuário acessa /register
2. Escolhe "Sou Pai/Mãe"
3. Preenche: Nome, Email, Senha
4. Sistema cria:
   - Registro em users (role: parent)
   - Registro em parents
5. Após login, vai para "Vincular Filhos"
6. Busca filho por email ou código
7. ✅ Vinculação criada
```

### **FLUXO 3: Convite de Professor (Restrito)**

```
1. Coordenador acessa Portal do Coordenador
2. Vai em "Gerenciar Professores"
3. Clica em "Convidar Professor"
4. Preenche: Nome, Email
5. Sistema:
   - Cria convite na tabela invitations
   - Gera token único
   - Envia email com link
6. Professor recebe email
7. Clica no link: /accept-invitation?token=xxx
8. Define senha
9. Sistema cria:
   - Registro em users (role: teacher)
   - Registro em teachers
10. ✅ Professor pode fazer login
```

### **FLUXO 4: Primeiro Coordenador (Setup Inicial)**

```
OPÇÃO A - Registro Especial:
1. Primeiro usuário registrado se torna coordenador
2. Verifica: SELECT COUNT(*) FROM coordinators
3. Se = 0, permite criar coordenador

OPÇÃO B - Script SQL:
1. Admin executa SQL para criar coordenador
2. Define email e dados
3. Envia credenciais por email

OPÇÃO C - Variável de Ambiente:
1. Define ADMIN_EMAIL no .env
2. Quem registrar com esse email vira coordenador
```

---

## 🎨 INTERFACES A CRIAR

### **1. Portal do Coordenador - Gerenciar Professores**
- ✅ Listar professores
- ✅ Convidar novo professor
- ✅ Remover professor
- ✅ Atribuir turmas a professores

### **2. Portal dos Pais - Vincular Filhos**
- ✅ Já existe: `src/components/parent/LinkChildView.jsx`
- ⚠️ Precisa melhorar busca e validação

### **3. Portal do Professor - Ver Turmas Atribuídas**
- ✅ Listar turmas do professor
- ✅ Ver alunos de cada turma
- ✅ Já existe parcialmente

### **4. Página de Aceitar Convite**
- ❌ Criar: `src/pages/AcceptInvitation.jsx`
- Validar token
- Permitir definir senha
- Criar conta automaticamente

---

## 🔐 POLÍTICAS DE SEGURANÇA

### **Registro:**
- ✅ Student e Parent: Público
- 🔒 Teacher: Apenas por convite
- 🔒 Coordinator: Apenas primeiro ou admin

### **Atribuições:**
- 🔒 Apenas Coordenador pode atribuir professores a turmas
- ✅ Pais podem vincular seus próprios filhos
- 🔒 Professores veem apenas suas turmas

### **Dados:**
- 🔒 RLS garante que cada role vê apenas seus dados
- 🔒 Coordenador vê toda sua escola
- 🔒 Professor vê apenas suas turmas
- 🔒 Pai vê apenas filhos vinculados
- ✅ Aluno vê apenas seus dados

---

## ✅ RESUMO DA SOLUÇÃO

### **O QUE FAZER:**

1. **Atualizar Register.jsx**
   - Remover opções Teacher e Coordinator
   - Deixar apenas Student e Parent

2. **Criar ManageTeachers.jsx**
   - Interface para coordenador convidar professores
   - Listar e gerenciar professores

3. **Criar tabela invitations**
   - Gerenciar convites pendentes
   - Tokens de acesso únicos

4. **Criar AcceptInvitation.jsx**
   - Página para aceitar convite
   - Definir senha e criar conta

5. **Melhorar LinkChildView.jsx**
   - Interface já existe
   - Melhorar busca e validação

6. **Criar primeiro Coordenador**
   - Script SQL ou registro especial
   - ADMIN_EMAIL no .env

---

## 🚀 PRIORIDADES

### **URGENTE (Segurança):**
1. ✅ Remover Coordinator e Teacher do registro público
2. ✅ Atualizar RoleSelection (Google login)

### **IMPORTANTE (Funcionalidade):**
3. ✅ Criar interface de convite de professores
4. ✅ Criar sistema de tokens de convite
5. ✅ Criar página de aceitar convite

### **OPCIONAL (Melhorias):**
6. ⏳ Melhorar interface de vinculação de filhos
7. ⏳ Dashboard de convites pendentes
8. ⏳ Notificações por email

---

**Quer que eu implemente essas correções agora?** 🚀

