# 🧪 Guia: Configurar Teste Alpha no Google Play Console

## 📋 Passo a Passo para Configurar o Teste Alpha

### 1. **Selecionar Testadores**

#### Opção A: Listas de E-mails (Recomendado para começar)

**Passos:**
1. Selecione "Listas de e-mails"
2. Clique em "Criar lista de e-mails"
3. Adicione os e-mails dos testadores (um por linha)
4. Dê um nome à lista (ex: "Testadores EduQuest Kids")
5. Salve a lista

**E-mails de teste sugeridos:**
- Seu e-mail pessoal
- E-mails de colegas/amigos que podem testar
- E-mails de familiares com dispositivos Android

**Limite:** Até 20.000 testadores por lista

---

#### Opção B: Grupos do Google

**Quando usar:** Se você já tem um grupo do Google criado

**Passos:**
1. Selecione "Grupos do Google"
2. Insira o endereço do grupo
3. O grupo deve ter pelo menos 1 membro

---

### 2. **Endereço de E-mail ou URL de Feedback**

**O que colocar:**

#### Opção 1: E-mail (Mais Simples)
```
feedback@eduquestkids.com
```
ou
```
seu-email@gmail.com
```

#### Opção 2: URL de Feedback (Mais Profissional)
Se você tem um formulário de feedback online:
```
https://seu-site.com/feedback
```

Ou pode criar um formulário gratuito no:
- **Google Forms**: https://forms.google.com
- **Typeform**: https://typeform.com
- **JotForm**: https://jotform.com

**Exemplo de URL de Google Forms:**
```
https://docs.google.com/forms/d/e/SEU_FORM_ID/viewform
```

**Dica:** Use um e-mail que você verifica regularmente para receber feedback dos testadores.

---

### 3. **Salvar Configuração**

1. Preencha todos os campos obrigatórios
2. Clique em **"Salvar"**
3. Aguarde a confirmação

---

## 📱 Depois de Salvar

Após salvar, você verá:

1. **Links de Participação** (serão gerados automaticamente após publicar a versão):
   - **Link para Android**: Para testadores instalarem via Google Play
   - **Link para Web**: Para testadores instalarem via navegador

2. **Status do Teste**: Mostrará "Aguardando publicação" até você fazer upload do AAB

---

## 🚀 Próximos Passos

### 1. **Fazer Upload do AAB**

1. Vá em **"Produção"** ou **"Teste fechado - Alpha"**
2. Clique em **"Criar nova versão"**
3. Faça upload do arquivo `app-release.aab` (gerado anteriormente)
4. Preencha as **Notas de versão**:
   ```
   Versão 1.0 - Lançamento inicial
   - Primeira versão do EduQuest Kids
   - Sistema educacional gamificado
   - Portais para Alunos, Pais, Professores e Coordenadores
   ```

### 2. **Revisar e Publicar**

1. Revise todas as informações
2. Clique em **"Revisar versão"**
3. Clique em **"Iniciar lançamento para teste"**
4. Aguarde a publicação (pode levar alguns minutos)

### 3. **Compartilhar Links com Testadores**

Após a publicação:
1. Os links de participação estarão disponíveis
2. Copie os links e compartilhe com os testadores
3. Testadores podem:
   - Clicar no link
   - Aceitar participar do teste
   - Instalar o app via Google Play

---

## ✅ Checklist Antes de Publicar

Antes de fazer upload do AAB, verifique:

- [ ] Política de Privacidade hospedada e acessível
- [ ] URL da política de privacidade configurado no Play Console
- [ ] AAB de release gerado (`app-release.aab`)
- [ ] AAB assinado corretamente
- [ ] Lista de testadores criada
- [ ] E-mail/URL de feedback configurado
- [ ] Notas de versão preparadas
- [ ] Screenshots do app (se necessário)
- [ ] Ícone do app configurado

---

## 📝 Notas de Versão - Exemplo

```
Versão 1.0 - Lançamento Inicial

🎮 EduQuest Kids - App Educacional Gamificado

Funcionalidades:
✅ Portal do Aluno - Quiz interativo e gamificação
✅ Portal dos Pais - Acompanhamento e relatórios
✅ Portal do Professor - Gestão de conteúdo e avaliações
✅ Portal do Coordenador - Gestão de turmas

Melhorias:
- Sistema completo de autenticação
- Interface moderna e responsiva
- Integração com Supabase

Correções:
- Primeira versão estável
```

---

## 🔍 Monitoramento do Teste

Após publicar, você pode:

1. **Verificar Estatísticas**:
   - Número de instalações
   - Taxa de erro
   - Feedback dos testadores

2. **Receber Feedback**:
   - Via e-mail configurado
   - Via formulário online (se configurado)
   - Via Play Console → Avaliações e comentários

3. **Atualizar Versões**:
   - Faça correções baseadas no feedback
   - Gere novo AAB
   - Publique nova versão no teste

---

## ⚠️ Importante

- **Testadores podem avaliar o app** no Play Store
- **Feedback dos testadores é valioso** - use para melhorar
- **Teste Alpha é limitado** - até 20.000 testadores
- **Após testes, você pode** subir para Beta ou Produção

---

## 📞 Precisa de Ajuda?

Se tiver problemas:
1. Verifique se o AAB está assinado corretamente
2. Confirme que a política de privacidade está acessível
3. Verifique se todos os campos obrigatórios estão preenchidos
4. Consulte a documentação do Google Play Console

---

**Boa sorte com o lançamento! 🚀**

