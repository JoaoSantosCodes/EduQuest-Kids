# 🧪 GUIA DE TESTES - PORTAL DOS PAIS

## 🎯 **OBJETIVO**
Validar todas as funcionalidades do Portal dos Pais e garantir que está funcionando corretamente.

---

## 🚀 **PREPARAÇÃO**

### **1. Criar Dados de Teste:**

```sql
-- 1. Verificar se existe um pai/mãe de teste
SELECT u.*, p.id as parent_id
FROM users u
LEFT JOIN parents p ON p.user_id = u.id
WHERE u.role = 'parent'
LIMIT 1;

-- 2. Se não existir, criar um pai/mãe de teste
-- (Use o sistema de registro ou crie manualmente)

-- 3. Verificar vínculos com filhos
SELECT 
  p.id as parent_id,
  u.name as parent_name,
  psr.relationship_type,
  s.id as student_id,
  su.name as student_name
FROM parents p
JOIN users u ON u.id = p.user_id
LEFT JOIN parent_student_relation psr ON psr.parent_id = p.id
LEFT JOIN students s ON s.id = psr.student_id
LEFT JOIN users su ON su.id = s.user_id
WHERE u.email = '[EMAIL_DO_PAI]';

-- 4. Se não houver vínculo, criar um
INSERT INTO parent_student_relation (parent_id, student_id, relationship_type)
VALUES ('[PARENT_ID]', '[STUDENT_ID]', 'mother');
```

---

## ✅ **ROTEIRO DE TESTES**

### **TESTE 1: LOGIN E ACESSO** ⏱️ 5 min

1. **Abrir aplicação:**
   - Acesse: `http://localhost:5173`
   - ✅ Página de login aparece

2. **Fazer login como pai/mãe:**
   - Digite email e senha
   - Clique em "Entrar"
   - ✅ Redirecionado para `/parent`
   - ✅ Nome do pai/mãe aparece no header
   - ✅ Cor roxa/rosa no tema

3. **Verificar loading:**
   - Recarregue a página (F5)
   - ✅ Spinner de loading aparece
   - ✅ Mensagem "Carregando dados..." aparece

4. **Teste de erro:**
   - Abra DevTools (F12) → Application → Local Storage
   - Delete o token
   - Recarregue a página
   - ✅ Redirecionado para login

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 2: DASHBOARD** ⏱️ 10 min

1. **Verificar estatísticas:**
   - ✅ Card "Meus Filhos" mostra número correto
   - ✅ Card "Média Geral" mostra média calculada
   - ✅ Card "Frequência" mostra percentual
   - ✅ Card "Atividades Pendentes" mostra total

2. **Verificar cards dos filhos:**
   - ✅ Todos os filhos aparecem
   - ✅ Avatar ou inicial aparece
   - ✅ Nome e turma corretos
   - ✅ Média geral calculada
   - ✅ Frequência % correta
   - ✅ Atividades pendentes (se houver)

3. **Clicar em um filho:**
   - Clique em um card de filho
   - ✅ Navega para aba "Meus Filhos"
   - ✅ Filho é selecionado

4. **Verificar avisos recentes:**
   - ✅ Seção "Avisos Recentes" aparece (se houver avisos)
   - ✅ Até 5 avisos aparecem
   - ✅ Cores por prioridade corretas
   - ✅ Turma e data aparecem

5. **Verificar próximos eventos:**
   - ✅ Seção "Próximos Eventos" aparece (se houver eventos)
   - ✅ Até 5 eventos aparecem
   - ✅ Data, hora e local aparecem

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 3: MEUS FILHOS** ⏱️ 10 min

1. **Navegar para "Meus Filhos":**
   - Clique na aba "Meus Filhos"
   - ✅ Lista de filhos aparece

2. **Testar busca:**
   - Digite nome de um filho
   - ✅ Filtra corretamente
   - Digite matrícula
   - ✅ Filtra corretamente
   - Limpe o campo
   - ✅ Todos os filhos voltam

3. **Verificar cards:**
   - ✅ Avatar ou inicial aparece
   - ✅ Nome e matrícula corretos
   - ✅ Turma (série, nome, turno, ano) correta
   - ✅ Média geral calculada
   - ✅ Frequência % correta
   - ✅ Atividades pendentes (se houver)
   - ✅ Tipo de vínculo aparece (Pai/Mãe/Responsável)

4. **Abrir perfil completo:**
   - Clique em um filho
   - ✅ Modal abre
   - ✅ Header com avatar e nome
   - ✅ Informações da turma aparecem
   - ✅ Informações pessoais aparecem
   - ✅ Estatísticas acadêmicas aparecem
   - ✅ Botão "Fechar" funciona
   - ✅ Botão "X" funciona

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 4: NOTAS** ⏱️ 15 min

1. **Navegar para "Notas":**
   - Clique na aba "Notas"
   - ✅ Página de notas aparece

2. **Selecionar filho:**
   - ✅ Dropdown de filhos aparece
   - Selecione um filho
   - ✅ Filho é selecionado
   - ✅ Notas carregam

3. **Testar filtro por período:**
   - Clique em "1º Bimestre"
   - ✅ Filtra notas do 1º bimestre
   - Clique em "Todos"
   - ✅ Mostra todas as notas

4. **Verificar cards de média por matéria:**
   - ✅ Cards aparecem para cada matéria
   - ✅ Ícone/cor da matéria aparece
   - ✅ Média calculada corretamente
   - ✅ Total de avaliações correto
   - ✅ Cor da média correta (verde≥7, amarelo≥5, vermelho<5)

5. **Verificar tabela detalhada:**
   - ✅ Tabelas por matéria aparecem
   - ✅ Nome da avaliação aparece
   - ✅ Tipo de avaliação aparece
   - ✅ Período aparece
   - ✅ Nota aparece com cor correta
   - ✅ Data aparece
   - ✅ Nome do professor aparece

6. **Teste sem notas:**
   - Selecione um filho sem notas
   - ✅ Mensagem "Nenhuma nota encontrada" aparece

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 5: FREQUÊNCIA** ⏱️ 15 min

1. **Navegar para "Frequência":**
   - Clique na aba "Frequência"
   - ✅ Página de frequência aparece

2. **Selecionar filho:**
   - Selecione um filho
   - ✅ Frequência carrega

3. **Testar filtro de mês/ano:**
   - Altere o mês
   - ✅ Frequência atualiza
   - Altere o ano
   - ✅ Frequência atualiza

4. **Verificar estatísticas:**
   - ✅ Total de registros correto
   - ✅ Presenças corretas
   - ✅ Faltas corretas
   - ✅ Atrasos corretos
   - ✅ Justificadas corretas

5. **Verificar percentual:**
   - ✅ Barra de progresso aparece
   - ✅ Percentual calculado corretamente
   - ✅ Cor correta (verde≥90%, amarelo≥75%, vermelho<75%)
   - ✅ Label correta (Excelente/Atenção/Crítico)

6. **Verificar lista de registros:**
   - ✅ Registros aparecem ordenados por data
   - ✅ Ícone correto por status
   - ✅ Data formatada corretamente
   - ✅ Status correto
   - ✅ Observações aparecem (se houver)

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 6: ATIVIDADES** ⏱️ 15 min

1. **Navegar para "Atividades":**
   - Clique na aba "Atividades"
   - ✅ Página de atividades aparece

2. **Selecionar filho:**
   - Selecione um filho
   - ✅ Atividades carregam

3. **Verificar estatísticas:**
   - ✅ Total correto
   - ✅ Pendentes correto
   - ✅ Entregues correto
   - ✅ Avaliadas correto
   - ✅ Atrasadas correto

4. **Testar filtros:**
   - Clique em "Pendentes"
   - ✅ Mostra apenas pendentes
   - Clique em "Entregues"
   - ✅ Mostra apenas entregues
   - Clique em "Avaliadas"
   - ✅ Mostra apenas avaliadas
   - Clique em "Todas"
   - ✅ Mostra todas

5. **Verificar cards de atividades:**
   - ✅ Título aparece
   - ✅ Descrição aparece
   - ✅ Matéria aparece
   - ✅ Tipo aparece
   - ✅ Status correto com cor
   - ✅ Data de entrega aparece
   - ✅ Data de submissão aparece (se entregue)
   - ✅ Professor aparece

6. **Verificar atividades avaliadas:**
   - ✅ Nota aparece
   - ✅ Nota máxima aparece
   - ✅ Feedback do professor aparece
   - ✅ Área destacada em verde

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 7: AVISOS** ⏱️ 10 min

1. **Navegar para "Avisos":**
   - Clique na aba "Avisos"
   - ✅ Página de avisos aparece

2. **Verificar lista:**
   - ✅ Avisos aparecem
   - ✅ Ordenados por data (mais recente primeiro)

3. **Testar filtro por prioridade:**
   - Clique em "Urgente"
   - ✅ Mostra apenas urgentes
   - Clique em "Alta"
   - ✅ Mostra apenas alta prioridade
   - Clique em "Todos"
   - ✅ Mostra todos

4. **Verificar cores:**
   - ✅ Urgente = vermelho
   - ✅ Alta = laranja
   - ✅ Normal = cinza
   - ✅ Baixa = azul

5. **Verificar informações:**
   - ✅ Título aparece
   - ✅ Conteúdo aparece
   - ✅ Turma aparece
   - ✅ Professor aparece (se houver)
   - ✅ Data de publicação aparece
   - ✅ Data de expiração aparece (se houver)

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 8: CALENDÁRIO** ⏱️ 15 min

1. **Navegar para "Calendário":**
   - Clique na aba "Calendário"
   - ✅ Página de calendário aparece

2. **Verificar visualização:**
   - ✅ Grade mensal aparece
   - ✅ Dias do mês corretos
   - ✅ Dia atual destacado (borda roxa)
   - ✅ Eventos aparecem nos dias corretos

3. **Testar navegação:**
   - Clique em "←" (anterior)
   - ✅ Vai para mês anterior
   - Clique em "→" (próximo)
   - ✅ Vai para próximo mês
   - Clique em "Ir para hoje"
   - ✅ Volta para mês atual

4. **Verificar eventos no calendário:**
   - ✅ Até 2 eventos aparecem por dia
   - ✅ "+X mais" aparece se houver mais de 2
   - ✅ Cores corretas por tipo

5. **Verificar lista de próximos eventos:**
   - ✅ Seção "Próximos Eventos" aparece
   - ✅ Até 10 eventos aparecem
   - ✅ Ordenados por data
   - ✅ Tipo de evento aparece
   - ✅ Data e hora aparecem
   - ✅ Local aparece (se houver)
   - ✅ Turma aparece

6. **Verificar tipos de eventos:**
   - ✅ Prova = vermelho
   - ✅ Reunião = azul
   - ✅ Feriado = verde
   - ✅ Atividade = amarelo
   - ✅ Outro = cinza

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 9: MENSAGENS** ⏱️ 5 min

1. **Navegar para "Mensagens":**
   - Clique na aba "Mensagens"
   - ✅ Página de mensagens aparece

2. **Verificar aviso:**
   - ✅ Banner amarelo aparece
   - ✅ Mensagem "em desenvolvimento" aparece

3. **Verificar UI:**
   - ✅ Lista de professores aparece
   - ✅ Área de mensagens aparece
   - ✅ Campo de texto desabilitado
   - ✅ Botão "Enviar" desabilitado

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 10: PERFIL** ⏱️ 10 min

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
   SELECT * FROM users WHERE email = '[EMAIL_DO_PAI]';
   ```
   - ✅ Dados atualizados

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 11: RESPONSIVIDADE** ⏱️ 10 min

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

**Status:** [ ] Passou [ ] Falhou

---

### **TESTE 12: PERFORMANCE** ⏱️ 5 min

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

**Status:** [ ] Passou [ ] Falhou

---

## 📊 **RESULTADO FINAL**

### **Checklist de Validação:**
- [ ] Todos os 12 testes passaram
- [ ] Bugs encontrados documentados
- [ ] Performance aceitável
- [ ] Responsividade OK
- [ ] Sem erros no console

### **Pontuação:**
- Total de testes: 12
- Testes passados: ___
- Taxa de sucesso: ___% 

### **Aprovação:**
- [ ] ✅ APROVADO (>95%)
- [ ] ⚠️ APROVADO COM RESSALVAS (85-95%)
- [ ] ❌ REPROVADO (<85%)

---

## 📝 **BUGS ENCONTRADOS**

| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
| 1 |           | Alta/Média/Baixa | Pendente/Corrigido |
| 2 |           | Alta/Média/Baixa | Pendente/Corrigido |
| 3 |           | Alta/Média/Baixa | Pendente/Corrigido |

---

## ✨ **MELHORIAS SUGERIDAS**

| # | Descrição | Prioridade | Status |
|---|-----------|------------|--------|
| 1 |           | Alta/Média/Baixa | Pendente/Implementado |
| 2 |           | Alta/Média/Baixa | Pendente/Implementado |
| 3 |           | Alta/Média/Baixa | Pendente/Implementado |

---

**Data do Teste:** ${new Date().toLocaleDateString('pt-BR')}  
**Testador:** _______________________  
**Assinatura:** _______________________

