# 📋 INSTRUÇÕES DE TESTE - PORTAL DO PROFESSOR

## 🎯 **OBJETIVO**
Validar todas as funcionalidades do Portal do Professor e garantir que tudo está funcionando corretamente.

---

## 🚀 **PREPARAÇÃO**

### **1. Iniciar o Projeto:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Verificar Supabase
# Acesse: https://supabase.com/dashboard
```

### **2. Credenciais de Teste:**
- **Email:** supernerdconectado@gmail.com
- **Senha:** (sua senha)
- **Role:** teacher

### **3. Verificar Dados no Banco:**
```bash
# Execute o script de validação SQL
psql -h [SEU_HOST] -U [SEU_USER] -d [SEU_DB] -f VALIDACAO_SQL_PROFESSOR.sql
```

---

## ✅ **ROTEIRO DE TESTES**

### **TESTE 1: LOGIN E ACESSO** ⏱️ 5 min

1. **Abrir aplicação:**
   - Acesse: `http://localhost:5173`
   - ✅ Página de login aparece

2. **Fazer login:**
   - Digite email e senha
   - Clique em "Entrar"
   - ✅ Redirecionado para `/teacher`
   - ✅ Nome do professor aparece no header

3. **Verificar loading:**
   - Recarregue a página (F5)
   - ✅ Spinner de loading aparece
   - ✅ Mensagem "Carregando dados do professor..." aparece

4. **Teste de erro:**
   - Abra DevTools (F12) → Application → Local Storage
   - Delete o token
   - Recarregue a página
   - ✅ Redirecionado para login

---

### **TESTE 2: DASHBOARD** ⏱️ 10 min

1. **Verificar estatísticas:**
   - ✅ Card "Minhas Turmas" mostra número correto
   - ✅ Card "Total de Alunos" mostra número correto
   - ✅ Card "Matérias" mostra número correto

2. **Testar ações rápidas:**
   - Clique em "Frequência"
   - ✅ Navega para aba de frequência
   - Volte para Dashboard
   - Clique em "Notas"
   - ✅ Navega para aba de notas
   - Repita para "Atividades" e "Avisos"

3. **Verificar preview de turmas:**
   - ✅ Até 6 turmas aparecem
   - ✅ Série aparece (ex: "6ª")
   - ✅ Nome da turma aparece
   - ✅ Turno aparece (Manhã/Tarde/Noite)
   - ✅ Ano letivo aparece
   - Clique em uma turma
   - ✅ Modal de detalhes abre

4. **Teste sem turmas:**
   ```sql
   -- Execute no Supabase SQL Editor:
   UPDATE classroom_teachers 
   SET is_active = false 
   WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid());
   ```
   - Recarregue a página
   - ✅ Mensagem "Você ainda não foi atribuído a nenhuma turma" aparece
   - ✅ Ícone de livro aparece
   - Desfaça a alteração:
   ```sql
   UPDATE classroom_teachers 
   SET is_active = true 
   WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid());
   ```

---

### **TESTE 3: MINHAS TURMAS** ⏱️ 10 min

1. **Navegar para "Minhas Turmas":**
   - Clique na aba "Minhas Turmas"
   - ✅ Lista de turmas aparece

2. **Testar busca:**
   - Digite "A" no campo de busca
   - ✅ Filtra turmas com "A" no nome
   - Limpe o campo
   - ✅ Todas as turmas voltam

3. **Verificar cards:**
   - ✅ Cada card mostra série, nome, turno, ano
   - ✅ Hover effect funciona
   - ✅ Cores dos badges estão corretas

4. **Abrir detalhes da turma:**
   - Clique em uma turma
   - ✅ Modal abre
   - ✅ Header mostra informações da turma
   - ✅ Lista de alunos aparece
   - ✅ Avatar dos alunos aparece (ou inicial)
   - ✅ Matrícula, email, telefone aparecem

5. **Testar busca de alunos:**
   - Digite nome de um aluno
   - ✅ Filtra alunos
   - Limpe o campo
   - ✅ Todos os alunos voltam

6. **Abrir perfil do aluno:**
   - Clique em um aluno
   - ✅ Modal de perfil abre
   - ✅ 4 abas aparecem
   - Navegue pelas abas
   - ✅ Dados aparecem corretamente
   - Feche o modal
   - ✅ Volta para lista de alunos

7. **Fechar modal:**
   - Clique no "X" ou "Voltar"
   - ✅ Modal fecha

---

### **TESTE 4: ALUNOS** ⏱️ 10 min

1. **Navegar para "Alunos":**
   - Clique na aba "Alunos"
   - ✅ Lista de todos os alunos aparece

2. **Verificar lista:**
   - ✅ Grid responsivo (3 colunas em desktop)
   - ✅ Não há alunos duplicados
   - ✅ Avatar aparece (ou inicial)
   - ✅ Nome, email, matrícula aparecem
   - ✅ Turma aparece

3. **Testar busca:**
   - Digite nome de um aluno
   - ✅ Filtra por nome
   - Digite email
   - ✅ Filtra por email
   - Digite matrícula
   - ✅ Filtra por matrícula

4. **Abrir perfil:**
   - Clique em um aluno
   - ✅ Modal abre com 4 abas

5. **Aba "Informações":**
   - ✅ Dados pessoais aparecem
   - ✅ Responsáveis aparecem
   - ✅ Observações aparecem

6. **Aba "Acadêmico":**
   - ✅ Média geral calculada
   - ✅ Frequência % correta
   - ✅ Total de avaliações correto
   - ✅ Notas recentes aparecem

7. **Aba "Frequência":**
   - ✅ Últimos 30 dias aparecem
   - ✅ Status correto (Presente/Falta/Atraso/Justificado)
   - ✅ Observações aparecem

8. **Aba "Observações":**
   - ✅ Lista de observações aparece
   - ✅ Tipo está correto
   - ✅ Data está correta

---

### **TESTE 5: FREQUÊNCIA** ⏱️ 15 min

1. **Navegar para "Frequência":**
   - Clique na aba "Frequência"
   - ✅ Página de frequência aparece

2. **Selecionar turma:**
   - ✅ Lista de turmas aparece
   - Clique em uma turma
   - ✅ Turma é selecionada
   - ✅ Lista de alunos aparece

3. **Verificar data:**
   - ✅ Data padrão é hoje
   - ✅ Não permite data futura
   - Clique em "Anterior"
   - ✅ Vai para ontem
   - Clique em "Próximo"
   - ✅ Volta para hoje
   - Clique em "Hoje"
   - ✅ Vai para hoje

4. **Verificar estatísticas:**
   - ✅ Total de presentes = 0 (inicialmente)
   - ✅ Total de faltas = 0
   - ✅ Total de atrasos = 0
   - ✅ Total de justificadas = 0

5. **Marcar presença individual:**
   - Marque "Presente" para 3 alunos
   - ✅ Contador de presentes atualiza
   - Marque "Falta" para 1 aluno
   - ✅ Contador de faltas atualiza
   - Marque "Atraso" para 1 aluno
   - ✅ Contador de atrasos atualiza

6. **Adicionar observação:**
   - Digite observação para um aluno
   - ✅ Texto aparece no campo

7. **Ações rápidas:**
   - Clique em "Marcar Todos Presentes"
   - ✅ Todos ficam como "Presente"
   - ✅ Contador atualiza
   - Clique em "Marcar Todos Ausentes"
   - ✅ Todos ficam como "Falta"
   - ✅ Contador atualiza

8. **Salvar frequência:**
   - Marque presença para alguns alunos
   - Clique em "Salvar Frequência"
   - ✅ Toast de sucesso aparece
   - Recarregue a página (F5)
   - Selecione a mesma turma e data
   - ✅ Frequência salva aparece

9. **Verificar no banco:**
   ```sql
   SELECT * FROM attendance 
   WHERE date = CURRENT_DATE 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   - ✅ Registros aparecem

---

### **TESTE 6: NOTAS** ⏱️ 15 min

1. **Navegar para "Notas":**
   - Clique na aba "Notas"
   - ✅ Página de notas aparece

2. **Selecionar turma e matéria:**
   - ✅ Lista de turmas aparece
   - Selecione uma turma
   - ✅ Lista de matérias aparece
   - Selecione uma matéria
   - ✅ Lista de alunos aparece

3. **Verificar lista de alunos:**
   - ✅ Todos os alunos aparecem
   - ✅ Média calculada (ou "Sem notas")
   - ✅ Total de notas correto
   - ✅ Cor da média correta (verde≥7, amarelo≥5, vermelho<5)

4. **Adicionar nota:**
   - Clique em "Adicionar Nota" para um aluno
   - ✅ Modal abre
   - Preencha os campos:
     - Tipo: Prova
     - Período: 1º Bimestre
     - Nota: 8.5
     - Nota Máxima: 10
     - Data: Hoje
   - Clique em "Salvar"
   - ✅ Toast de sucesso aparece
   - ✅ Nota aparece na lista
   - ✅ Média atualiza

5. **Testar validações:**
   - Clique em "Adicionar Nota"
   - Tente salvar sem preencher
   - ✅ Mensagem de erro aparece
   - Digite nota maior que máxima
   - ✅ Validação impede

6. **Editar nota:**
   - Clique em "Editar" em uma nota
   - ✅ Modal abre com dados
   - Altere a nota
   - Clique em "Atualizar"
   - ✅ Toast de sucesso aparece
   - ✅ Nota atualizada aparece

7. **Excluir nota:**
   - Clique em "Excluir" em uma nota
   - ✅ Confirmação aparece
   - Clique em "Confirmar"
   - ✅ Toast de sucesso aparece
   - ✅ Nota removida da lista

8. **Verificar notas recentes:**
   - ✅ Seção "Notas Recentes" aparece
   - ✅ Últimas 10 notas aparecem
   - ✅ Ordenação por data está correta

9. **Verificar no banco:**
   ```sql
   SELECT * FROM grades 
   ORDER BY evaluation_date DESC 
   LIMIT 10;
   ```
   - ✅ Registros aparecem

---

### **TESTE 7: AVISOS** ⏱️ 10 min

1. **Navegar para "Avisos":**
   - Clique na aba "Avisos"
   - ✅ Página de avisos aparece

2. **Criar aviso:**
   - Clique em "Novo Aviso"
   - ✅ Modal abre
   - Preencha:
     - Título: "Teste de Aviso"
     - Conteúdo: "Conteúdo do aviso"
     - Turma: Selecione uma
     - Prioridade: Alta
     - Data de Expiração: Amanhã
     - ✅ Publicar: Marcado
   - Clique em "Criar Aviso"
   - ✅ Toast de sucesso aparece
   - ✅ Aviso aparece na lista

3. **Verificar cores:**
   - ✅ Urgente = vermelho
   - ✅ Alta = laranja
   - ✅ Normal = cinza
   - ✅ Baixa = azul

4. **Criar rascunho:**
   - Clique em "Novo Aviso"
   - Preencha os campos
   - ❌ Desmarque "Publicar"
   - Clique em "Criar Aviso"
   - ✅ Badge "Rascunho" aparece

5. **Editar aviso:**
   - Clique em "Editar"
   - ✅ Modal abre com dados
   - Altere o título
   - Clique em "Atualizar"
   - ✅ Toast de sucesso aparece
   - ✅ Título atualizado aparece

6. **Excluir aviso:**
   - Clique em "Excluir"
   - ✅ Confirmação aparece
   - Clique em "Confirmar"
   - ✅ Toast de sucesso aparece
   - ✅ Aviso removido

---

### **TESTE 8: MATERIAIS** ⏱️ 15 min

1. **Navegar para "Materiais":**
   - Clique na aba "Materiais"
   - ✅ Página de materiais aparece

2. **Upload de arquivo:**
   - Clique em "Adicionar Material"
   - ✅ Modal abre
   - Clique em "Escolher arquivo"
   - Selecione um PDF
   - ✅ Nome do arquivo aparece
   - ✅ Tipo detectado automaticamente
   - Preencha:
     - Título: "Apostila Teste"
     - Descrição: "Material de teste"
     - Turma: Selecione uma
     - Matéria: Selecione uma
     - ✅ Público: Marcado
   - Clique em "Salvar"
   - ✅ Toast de sucesso aparece
   - ✅ Material aparece na lista

3. **Adicionar link:**
   - Clique em "Adicionar Material"
   - Cole um link do YouTube
   - ✅ Tipo muda para "video"
   - Preencha os campos
   - Clique em "Salvar"
   - ✅ Material aparece

4. **Verificar ícones:**
   - ✅ PDF = vermelho
   - ✅ Vídeo = roxo
   - ✅ Link = azul
   - ✅ Imagem = verde

5. **Download:**
   - Clique em "Download" em um material
   - ✅ Arquivo abre/baixa
   - ✅ Contador incrementa

6. **Excluir:**
   - Clique em "Excluir"
   - ✅ Confirmação aparece
   - Clique em "Confirmar"
   - ✅ Toast de sucesso aparece
   - ✅ Material removido

7. **Verificar storage:**
   - Acesse Supabase Dashboard → Storage → materials
   - ✅ Arquivos aparecem

---

### **TESTE 9: ATIVIDADES** ⏱️ 20 min

1. **Navegar para "Atividades":**
   - Clique na aba "Atividades"
   - ✅ Página de atividades aparece

2. **Criar atividade:**
   - Clique em "Nova Atividade"
   - ✅ Modal abre
   - Preencha:
     - Título: "Atividade Teste"
     - Descrição: "Descrição da atividade"
     - Tipo: Tarefa
     - Turma: Selecione uma
     - Matéria: Selecione uma
     - Data de Entrega: Amanhã
     - Nota Máxima: 10
     - ✅ Publicar: Marcado
   - Clique em "Criar"
   - ✅ Toast de sucesso aparece
   - ✅ Atividade aparece na lista

3. **Verificar status:**
   - ✅ Ativa = verde
   - ✅ Vencida = vermelho
   - ✅ Rascunho = cinza

4. **Criar submissão (como aluno):**
   ```sql
   -- Execute no Supabase:
   INSERT INTO assignment_submissions (
     assignment_id,
     student_id,
     submission_text,
     status
   ) VALUES (
     '[ID_DA_ATIVIDADE]',
     '[ID_DO_ALUNO]',
     'Minha resposta da atividade',
     'pending'
   );
   ```

5. **Ver submissões:**
   - Clique em "Ver Submissões"
   - ✅ Modal abre
   - ✅ Lista de submissões aparece
   - ✅ Status correto
   - ✅ Data de submissão aparece

6. **Avaliar submissão:**
   - Digite nota: 8.5
   - Digite feedback: "Bom trabalho!"
   - Clique em "Avaliar"
   - ✅ Toast de sucesso aparece
   - ✅ Status muda para "Avaliado"
   - ✅ Nota aparece

7. **Editar atividade:**
   - Clique em "Editar"
   - ✅ Modal abre com dados
   - Altere o título
   - Clique em "Atualizar"
   - ✅ Toast de sucesso aparece

8. **Excluir atividade:**
   - Clique em "Excluir"
   - ✅ Confirmação aparece
   - Clique em "Confirmar"
   - ✅ Toast de sucesso aparece
   - ✅ Atividade removida

---

### **TESTE 10: CALENDÁRIO** ⏱️ 15 min

1. **Navegar para "Calendário":**
   - Clique na aba "Calendário"
   - ✅ Página de calendário aparece

2. **Verificar visualização:**
   - ✅ Grid mensal aparece
   - ✅ Dias do mês corretos
   - ✅ Dia atual destacado
   - ✅ Eventos aparecem nos dias

3. **Navegação:**
   - Clique em "Anterior"
   - ✅ Vai para mês anterior
   - Clique em "Próximo"
   - ✅ Vai para próximo mês
   - Clique em "Hoje"
   - ✅ Volta para mês atual

4. **Criar evento:**
   - Clique em um dia
   - ✅ Modal abre
   - ✅ Data pré-preenchida
   - Preencha:
     - Título: "Reunião de Pais"
     - Tipo: Reunião
     - Data Início: Hoje
     - Data Fim: Hoje
     - Horário Início: 14:00
     - Horário Fim: 16:00
     - Local: "Sala 101"
     - Turma: Selecione uma
     - Cor: Azul
   - Clique em "Criar"
   - ✅ Toast de sucesso aparece
   - ✅ Evento aparece no calendário

5. **Evento dia inteiro:**
   - Crie um evento
   - ✅ Marque "Dia inteiro"
   - ✅ Campos de horário desabilitam
   - Salve
   - ✅ Evento aparece sem horário

6. **Editar evento:**
   - Clique em um evento
   - ✅ Modal abre com dados
   - Altere o título
   - Clique em "Atualizar"
   - ✅ Toast de sucesso aparece

7. **Excluir evento:**
   - Clique em "Excluir"
   - ✅ Confirmação aparece
   - Clique em "Confirmar"
   - ✅ Toast de sucesso aparece
   - ✅ Evento removido

8. **Próximos eventos:**
   - ✅ Seção "Próximos Eventos" aparece
   - ✅ Eventos futuros listados
   - ✅ Ordenação por data correta

---

### **TESTE 11: PERFIL** ⏱️ 10 min

1. **Abrir perfil:**
   - Clique em "Perfil" no header
   - ✅ Modal abre
   - ✅ Dados atuais aparecem

2. **Editar dados:**
   - Altere nome
   - Altere telefone
   - Altere data de nascimento
   - Selecione gênero
   - Altere endereço
   - ✅ Todos os campos funcionam

3. **Upload de avatar:**
   - Clique em "Escolher arquivo"
   - Selecione uma imagem
   - ✅ Preview aparece
   - Clique em "Salvar"
   - ✅ Toast de sucesso aparece
   - ✅ Avatar atualiza no header

4. **Verificar no banco:**
   ```sql
   SELECT * FROM users WHERE email = 'supernerdconectado@gmail.com';
   ```
   - ✅ Dados atualizados

---

### **TESTE 12: RESPONSIVIDADE** ⏱️ 10 min

1. **Desktop (>1024px):**
   - Abra em tela cheia
   - ✅ Layout em 3 colunas
   - ✅ Navegação horizontal
   - ✅ Modais centralizados

2. **Tablet (768px-1024px):**
   - Redimensione para ~800px
   - ✅ Layout em 2 colunas
   - ✅ Navegação com scroll
   - ✅ Modais ajustados

3. **Mobile (<768px):**
   - Redimensione para ~375px
   - ✅ Layout em 1 coluna
   - ✅ Navegação com scroll
   - ✅ Modais fullscreen
   - ✅ Botões acessíveis
   - ✅ Texto legível

4. **Teste em dispositivo real:**
   - Acesse pelo celular
   - ✅ Tudo funciona
   - ✅ Touch funciona
   - ✅ Scroll suave

---

### **TESTE 13: PERFORMANCE** ⏱️ 5 min

1. **Lighthouse:**
   - Abra DevTools → Lighthouse
   - Execute audit
   - ✅ Performance > 80
   - ✅ Accessibility > 90
   - ✅ Best Practices > 80

2. **Network:**
   - Abra DevTools → Network
   - Recarregue a página
   - ✅ Carrega em <3 segundos
   - ✅ Sem requisições desnecessárias

3. **Console:**
   - Abra DevTools → Console
   - ✅ Sem erros
   - ✅ Sem warnings críticos

---

## 📊 **RESULTADO FINAL**

### **Checklist de Validação:**
- [ ] Todos os testes passaram
- [ ] Bugs encontrados documentados
- [ ] Performance aceitável
- [ ] Responsividade OK
- [ ] Sem erros no console

### **Aprovação:**
- [ ] ✅ APROVADO
- [ ] ⚠️ APROVADO COM RESSALVAS
- [ ] ❌ REPROVADO

---

**Testado por:** _______________________  
**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Assinatura:** _______________________

