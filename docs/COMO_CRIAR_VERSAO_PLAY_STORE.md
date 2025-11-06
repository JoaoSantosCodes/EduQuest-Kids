# 🚀 Como Criar e Publicar Versão no Google Play Console

## 📊 Status Atual

Você já completou:
- ✅ Selecionar países
- ✅ Selecionar testadores

**Próximo passo:** Criar uma nova versão

---

## 📝 Passo a Passo: Criar Nova Versão

### Passo 1: Clicar em "Criar uma nova versão"

1. Na tela do **Teste fechado - Alpha**
2. Clique em **"Criar uma nova versão >"** (ou no botão "Criar nova versão" no topo)
3. Você será direcionado para a página de criação de versão

---

### Passo 2: Fazer Upload do AAB

1. **Na seção "Dados do app"**, você verá:
   - Um campo para fazer upload do arquivo
   - Ou um botão "Upload" / "Carregar"

2. **Clique em "Fazer upload"** ou arraste o arquivo:
   - Arquivo a usar: `app-release.aab`
   - Localização: Na raiz do projeto ou em `android/app/build/outputs/bundle/release/`

3. **Aguarde o upload**:
   - O Google Play vai analisar o arquivo
   - Pode levar alguns minutos
   - Você verá a barra de progresso

---

### Passo 3: Preencher Notas de Versão

Após o upload, você verá um campo para **"Notas de versão"**:

**Exemplo de Notas de Versão:**
```
Versão 1.0 - Lançamento Inicial

🎮 EduQuest Kids - App Educacional Gamificado

Funcionalidades:
✅ Portal do Aluno - Quiz interativo e gamificação
✅ Portal dos Pais - Acompanhamento e relatórios  
✅ Portal do Professor - Gestão de conteúdo e avaliações
✅ Portal do Coordenador - Gestão de turmas

Recursos:
- Sistema completo de autenticação
- Interface moderna e responsiva
- Integração com Supabase
- Sistema de gamificação com pontuação e níveis
- Relatórios detalhados de desempenho

Melhorias:
- Primeira versão estável
- Otimizado para Android

Correções:
- Versão inicial sem bugs conhecidos
```

**Dica:** Seja claro e objetivo. Os testadores vão ver essas notas.

---

### Passo 4: Revisar Informações

Revise:
- ✅ Arquivo AAB carregado corretamente
- ✅ Notas de versão preenchidas
- ✅ Versão do app (1.0)
- ✅ Código de versão (1)

---

### Passo 5: Salvar e Revisar

1. Clique em **"Salvar"** ou **"Revisar versão"**
2. Você será direcionado para a tela de revisão

---

### Passo 6: Revisar e Confirmar

Na tela de revisão, verifique:

- ✅ **Dados do app**: Versão, código, notas
- ✅ **Países/Regiões**: Onde o app estará disponível
- ✅ **Testadores**: Lista de testadores configurada
- ✅ **Política de Privacidade**: URL configurado
- ✅ **Feedback**: URL ou e-mail configurado

Se tudo estiver correto:
1. Clique em **"Iniciar lançamento para teste"** ou **"Confirmar"**
2. Aguarde a confirmação

---

### Passo 7: Enviar para Revisão do Google

Após confirmar, você verá a opção:
- **"Enviar a versão ao Google para revisão"**

1. Clique nessa opção
2. Revise tudo novamente
3. Confirme o envio
4. Aguarde a revisão do Google (geralmente 1-3 dias)

---

## ⚠️ Problemas Comuns

### 1. Erro no Upload do AAB

**Causa:** Arquivo não assinado ou corrompido

**Solução:**
- Verifique se está usando `app-release.aab` (não o debug)
- Certifique-se de que o keystore foi configurado corretamente
- Tente gerar o AAB novamente: `npm run android:aab`

---

### 2. Erro de Assinatura

**Causa:** AAB não está assinado

**Solução:**
- Verifique se o `keystore.properties` está configurado
- Verifique se o `build.gradle` usa o keystore corretamente
- Regenere o AAB: `cd android && gradlew.bat bundleRelease`

---

### 3. Política de Privacidade não encontrada

**Causa:** URL da política não está acessível

**Solução:**
- Verifique se o GitHub Pages está habilitado
- Teste o URL no navegador antes de colar no Play Console
- URL deve ser: `https://joaosantoscodes.github.io/EduQuest-Kids/politica-de-privacidade.html`

---

## 📋 Checklist Antes de Criar Versão

Antes de clicar em "Criar nova versão", verifique:

- [ ] AAB de release gerado (`app-release.aab`)
- [ ] AAB está assinado corretamente
- [ ] Política de Privacidade hospedada e acessível
- [ ] URL da política configurado no Play Console
- [ ] Lista de testadores criada
- [ ] Países/regiões selecionados
- [ ] Feedback configurado (URL ou e-mail)
- [ ] Notas de versão preparadas
- [ ] App testado localmente

---

## 🎯 Após Publicar

Depois que o Google aprovar:

1. **Links de teste serão gerados**:
   - Link para Android
   - Link para Web

2. **Compartilhe os links** com os testadores

3. **Testadores podem**:
   - Clicar no link
   - Aceitar participar do teste
   - Instalar via Google Play

4. **Você receberá feedback**:
   - Via e-mail (se configurado)
   - Via página de feedback (se configurada)
   - Via Play Console → Avaliações

---

## 📱 Onde Está o AAB?

O arquivo `app-release.aab` está em:
```
android/app/build/outputs/bundle/release/app-release.aab
```

Ou na raiz do projeto (se você copiou):
```
app-release.aab
```

---

## 🚀 Próximos Passos

1. ✅ Criar nova versão
2. ✅ Fazer upload do AAB
3. ✅ Preencher notas de versão
4. ✅ Revisar e confirmar
5. ✅ Enviar para revisão do Google
6. ⏳ Aguardar aprovação (1-3 dias)
7. ⏳ Compartilhar links com testadores

---

**Boa sorte com o lançamento! 🎉**

