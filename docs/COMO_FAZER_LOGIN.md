# 🔐 COMO FAZER LOGIN - Sistema de Teste ATIVO!

## ✅ PROBLEMA RESOLVIDO!

Implementei um **sistema de autenticação MOCK** para você testar o app sem precisar configurar o Supabase agora!

---

## 👤 USUÁRIOS DE TESTE DISPONÍVEIS

Use qualquer um destes usuários para fazer login:

### **1. Aluno (Student)**
```
Email: aluno@teste.com
Senha: 123456
```
- Acessa: Portal do Aluno
- Funcionalidades: Quiz, conquistas, ranking, plano de estudos

### **2. Professor (Teacher)**
```
Email: professor@teste.com
Senha: 123456
```
- Acessa: Portal do Professor
- Funcionalidades: Criar questões, quizzes, gerenciar turmas

### **3. Pai/Mãe (Parent)**
```
Email: pai@teste.com
Senha: 123456
```
- Acessa: Portal dos Pais
- Funcionalidades: Relatórios, gráficos, vincular filhos

### **4. Coordenador (Coordinator)**
```
Email: coordenador@teste.com
Senha: 123456
```
- Acessa: Portal do Coordenador
- Funcionalidades: Gestão de turmas e professores

---

## 🚀 COMO FAZER LOGIN

### **Passo 1: Acesse a Página de Login**
```
http://localhost:3000/login
```

### **Passo 2: Digite as Credenciais**
Exemplo para testar como aluno:
- **Email:** `aluno@teste.com`
- **Senha:** `123456`

### **Passo 3: Clique em "Entrar"**
Você será redirecionado automaticamente para o portal correto!

---

## 📱 O QUE VOCÊ VAI VER

### **Se logar como Aluno:**
- Dashboard com estatísticas
- Opção de fazer quiz por matéria
- Sistema de pontos e níveis
- Conquistas desbloqueadas
- Ranking
- Plano de estudos

### **Se logar como Professor:**
- Dashboard com estatísticas
- Biblioteca de questões
- Criar novas questões
- Criar quizzes
- Gerenciar turmas
- Ver alunos

### **Se logar como Pai/Mãe:**
- Dashboard com métricas dos filhos
- Relatórios detalhados por matéria
- Gráficos de desempenho
- Controle parental
- Mensagens com professores

### **Se logar como Coordenador:**
- Dashboard geral
- Gestão de todas as turmas
- Atribuir professores a turmas
- Relatórios consolidados

---

## 🧪 SISTEMA DE TESTE ATIVO

### **O que é?**
É um sistema de autenticação **simulado** que funciona sem precisar de Supabase ou backend.

### **Como funciona?**
- Usuários pré-cadastrados em memória
- Dados salvos no localStorage do navegador
- Simula latência de rede (500ms)
- Funciona exatamente como o sistema real

### **Limitações:**
- ⚠️ Dados não persistem entre diferentes navegadores
- ⚠️ Ao limpar cache do navegador, perde os dados
- ⚠️ Não tem integração com banco de dados real
- ⚠️ Algumas funcionalidades dependem do Supabase

### **Vantagens:**
- ✅ Testa o app imediatamente
- ✅ Não precisa configurar nada
- ✅ Vê todos os portais funcionando
- ✅ Explora a interface completa

---

## 🔄 TESTAR REGISTRO

Você também pode criar novos usuários!

### **Passo 1: Acesse**
```
http://localhost:3000/register
```

### **Passo 2: Preencha o Formulário**
- Nome completo
- Email (qualquer email válido)
- Senha (mínimo 6 caracteres)
- Selecione o tipo de usuário (role)

### **Passo 3: Clique em "Criar Conta"**
O usuário será criado e você será logado automaticamente!

---

## 🚪 LOGOUT

Para sair da conta:
1. Clique no botão de logout (geralmente no canto superior direito)
2. Você voltará para a página inicial

---

## ⚠️ AVISOS NO CONSOLE

Você vai ver alguns avisos no console do navegador, como:

```
🧪 Usando autenticação MOCK para testes
⚠️ Variáveis do Supabase não configuradas
```

**Isso é normal!** Significa que o sistema está usando o mock para testes.

---

## 🔧 QUANDO USAR O SUPABASE REAL?

O sistema MOCK é perfeito para:
- ✅ Testar a interface
- ✅ Explorar funcionalidades
- ✅ Ver como cada portal funciona
- ✅ Desenvolvimento e testes locais

**Mas para produção você precisa:**
- ❌ Configurar Supabase (arquivo .env)
- ❌ Executar o schema SQL
- ❌ Ter dados persistentes no banco

**Guia para produção:** `ENV_EXEMPLO.md`

---

## 🎯 TESTE AGORA!

### **Quick Start:**

1. **Abra o navegador:** http://localhost:3000/login
2. **Digite:** 
   - Email: `aluno@teste.com`
   - Senha: `123456`
3. **Clique:** "Entrar"
4. **Explore:** O Portal do Aluno!

---

## 🐛 PROBLEMAS?

### **"Não consigo fazer login"**
- Verifique se digitou o email corretamente
- Senha é case-sensitive (123456)
- Tente com outro usuário da lista

### **"Página em branco depois do login"**
- Abra o console do navegador (F12)
- Veja se há erros
- Tente recarregar a página (F5)

### **"Servidor não está respondendo"**
- Verifique se o servidor está rodando (`npm run dev`)
- Acesse: http://localhost:3000
- Porta 3000 deve estar livre

---

## 📊 FLUXO COMPLETO DE TESTE

### **1. Login (2 minutos)**
```
1. Acesse http://localhost:3000/login
2. Digite: aluno@teste.com / 123456
3. Clique "Entrar"
```

### **2. Explorar Portal (10 minutos)**
```
1. Veja o dashboard
2. Navegue pelos menus
3. Teste as funcionalidades
4. Faça um quiz (se disponível)
```

### **3. Testar Outros Usuários (15 minutos)**
```
1. Logout
2. Login como professor@teste.com
3. Explore o Portal do Professor
4. Repita para outros roles
```

---

## ✅ CONCLUSÃO

**TUDO PRONTO PARA TESTAR!** 🎉

- ✅ Sistema de autenticação funcionando
- ✅ 4 usuários de teste disponíveis
- ✅ Todos os portais acessíveis
- ✅ Interface completa para explorar

**👉 Faça login agora:** http://localhost:3000/login

---

**Dúvidas?** Consulte:
- `RELATORIO_TESTES.md` - Testes completos
- `ENV_EXEMPLO.md` - Configurar Supabase para produção
- `CORRECOES_APLICADAS_TESTES.md` - Correções aplicadas

---

**Atualizado:** 04/11/2025  
**Status:** ✅ Sistema Mock Ativo

