# 🔍 DEBUG: Erro ao Salvar Perfil

## 🎯 Problema Identificado:
O modal de perfil abre corretamente, mas ao tentar salvar aparece erro "Erro ao salvar perfil".

## 🔧 Correções Aplicadas:

### 1. Removido `updated_at`
- **Problema:** Campo `updated_at` não existe na tabela `users`
- **Solução:** Removido do UPDATE

### 2. Adicionados Logs Detalhados
Agora o console mostra:
- 💾 Dados sendo salvos
- 🔐 ID da sessão atual
- 📊 Resposta do Supabase
- ❌ Detalhes completos do erro

### 3. Validações Adicionadas
- ✅ Verifica se `user.id` existe
- ✅ Verifica se nome não está vazio
- ✅ Converte campos vazios para `null`

### 4. Verificação de Sessão
- Adiciona log da sessão do Supabase Auth
- Compara `user.id` com `session.user.id`

---

## 🔍 Como Debugar Agora:

### 1. Abra o Console do Navegador (F12)
Vá para a aba **Console**

### 2. Abra o Modal de Perfil
Clique no botão "Perfil" no header

### 3. Tente Salvar
Clique em "Salvar Alterações"

### 4. Verifique os Logs:
Você verá algo como:

```
💾 Salvando perfil... { userId: "xxx-xxx-xxx", data: {...} }
🔐 Sessão atual: "xxx-xxx-xxx"
📊 Resposta do Supabase: { data: [...], error: null }
✅ Perfil atualizado com sucesso!
```

**OU** (se houver erro):

```
💾 Salvando perfil... { userId: "xxx-xxx-xxx", data: {...} }
🔐 Sessão atual: "xxx-xxx-xxx"
📊 Resposta do Supabase: { data: null, error: {...} }
❌ Erro detalhado: { message: "...", details: "...", hint: "..." }
❌ Erro ao salvar perfil: [mensagem do erro]
```

---

## 🎯 Possíveis Causas do Erro:

### 1. Problema de Autenticação
**Sintoma:** `session.user.id` diferente de `user.id`
**Solução:** 
```sql
-- Verificar se o user.id existe na tabela users
SELECT * FROM public.users WHERE id = 'SEU_USER_ID';
```

### 2. Problema de RLS
**Sintoma:** Erro "new row violates row-level security policy"
**Solução:** Já aplicada - políticas RLS permitem UPDATE

### 3. Campos Inválidos
**Sintoma:** Erro de tipo de dados
**Solução:** Campos vazios agora são convertidos para `null`

### 4. Coluna Não Existe
**Sintoma:** Erro "column does not exist"
**Solução:** Verificar se todas as colunas existem:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'address', 'birth_date', 'avatar_url');
```

---

## 🚀 Próximos Passos:

### Se o erro persistir:

1. **Copie a mensagem de erro completa do console**
2. **Verifique qual é o erro específico**
3. **Execute os comandos SQL de verificação**

### Comandos SQL para Debug:

```sql
-- 1. Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';

-- 3. Testar UPDATE manual (substitua o ID)
UPDATE public.users
SET name = 'Teste', phone = '119999999'
WHERE id = 'SEU_USER_ID';
```

---

## ✅ Teste Agora:

1. **Recarregue a página** (Ctrl + Shift + R)
2. **Abra o Console** (F12)
3. **Abra o modal de perfil**
4. **Tente salvar**
5. **Copie os logs do console e me envie**

Isso vai me ajudar a identificar exatamente qual é o problema! 🔍

---

**Data:** 04/11/2025  
**Status:** 🔧 AGUARDANDO LOGS DO CONSOLE

