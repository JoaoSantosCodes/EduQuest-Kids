# ✅ COORDENADOR: Editar Perfis de Usuários

## 🎯 FUNCIONALIDADE IMPLEMENTADA

O coordenador agora pode **editar o perfil de qualquer usuário** no sistema:
- ✅ Professores
- ✅ Alunos
- ✅ Pais/Mães

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### 1. **Novo Componente: `EditUserProfile.jsx`**
```
src/components/coordinator/EditUserProfile.jsx
```

Modal reutilizável para editar perfil de qualquer usuário com:
- Upload de foto (avatar)
- Edição de nome
- Edição de telefone
- Edição de endereço
- Edição de data de nascimento
- Badge visual do role (Coordenador, Professor, Aluno, Pai/Mãe)
- Validações
- Feedback visual

---

### 2. **Modificados: Componentes de Gerenciamento**

#### `ManageTeachers.jsx`
- ✅ Adicionado botão "Editar Perfil" (ícone Edit)
- ✅ Integrado modal `EditUserProfile`
- ✅ Recarrega lista após edição

#### `ManageStudents.jsx`
- ✅ Adicionado botão "Editar Perfil" (ícone Edit)
- ✅ Integrado modal `EditUserProfile`
- ✅ Recarrega lista após edição

#### `ManageParents.jsx`
- ✅ Adicionado botão "Editar Perfil" (ícone Edit)
- ✅ Integrado modal `EditUserProfile`
- ✅ Recarrega lista após edição

---

## 🔐 PERMISSÕES (RLS)

### Política Criada:
```sql
CREATE POLICY "Coordinators can update all users"
ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.coordinators
    WHERE coordinators.user_id = auth.uid()
  )
);
```

**O que permite:**
- Coordenadores podem atualizar qualquer registro na tabela `users`
- Professores, alunos e pais **NÃO** podem editar outros usuários
- Cada usuário ainda pode editar seu próprio perfil (política existente)

---

## 🎨 INTERFACE

### Botão "Editar Perfil"
- Ícone: 📝 (Edit)
- Cor: Azul
- Posição: Ao lado de cada usuário nas listas
- Tooltip: "Editar perfil"

### Modal de Edição
- **Header:** Gradiente roxo/rosa com título "Editar Perfil"
- **Avatar:** Circular, com overlay para upload ao passar o mouse
- **Badge de Role:** Cor diferente para cada tipo de usuário
  - Coordenador: Roxo/Rosa
  - Professor: Azul/Ciano
  - Pai/Mãe: Verde/Esmeralda
  - Aluno: Laranja/Amarelo
- **Campos:**
  - Nome Completo * (obrigatório)
  - Email (somente leitura)
  - Telefone
  - Data de Nascimento
  - Endereço
- **Botões:**
  - Cancelar (cinza)
  - Salvar Alterações (gradiente roxo/rosa)

---

## 🔄 FLUXO DE USO

### 1. Editar Professor
```
1. Coordenador vai para aba "Professores"
2. Clica no ícone 📝 ao lado do professor
3. Modal abre com dados do professor
4. Coordenador edita os campos desejados
5. Clica em "Salvar Alterações"
6. ✅ Toast: "Perfil atualizado com sucesso!"
7. Modal fecha
8. Lista recarrega com dados atualizados
```

### 2. Editar Aluno
```
1. Coordenador vai para aba "Alunos"
2. Clica no ícone 📝 ao lado do aluno
3. Modal abre com dados do aluno
4. Coordenador edita os campos desejados
5. Clica em "Salvar Alterações"
6. ✅ Toast: "Perfil atualizado com sucesso!"
7. Modal fecha
8. Lista recarrega com dados atualizados
```

### 3. Editar Pai/Mãe
```
1. Coordenador vai para aba "Pais"
2. Clica no ícone 📝 ao lado do pai/mãe
3. Modal abre com dados do pai/mãe
4. Coordenador edita os campos desejados
5. Clica em "Salvar Alterações"
6. ✅ Toast: "Perfil atualizado com sucesso!"
7. Modal fecha
8. Lista recarrega com dados atualizados
```

---

## 📸 UPLOAD DE FOTO

### Funcionalidades:
- ✅ Clique no avatar para selecionar foto
- ✅ Validação de tamanho (máximo 2MB)
- ✅ Preview instantâneo
- ✅ Upload para Supabase Storage (`avatars` bucket)
- ✅ URL pública gerada automaticamente
- ✅ Loading spinner durante upload
- ✅ Feedback de sucesso/erro

### Fluxo:
```
1. Usuário clica no avatar
2. Seletor de arquivo abre
3. Usuário escolhe imagem
4. Preview aparece instantaneamente
5. Upload inicia automaticamente
6. ✅ "Foto carregada com sucesso!"
7. URL salva no perfil
```

---

## ✅ VALIDAÇÕES

### Campos Obrigatórios:
- ✅ Nome Completo

### Campos Opcionais:
- Telefone
- Endereço
- Data de Nascimento
- Foto

### Validações de Upload:
- ✅ Tamanho máximo: 2MB
- ✅ Formato: Imagens (jpg, png, gif, etc.)

---

## 🎯 BENEFÍCIOS

1. **Centralização:** Coordenador gerencia todos os perfis em um só lugar
2. **Consistência:** Mesmo componente para todos os tipos de usuários
3. **Segurança:** RLS garante que apenas coordenadores podem editar
4. **UX:** Interface intuitiva com feedback claro
5. **Eficiência:** Edição rápida sem sair da lista

---

## 🧪 TESTE

### Passo 1: Editar Professor
1. Faça login como coordenador
2. Vá para aba "Professores"
3. Clique no ícone 📝 de um professor
4. Edite o nome
5. Clique em "Salvar Alterações"
6. ✅ Verifique que o nome foi atualizado na lista

### Passo 2: Upload de Foto
1. Abra o modal de edição
2. Clique no avatar
3. Selecione uma imagem
4. Aguarde o upload
5. ✅ Verifique que a foto aparece no preview
6. Clique em "Salvar Alterações"
7. ✅ Verifique que a foto aparece na lista

### Passo 3: Editar Aluno
1. Vá para aba "Alunos"
2. Clique no ícone 📝 de um aluno
3. Edite telefone e endereço
4. Clique em "Salvar Alterações"
5. ✅ Verifique que os dados foram atualizados

### Passo 4: Editar Pai/Mãe
1. Vá para aba "Pais"
2. Clique no ícone 📝 de um pai/mãe
3. Edite data de nascimento
4. Clique em "Salvar Alterações"
5. ✅ Verifique que os dados foram atualizados

---

## ✅ STATUS

- ✅ Componente `EditUserProfile` criado
- ✅ Integrado em `ManageTeachers`
- ✅ Integrado em `ManageStudents`
- ✅ Integrado em `ManageParents`
- ✅ RLS configurada
- ✅ Upload de foto implementado
- ✅ Validações implementadas
- ✅ Feedback visual implementado
- ⏳ **Aguardando teste do usuário**

---

**RECARREGUE A PÁGINA E TESTE!** 🚀

Pressione: **Ctrl + Shift + R**

Vá para qualquer aba (Professores, Alunos ou Pais) e clique no ícone 📝 para editar!

