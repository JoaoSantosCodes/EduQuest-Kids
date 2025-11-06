# 🧪 INSTRUÇÕES DE TESTE - CADASTRO COMPLETO DE ALUNO

## 🚀 SERVIDOR ESTÁ RODANDO

✅ **Servidor de desenvolvimento ativo em:** `http://localhost:3000`

---

## 📋 PASSO A PASSO PARA TESTAR

### 1️⃣ Acessar o Portal do Coordenador

1. Abra o navegador
2. Acesse: `http://localhost:3000`
3. Faça login com uma conta de **Coordenador**
   - Email: `jstudio.aurantis@gmail.com` (ou outro coordenador)
   - Senha: sua senha

---

### 2️⃣ Navegar até Gerenciar Alunos

1. No portal do coordenador, clique no botão **"🎓 Alunos"** na barra de navegação
2. Você verá a lista de todos os alunos cadastrados

---

### 3️⃣ Editar um Aluno

1. Localize qualquer aluno na lista
2. Clique no botão **"✏️ Editar"** (ícone de lápis) ao lado do nome do aluno
3. Um modal grande e completo será aberto

---

### 4️⃣ Verificar o Novo Formulário

Você verá **3 seções principais**:

#### 🎓 **Seção 1: Dados Pessoais do Aluno** (fundo branco)
- Nome Completo *
- Email (não editável)
- Telefone
- Data de Nascimento
- Gênero
- Endereço

#### 👨‍👩‍👧 **Seção 2: Dados do Responsável Legal** (fundo azul claro) ⭐ NOVO
- Nome do Responsável *
- Telefone do Responsável *
- CPF do Responsável
- Grau de Parentesco

#### 📚 **Seção 3: Dados Acadêmicos** (fundo branco) ⭐ NOVO
- Número de Matrícula
- Série/Ano
- Status da Matrícula
- Data de Ingresso
- Escola
- Observações Pedagógicas

---

### 5️⃣ Preencher os Dados do Responsável

**TESTE 1: Preencher Dados Completos**

1. **Nome do Responsável:** `Maria da Silva`
2. **Telefone do Responsável:** `(11) 98765-4321`
3. **CPF do Responsável:** `123.456.789-00`
4. **Grau de Parentesco:** Selecione `Mãe`

**TESTE 2: Preencher Dados Acadêmicos**

1. **Número de Matrícula:** `2025001234`
2. **Status da Matrícula:** Selecione `Ativo`
3. **Data de Ingresso:** `01/02/2025`
4. **Observações:** `Aluno dedicado e participativo`

---

### 6️⃣ Salvar as Alterações

1. Clique no botão **"💾 Salvar Alterações"** no rodapé do modal
2. Aguarde a confirmação

**✅ Resultado Esperado:**
- Toast verde: "Perfil do aluno atualizado com sucesso!"
- Modal fecha automaticamente após 1 segundo
- Lista de alunos é recarregada

---

### 7️⃣ Verificar os Dados Salvos

1. Clique novamente em **"✏️ Editar"** no mesmo aluno
2. Verifique que todos os dados foram salvos corretamente:
   - Nome do Responsável: `Maria da Silva`
   - Telefone do Responsável: `(11) 98765-4321`
   - CPF do Responsável: `123.456.789-00`
   - Grau de Parentesco: `Mãe`
   - Número de Matrícula: `2025001234`
   - Status: `Ativo`
   - Observações: `Aluno dedicado e participativo`

---

## 🧪 TESTES DE VALIDAÇÃO

### TESTE 1: Campo Obrigatório - Nome do Aluno

1. Abra o modal de edição
2. **Limpe o campo "Nome Completo"**
3. Clique em "Salvar Alterações"

**✅ Resultado Esperado:**
- Toast vermelho: "Nome é obrigatório"
- Modal permanece aberto

---

### TESTE 2: Campo Obrigatório - Nome do Responsável

1. Abra o modal de edição
2. **Limpe o campo "Nome do Responsável"**
3. Clique em "Salvar Alterações"

**✅ Resultado Esperado:**
- Toast vermelho: "Nome do responsável é obrigatório"
- Modal permanece aberto

---

### TESTE 3: Campo Obrigatório - Telefone do Responsável

1. Abra o modal de edição
2. **Limpe o campo "Telefone do Responsável"**
3. Clique em "Salvar Alterações"

**✅ Resultado Esperado:**
- Toast vermelho: "Telefone do responsável é obrigatório"
- Modal permanece aberto

---

### TESTE 4: Upload de Avatar

1. Abra o modal de edição
2. **Clique no avatar** (círculo com a inicial do nome)
3. Selecione uma imagem do seu computador (< 2MB)
4. Aguarde o upload

**✅ Resultado Esperado:**
- Preview da imagem aparece imediatamente
- Toast verde: "Foto carregada com sucesso!"
- Imagem é salva no Supabase Storage

---

### TESTE 5: Upload de Avatar Grande (> 2MB)

1. Abra o modal de edição
2. Clique no avatar
3. Tente selecionar uma imagem > 2MB

**✅ Resultado Esperado:**
- Toast vermelho: "A imagem deve ter no máximo 2MB."
- Upload não é realizado

---

### TESTE 6: Cancelar Edição

1. Abra o modal de edição
2. Altere alguns campos
3. **Clique em "Cancelar"**

**✅ Resultado Esperado:**
- Modal fecha imediatamente
- Alterações não são salvas
- Nenhum toast de erro

---

## 🎨 VERIFICAÇÕES VISUAIS

### ✅ Checklist de Design

- [ ] **Header laranja/amarelo** com gradiente
- [ ] **Seção do Responsável com fundo azul claro** (destaque visual)
- [ ] **Aviso amarelo** no final do formulário sobre campos obrigatórios
- [ ] **Campos obrigatórios marcados com asterisco (*)**
- [ ] **Avatar circular** com inicial do nome
- [ ] **Hover no avatar** mostra ícone de câmera
- [ ] **Botões com gradiente** (Salvar) e cinza (Cancelar)
- [ ] **Ícones bonitos** em cada seção (🎓, 👨‍👩‍👧, 📚)
- [ ] **Modal responsivo** (2 colunas em desktop, 1 coluna em mobile)
- [ ] **Scroll suave** quando o conteúdo é maior que a tela

---

## 📊 VERIFICAÇÃO NO BANCO DE DADOS

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em "Table Editor"
3. Selecione a tabela `students`
4. Localize o aluno que você editou
5. Verifique as colunas:
   - `guardian_name`
   - `guardian_phone`
   - `guardian_cpf`
   - `guardian_relationship`
   - `enrollment_number`
   - `enrollment_status`
   - `enrollment_date`
   - `observations`

**✅ Resultado Esperado:**
- Todos os campos devem estar preenchidos com os valores que você digitou

---

### Opção 2: Via SQL Editor

1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Execute a query:

```sql
SELECT 
  s.*,
  u.name, u.email
FROM students s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'email-do-aluno@teste.com';
```

**✅ Resultado Esperado:**
- Todos os campos do aluno são retornados
- Dados do responsável estão presentes
- Dados acadêmicos estão presentes

---

## 🎯 CENÁRIOS DE TESTE COMPLETOS

### Cenário 1: Novo Aluno (Primeiro Cadastro)

```
1. Criar um novo aluno (se possível)
2. Editar o aluno recém-criado
3. Preencher TODOS os campos:
   - Dados pessoais
   - Dados do responsável
   - Dados acadêmicos
4. Salvar
5. Reabrir e verificar que tudo foi salvo
```

---

### Cenário 2: Aluno Existente (Atualização)

```
1. Editar um aluno que já tem alguns dados
2. Adicionar os dados do responsável
3. Adicionar número de matrícula
4. Adicionar observações
5. Salvar
6. Reabrir e verificar que tudo foi salvo
```

---

### Cenário 3: Múltiplos Alunos

```
1. Editar 3 alunos diferentes
2. Preencher dados do responsável para cada um
3. Usar diferentes graus de parentesco:
   - Aluno 1: Mãe
   - Aluno 2: Pai
   - Aluno 3: Tutor
4. Salvar todos
5. Verificar que cada um tem seus dados corretos
```

---

### Cenário 4: Observações Pedagógicas

```
1. Editar um aluno
2. Adicionar observações detalhadas:
   "Aluno com dificuldade em matemática, mas excelente 
   em português. Recomenda-se acompanhamento individual 
   em cálculos. Muito participativo em sala."
3. Salvar
4. Reabrir e verificar que o texto foi salvo completo
```

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### Problema 1: Modal não abre
**Solução:** Limpe o cache do navegador (Ctrl + Shift + R)

### Problema 2: Dados não salvam
**Solução:** Verifique o console do navegador (F12) para erros

### Problema 3: Avatar não carrega
**Solução:** Verifique se o bucket `avatars` existe no Supabase Storage

### Problema 4: Toast não aparece
**Solução:** Verifique se o componente `Toaster` está no `App.jsx`

---

## 📸 SCREENSHOTS ESPERADOS

### 1. Modal Aberto
```
- Header laranja/amarelo
- Avatar no centro
- 3 seções visíveis
- Seção do responsável com fundo azul
- Aviso amarelo no final
- Botões Cancelar e Salvar
```

### 2. Campos Preenchidos
```
- Todos os campos com dados
- Campos obrigatórios marcados com *
- Dropdowns com opções selecionadas
```

### 3. Toast de Sucesso
```
- Toast verde no canto superior direito
- Mensagem: "Perfil do aluno atualizado com sucesso!"
```

### 4. Toast de Erro
```
- Toast vermelho no canto superior direito
- Mensagem: "Nome do responsável é obrigatório" (ou similar)
```

---

## ✅ CHECKLIST FINAL DE TESTE

- [ ] Modal abre corretamente
- [ ] Todos os campos estão visíveis
- [ ] Seção do responsável tem fundo azul
- [ ] Campos obrigatórios têm asterisco (*)
- [ ] Avatar pode ser clicado
- [ ] Upload de avatar funciona
- [ ] Validação de campos obrigatórios funciona
- [ ] Botão "Cancelar" fecha o modal
- [ ] Botão "Salvar" salva os dados
- [ ] Toast de sucesso aparece
- [ ] Modal fecha automaticamente após salvar
- [ ] Dados salvos aparecem ao reabrir o modal
- [ ] Dados estão no banco de dados
- [ ] Design está bonito e responsivo

---

## 🎉 CONCLUSÃO

Se todos os testes acima passarem, o **Cadastro Completo de Aluno** está funcionando perfeitamente! 🎊

**Próximo passo:** Testar com dados reais e começar a usar em produção! 🚀

---

**Data:** 05/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA TESTE

