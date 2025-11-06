# 🔍 TROUBLESHOOTING: Editar Perfil Não Está Salvando

## 📋 PASSOS PARA DIAGNOSTICAR

### 1. **Recarregar a Página**
```
Pressione: Ctrl + Shift + R
```
Isso garante que o código novo está carregado.

---

### 2. **Abrir Console do Navegador**
```
Pressione: F12
Vá para aba "Console"
```

---

### 3. **Editar um Perfil**
1. Clique no ícone 📝 de um professor
2. Preencha os campos:
   - **Nome:** Ana Barbosa
   - **Telefone:** (11) 98765-4321
   - **Data:** 1990-03-15
   - **Gênero:** Feminino
   - **Endereço:** Rua das Flores, 123
3. Clique em "Salvar Alterações"

---

### 4. **Verificar Logs no Console**

Você deve ver os seguintes logs:

#### ✅ **Log 1: Dados do Usuário**
```javascript
💾 Salvando perfil do usuário...
{
  userId: "abc123...",
  userName: "Ana Barbosa",
  userEmail: "supernerdconectado@gmail.com",
  data: {
    name: "Ana Barbosa",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 123",
    birth_date: "1990-03-15",
    gender: "feminino",
    ...
  }
}
```

#### ✅ **Log 2: Sessão Atual**
```javascript
🔐 Sessão atual:
{
  userId: "ce2a38d5-...",  // ID do coordenador logado
  userEmail: "jstudio.aurantis@gmail.com"
}
```

#### ✅ **Log 3: Dados a Serem Salvos**
```javascript
📤 Dados a serem salvos:
{
  name: "Ana Barbosa",
  phone: "(11) 98765-4321",
  address: "Rua das Flores, 123",
  birth_date: "1990-03-15",
  avatar_url: "...",
  gender: "feminino"
}
```

#### ✅ **Log 4: ID do Usuário**
```javascript
🎯 Atualizando usuário com ID: abc123...
```

#### ✅ **Log 5: Resposta do Supabase**
```javascript
📊 Resposta do Supabase:
{
  data: [{
    id: "abc123...",
    name: "Ana Barbosa",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 123",
    birth_date: "1990-03-15",
    gender: "feminino",
    ...
  }],
  error: null,
  dataLength: 1,
  firstRecord: {...}
}
```

#### ✅ **Log 6: Sucesso**
```javascript
✅ Perfil atualizado com sucesso!
```

---

## ❌ POSSÍVEIS ERROS

### Erro 1: RLS Bloqueando
```javascript
📊 Resposta do Supabase:
{
  data: [],
  error: null,
  dataLength: 0,
  firstRecord: undefined
}
```

**Causa:** A política RLS não está permitindo a atualização.

**Solução:**
```sql
-- Verificar se você está logado como coordenador
SELECT * FROM coordinators WHERE user_id = auth.uid();

-- Se não retornar nada, você não é coordenador!
```

---

### Erro 2: Erro de Permissão
```javascript
📊 Resposta do Supabase:
{
  data: null,
  error: {
    code: "42501",
    message: "permission denied for table users"
  }
}
```

**Causa:** RLS está bloqueando.

**Solução:** Verificar políticas RLS.

---

### Erro 3: Coluna Não Existe
```javascript
📊 Resposta do Supabase:
{
  data: null,
  error: {
    code: "42703",
    message: "column \"phone\" does not exist"
  }
}
```

**Causa:** A coluna não existe no banco.

**Solução:** Adicionar a coluna.

---

### Erro 4: Constraint Violation
```javascript
📊 Resposta do Supabase:
{
  data: null,
  error: {
    code: "23xxx",
    message: "violates check constraint"
  }
}
```

**Causa:** Dados inválidos.

**Solução:** Verificar formato dos dados.

---

## 🔧 SOLUÇÕES

### Solução 1: Verificar se Você é Coordenador

Execute no Supabase SQL Editor:

```sql
-- Verificar seu user_id
SELECT auth.uid();

-- Verificar se você é coordenador
SELECT * FROM coordinators WHERE user_id = auth.uid();
```

Se não retornar nada, você precisa se tornar coordenador:

```sql
-- Buscar seu user_id
SELECT id, email, name, role FROM users WHERE email = 'jstudio.aurantis@gmail.com';

-- Inserir na tabela coordinators (substitua o ID)
INSERT INTO coordinators (user_id, school)
VALUES ('seu-user-id-aqui', 'Escola Teste');
```

---

### Solução 2: Testar Update Manual

Execute no Supabase SQL Editor:

```sql
-- Testar update manual
UPDATE users
SET 
  phone = '(11) 98765-4321',
  address = 'Rua das Flores, 123',
  birth_date = '1990-03-15',
  gender = 'feminino'
WHERE email = 'supernerdconectado@gmail.com';

-- Verificar se atualizou
SELECT 
  name, 
  email, 
  phone, 
  address, 
  birth_date, 
  gender
FROM users
WHERE email = 'supernerdconectado@gmail.com';
```

---

### Solução 3: Desabilitar RLS Temporariamente (APENAS PARA TESTE)

```sql
-- ATENÇÃO: Isso remove a segurança! Apenas para teste!
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Tentar salvar novamente no app

-- IMPORTANTE: Reativar depois!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

---

## 📸 ME ENVIE

Para eu poder ajudar melhor, me envie uma captura de tela do **Console (F12)** mostrando:

1. ✅ Todos os logs (💾, 🔐, 📤, 🎯, 📊)
2. ❌ Qualquer erro em vermelho
3. ⚠️ Qualquer warning em amarelo

---

## 🧪 TESTE RÁPIDO

Execute este SQL para testar se o problema é RLS:

```sql
-- Verificar se você pode ver o usuário
SELECT id, name, email, phone, address, birth_date, gender
FROM users
WHERE email = 'supernerdconectado@gmail.com';

-- Verificar se você pode atualizar
UPDATE users
SET phone = 'TESTE'
WHERE email = 'supernerdconectado@gmail.com';

-- Verificar se atualizou
SELECT phone FROM users WHERE email = 'supernerdconectado@gmail.com';
```

Se o UPDATE funcionar no SQL mas não no app, o problema é no código JavaScript.
Se o UPDATE NÃO funcionar no SQL, o problema é RLS.

---

**FAÇA OS TESTES E ME ENVIE OS LOGS!** 🔍

