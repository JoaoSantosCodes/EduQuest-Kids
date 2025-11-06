# 📋 Como Hospedar a Página de Feedback

A página de feedback (`feedback.html`) pode ser hospedada junto com a política de privacidade no mesmo repositório GitHub.

## ✅ Hospedagem no GitHub Pages

### Opção 1: No Mesmo Repositório (Recomendado)

Como você já tem o repositório `EduQuest-Kids` no GitHub:

1. **Fazer commit da página de feedback**
   ```bash
   git add feedback.html
   git commit -m "Adicionar página de feedback para testadores"
   git push
   ```

2. **Habilitar GitHub Pages**
   - Acesse: https://github.com/JoaoSantosCodes/EduQuest-Kids/settings/pages
   - Selecione branch: `main`
   - Selecione pasta: `/root`
   - Clique em "Save"

3. **URLs Disponíveis:**
   - Política de Privacidade: `https://joaosantoscodes.github.io/EduQuest-Kids/politica-de-privacidade.html`
   - Página de Feedback: `https://joaosantoscodes.github.io/EduQuest-Kids/feedback.html`

### Opção 2: Repositório Separado (Opcional)

Se preferir separar:

1. Crie um novo repositório: `eduquest-feedback`
2. Faça upload apenas do `feedback.html`
3. Habilite GitHub Pages
4. URL será: `https://seu-usuario.github.io/eduquest-feedback/`

---

## 🔧 Configuração no Google Play Console

### No Campo "Endereço de e-mail ou URL de feedback":

**Cole o URL da página de feedback:**
```
https://joaosantoscodes.github.io/EduQuest-Kids/feedback.html
```

Ou, se preferir um e-mail direto:
```
feedback@eduquestkids.com
```

---

## 📧 Como Funciona a Página de Feedback

A página de feedback funciona da seguinte forma:

1. **Testador preenche o formulário** na página web
2. **Ao clicar em "Enviar Feedback"**, abre o cliente de e-mail do dispositivo
3. **O e-mail é pré-preenchido** com todas as informações
4. **Testador envia o e-mail** para você

### Vantagens:
- ✅ Interface profissional e fácil de usar
- ✅ Formulário estruturado com campos específicos
- ✅ Avaliação por estrelas
- ✅ Coleta informações do dispositivo
- ✅ Funciona em qualquer dispositivo

### Requisitos:
- Testadores precisam ter um cliente de e-mail configurado
- O e-mail será enviado para o endereço configurado no código

---

## 🔄 Personalizar o E-mail de Recebimento

Para mudar o e-mail que recebe os feedbacks:

1. Abra o arquivo `feedback.html`
2. Procure por: `feedback@eduquestkids.com`
3. Substitua pelo seu e-mail:
   ```javascript
   const mailtoLink = `mailto:SEU-EMAIL@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
   ```
4. Faça commit e push novamente

---

## 🎨 Alternativa: Google Forms (Mais Simples)

Se preferir uma solução ainda mais simples:

1. **Criar formulário no Google Forms:**
   - Acesse: https://forms.google.com
   - Crie um novo formulário
   - Adicione campos: Nome, E-mail, Avaliação, Feedback
   - Configure para receber respostas por e-mail

2. **URL do formulário:**
   - Compartilhe → Copiar link
   - Use esse link no Play Console

**Vantagens do Google Forms:**
- ✅ Não precisa hospedar nada
- ✅ Respostas organizadas automaticamente
- ✅ Planilha Google com todas as respostas
- ✅ Gráficos e estatísticas automáticos

---

## 📝 Comparação

| Método | Facilidade | Profissionalismo | Organização |
|--------|-----------|-----------------|-------------|
| **Página HTML** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Google Forms** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **E-mail direto** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## ✅ Recomendação

**Para começar rápido:** Use Google Forms
**Para ter controle total:** Use a página HTML criada

Ambos funcionam perfeitamente! O Google Forms é mais fácil de configurar, mas a página HTML dá mais controle sobre o design e a experiência do usuário.

---

**Depois de hospedar, cole o URL no Google Play Console e pronto!** 🚀

