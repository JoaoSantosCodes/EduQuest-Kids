# 🔧 Guia de Configuração do Supabase

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: EduQuest Kids (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte (guarde bem!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde alguns minutos enquanto o projeto é criado

### 2. Obter Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Você verá:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Uma string longa começando com `eyJ...`
3. Copie ambos os valores

### 3. Configurar Variáveis de Ambiente

No seu projeto, crie ou edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**⚠️ IMPORTANTE:** 
- Substitua `seu-projeto` pelo ID do seu projeto
- Substitua `sua_anon_key_aqui` pela anon key real
- Não commite o arquivo `.env` no Git!

### 4. Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `EduQuiz - Schema SQL Completo.txt`
4. Copie TODO o conteúdo SQL
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a execução completa (pode levar alguns segundos)

### 5. Verificar Conexão

1. No seu projeto React, execute:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000/test-supabase`
3. Clique em "Testar Novamente"
4. Se tudo estiver OK, você verá: ✅ "Conexão com Supabase estabelecida com sucesso!"

## 🐛 Troubleshooting

### Erro: "Variáveis do Supabase não configuradas"

**Solução:**
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento após criar/editar o `.env`

### Erro: "Invalid API key" ou "Invalid URL"

**Solução:**
- Verifique se copiou a URL completa (deve começar com `https://`)
- Verifique se copiou a anon key completa (é muito longa)
- Não há espaços extras antes ou depois dos valores

### Erro: "relation does not exist" no teste

**Solução:**
- Isso significa que o schema SQL ainda não foi executado
- Execute o schema SQL completo no SQL Editor
- Verifique se todas as tabelas foram criadas (vá em **Table Editor**)

### Erro: "Failed to fetch"

**Solução:**
- Verifique sua conexão com a internet
- Verifique se o projeto Supabase está ativo (não pausado)
- Verifique se a URL está correta (sem espaços, sem quebras de linha)

## ✅ Checklist de Configuração

- [ ] Projeto criado no Supabase
- [ ] URL e Anon Key copiadas
- [ ] Arquivo `.env` criado com as variáveis
- [ ] Schema SQL executado com sucesso
- [ ] Teste de conexão passou
- [ ] Servidor React reiniciado após criar `.env`

## 🔒 Segurança

### Boas Práticas:

1. **Nunca commite o `.env` no Git**
   - O arquivo `.gitignore` já está configurado para ignorar `.env`

2. **Use a Anon Key no frontend**
   - A anon key é segura para uso público
   - Ela tem RLS (Row Level Security) ativado

3. **Para produção:**
   - Use variáveis de ambiente na plataforma de deploy
   - Configure CORS no Supabase para apenas seu domínio

## 📚 Próximos Passos

Após validar a conexão:

1. **Testar Autenticação:**
   - Crie uma conta de teste em `/register`
   - Faça login em `/login`

2. **Criar Dados de Teste:**
   - Use o Portal do Professor para criar questões
   - Ou execute scripts SQL de seed

3. **Configurar RLS (Row Level Security):**
   - No Supabase, vá em **Authentication** → **Policies**
   - Configure políticas para cada tabela conforme necessário

## 🆘 Precisa de Ajuda?

- Documentação Supabase: https://supabase.com/docs
- Discord Supabase: https://discord.supabase.com
- Stack Overflow: Tag `supabase`

