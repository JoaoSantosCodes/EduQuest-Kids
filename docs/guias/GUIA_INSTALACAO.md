# 🚀 Guia de Instalação Rápida - EduQuest Kids

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Backend API rodando (ou configurar Supabase)

## ⚡ Instalação Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001/api
```

**Para Supabase:**
```env
VITE_API_URL=https://seu-projeto.supabase.co/api
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O app estará disponível em: `http://localhost:3000`

## 🔧 Configuração do Backend

### Opção 1: Backend Node.js Local

1. Configure o backend seguindo o guia em `EduQuiz - Rotas Finais + Guia de Instalação.txt`
2. Certifique-se de que o backend está rodando na porta 3001
3. Configure o CORS no backend para aceitar requisições de `http://localhost:3000`

### Opção 2: Supabase (Recomendado para início rápido)

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o schema SQL em `EduQuiz - Schema SQL Completo.txt`
4. Configure as variáveis de ambiente:
   ```env
   VITE_API_URL=https://seu-projeto.supabase.co/api
   ```

## 📱 Testando o App

### 1. Criar Conta de Aluno

1. Acesse `http://localhost:3000/register`
2. Selecione "Aluno"
3. Preencha os dados (nome, email, senha, série)
4. Clique em "Criar Conta"

### 2. Criar Conta de Pai/Responsável

1. Acesse `http://localhost:3000/register`
2. Selecione "Pais"
3. Preencha os dados
4. Após criar, vincule os filhos no portal

### 3. Criar Conta de Professor

1. Acesse `http://localhost:3000/register`
2. Selecione "Professor"
3. Preencha os dados
4. Após criar, comece a adicionar questões

## 🎯 Próximos Passos

1. **Configurar Banco de Dados:**
   - Execute o schema SQL completo
   - Configure as relações entre pais e filhos

2. **Adicionar Questões:**
   - Use o Portal do Professor
   - Ou importe questões em massa via CSV

3. **Personalizar:**
   - Adicione mais matérias
   - Configure conquistas
   - Ajuste as cores e temas

## 🐛 Troubleshooting

### Erro: "Cannot connect to API"

- Verifique se o backend está rodando
- Confira a URL no `.env`
- Verifique o CORS no backend

### Erro: "Token inválido"

- Faça logout e login novamente
- Verifique se o token está sendo salvo corretamente
- Confira as configurações de JWT no backend

### Erro: "Port 3000 already in use"

- Mude a porta no `vite.config.js`
- Ou mate o processo: `kill -9 $(lsof -ti:3000)`

## 📚 Documentação Adicional

- **Arquitetura:** `EduQuiz - Arquitetura Completa do Sistema.txt`
- **Backend:** `EduQuiz - Backend API Node.js + Express`
- **Schema SQL:** `EduQuiz - Schema SQL Completo.txt`

## 🎉 Pronto!

Agora você pode começar a usar o EduQuest Kids!

Para desenvolvimento nas plataformas mencionadas:

### Cursor AI / VS Code
- Abra o projeto na pasta
- Execute `npm install`
- Execute `npm run dev`

### Lovable / Base44
- Importe o projeto
- Configure as variáveis de ambiente
- Deploy automático!

### Replit
- Fork o projeto
- Configure as variáveis
- Deploy via Replit Deployments

