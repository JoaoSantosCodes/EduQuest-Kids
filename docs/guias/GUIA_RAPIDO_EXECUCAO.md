# 🚀 Guia Rápido - Executar o Projeto

## ✅ Servidor Iniciado

O servidor de desenvolvimento foi iniciado! Você deve ver algo como:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 🌐 Acessar a Aplicação

1. **Abra seu navegador** e acesse:
   ```
   http://localhost:3000
   ```

2. **Você verá a página inicial** do EduQuest Kids com:
   - Botão "Entrar"
   - Botão "Criar Conta"
   - Link para testar conexão Supabase

## 🔧 Verificar Funcionamento

### 1. Testar Conexão Supabase
- Acesse: `http://localhost:3000/test-supabase`
- Clique em "Testar Conexão"
- Verifique se está configurado corretamente

### 2. Criar Conta de Teste
- Clique em "Criar Conta"
- Escolha o tipo (Aluno, Pais, Professor)
- Preencha os dados
- Após criar, você será redirecionado automaticamente

### 3. Fazer Login
- Clique em "Entrar"
- Use suas credenciais
- Será redirecionado para seu portal

## 📱 Portais Disponíveis

- **Aluno**: `/student` - Quiz interativo
- **Professor**: `/teacher` - Gerenciar questões e quizzes
- **Pais**: `/parent` - Acompanhar progresso dos filhos

## ⚠️ Importante

### Antes de Usar com Supabase:
1. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. Execute o schema SQL no Supabase (veja `GUIA_SUPABASE.md`)

### Se Não Tiver Supabase Configurado:
- O sistema funciona com fallback para API REST
- Você precisará configurar o backend Node.js separadamente

## 🐛 Problemas Comuns

### Porta 3000 já em uso:
```bash
# Pare o servidor (Ctrl+C) e rode:
npm run dev -- --port 3001
```

### Erro de compilação:
```bash
# Limpe o cache e reinstale:
rm -rf node_modules
npm install
npm run dev
```

### Página em branco:
- Verifique o console do navegador (F12)
- Verifique se há erros no terminal
- Verifique se o arquivo `.env` está configurado

## 📊 Status do Servidor

O servidor está rodando em: **http://localhost:3000**

Abra o navegador e comece a testar! 🎉

