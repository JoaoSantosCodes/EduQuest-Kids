# ✅ Seleção de Role após Login com Google

## 🎯 Funcionalidade Implementada

Agora, quando um usuário faz login com Google pela primeira vez, ele pode selecionar seu perfil (role) antes de ser redirecionado para o portal correspondente.

## 📋 Perfis Disponíveis

1. **Estudante** (`student`)
   - Aluno que vai estudar e fazer quizzes
   - Ícone: GraduationCap
   - Cor: Azul

2. **Professor** (`teacher`)
   - Criar questões, quizzes e acompanhar alunos
   - Ícone: UserCog
   - Cor: Roxo

3. **Pai/Mãe** (`parent`)
   - Acompanhar o desempenho dos filhos
   - Ícone: Users
   - Cor: Verde

4. **Coordenador** (`coordinator`)
   - Gerenciar turmas e professores
   - Ícone: Award
   - Cor: Laranja

## 🔄 Fluxo de Autenticação

### **1. Login com Google**
```
Usuário clica em "Continuar com Google"
  ↓
Redirecionado para Google OAuth
  ↓
Redirecionado para /auth/callback
```

### **2. Verificação de Role**
```
AuthCallback processa o callback
  ↓
Verifica se o usuário tem role definido
  ↓
Se NÃO tem role OU foi criado há menos de 5 minutos:
  → Mostra tela de seleção de role
Se JÁ tem role:
  → Redireciona direto para o portal correspondente
```

### **3. Seleção de Role**
```
Usuário seleciona um perfil
  ↓
updateUserRole() é chamado:
  - Atualiza role na tabela users
  - Cria registro correspondente:
    * student → students
    * teacher → teachers
    * parent → parents
    * coordinator → coordinators
  ↓
Atualiza contexto de autenticação
  ↓
Redireciona para o portal correspondente
```

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos:**
1. **`src/components/auth/RoleSelection.jsx`**
   - Componente React para seleção de role
   - Interface visual com cards para cada perfil
   - Estados de loading e erro

2. **`src/services/userRoleService.js`**
   - `updateUserRole()`: Atualiza role e cria registro correspondente
   - `needsRoleSelection()`: Verifica se precisa selecionar role

### **Arquivos Modificados:**
1. **`src/pages/AuthCallback.jsx`**
   - Adicionada verificação de role após callback
   - Integração com componente de seleção
   - Handler para processar seleção de role

2. **`src/services/supabaseAuthService.js`**
   - Modificado para não definir role padrão automaticamente
   - Role agora é `null` inicialmente para permitir seleção

## 🎨 Interface de Seleção

A tela de seleção de role apresenta:
- **4 cards clicáveis** (um para cada perfil)
- **Ícones** representativos para cada perfil
- **Descrições** explicativas
- **Feedback visual** ao selecionar (card fica destacado)
- **Estado de loading** durante processamento
- **Mensagens de erro** se algo der errado

## ⚙️ Lógica de Detecção

A função `needsRoleSelection()` verifica:
1. Se o usuário **não tem role** definido → `true` (precisa selecionar)
2. Se o usuário tem role `'student'` e foi **criado há menos de 5 minutos** → `true` (permite trocar)
3. Caso contrário → `false` (não precisa selecionar)

## 🔒 Segurança

- **RLS (Row Level Security)** aplicado em todas as operações
- **Validação de role** antes de criar registros
- **Tratamento de erros** robusto
- **Logging** centralizado para debugging

## 🧪 Como Testar

1. **Faça logout** (se estiver logado)
2. **Clique em "Continuar com Google"**
3. **Complete o login com Google**
4. **Você será redirecionado para a tela de seleção de role**
5. **Selecione um perfil**
6. **Você será redirecionado para o portal correspondente**

## 📝 Notas Importantes

- **Primeiro login com Google:** Sempre mostra seleção de role
- **Usuários existentes:** Se já têm role definido, não precisam selecionar
- **Janela de 5 minutos:** Usuários com role 'student' criados recentemente podem trocar de role
- **Registro automático:** Ao selecionar um role, o registro correspondente (student/teacher/parent/coordinator) é criado automaticamente

## 🐛 Troubleshooting

### **Tela de seleção não aparece:**
- Verifique se o usuário foi criado recentemente
- Verifique se o role está `null` ou `'student'` com menos de 5 minutos de criação
- Verifique logs do console para erros

### **Erro ao selecionar role:**
- Verifique permissões RLS na tabela `users`
- Verifique se a tabela correspondente (students/teachers/parents/coordinators) existe
- Verifique logs do console para detalhes do erro

### **Redirecionamento incorreto:**
- Verifique se o role foi atualizado corretamente na tabela `users`
- Verifique se o contexto de autenticação foi atualizado
- Verifique logs do console para detalhes

