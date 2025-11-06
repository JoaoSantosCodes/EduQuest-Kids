# 🔧 Guia: Atualizar Trigger para Seleção de Role

## 🎯 Objetivo

Atualizar a trigger `handle_new_user` no Supabase para permitir que novos usuários façam login com Google sem role definido, permitindo seleção posterior.

## ⚠️ Problema Atual

A trigger `handle_new_user` está definindo `'student'` como role padrão quando um usuário faz login com Google pela primeira vez:

```sql
COALESCE(NEW.raw_user_meta_data->>'role', 'student')
```

Isso impede que o usuário selecione seu perfil após login com Google.

## ✅ Solução

Atualizar a trigger para usar `NULL` em vez de `'student'` como padrão, permitindo que o sistema mostre a tela de seleção de role.

## 📋 Passos para Atualizar

### **1. Acessar SQL Editor no Supabase**

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral

### **2. Executar Script SQL**

1. Abra o arquivo `docs/configuracao/ATUALIZAR_TRIGGER_ROLE_NULL.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`

### **3. Verificar Atualização**

Após executar o script, você verá:
- ✅ **function_name**: `handle_new_user`
- ✅ **trigger_name**: `on_auth_user_created`
- ✅ **enabled**: `t` (true)

## 🔍 Como Verificar Manualmente

### **Verificar Função:**
```sql
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### **Verificar Trigger:**
```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## 🧪 Como Testar

### **1. Fazer Logout**
- Se estiver logado, faça logout

### **2. Fazer Login com Google**
- Clique em "Continuar com Google"
- Complete o login com Google

### **3. Verificar Tela de Seleção**
- Você deve ver a tela de seleção de role
- Selecione um perfil (Estudante, Professor, Pai/Mãe ou Coordenador)

### **4. Verificar Redirecionamento**
- Você deve ser redirecionado para o portal correspondente

## 📝 Notas Importantes

### **Usuários Existentes**
- ✅ Usuários existentes **não serão afetados**
- ✅ O role existente será mantido
- ✅ A função usa `ON CONFLICT DO UPDATE` para não sobrescrever roles existentes

### **Primeiro Login com Google**
- ✅ Role será `NULL` inicialmente
- ✅ Sistema mostrará tela de seleção
- ✅ Após seleção, role será atualizado

### **Registro Correspondente**
- ✅ Após seleção de role, o registro correspondente será criado:
  - `student` → `students`
  - `teacher` → `teachers`
  - `parent` → `parents`
  - `coordinator` → `coordinators`

## 🐛 Troubleshooting

### **Tela de seleção não aparece:**
1. Verifique se a trigger foi atualizada corretamente
2. Verifique se o role está `NULL` na tabela `users`
3. Verifique logs do console para erros

### **Erro ao executar script:**
1. Verifique se você tem permissões de administrador no Supabase
2. Verifique se a função `handle_new_user` existe
3. Verifique logs do SQL Editor para detalhes do erro

### **Role ainda sendo definido como 'student':**
1. Verifique se a trigger foi atualizada corretamente
2. Execute o script SQL novamente
3. Verifique se há outras triggers que possam estar interferindo

## ✅ Checklist

- [ ] Script SQL executado no Supabase
- [ ] Função `handle_new_user` atualizada
- [ ] Trigger `on_auth_user_created` verificada
- [ ] Teste de login com Google realizado
- [ ] Tela de seleção de role aparecendo
- [ ] Redirecionamento funcionando corretamente

