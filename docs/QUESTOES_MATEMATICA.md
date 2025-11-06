# 📚 Banco de Questões de Matemática - EduQuest Kids

## 📋 **ÍNDICE**

1. [Questões Fáceis (20)](#questões-fáceis)
2. [Questões Médias (Aguardando)](#questões-médias)
3. [Questões Difíceis (Aguardando)](#questões-difíceis)
4. [Como Adicionar ao Banco](#como-adicionar-ao-banco)

---

## 📘 **QUESTÕES FÁCEIS**

### **Informações:**
- **Total:** 20 questões
- **Nível:** Fácil (easy)
- **Série:** 6º ano
- **Pontos:** 10 por questão
- **Status:** ✅ Pronto para uso

### **Lista de Questões:**

1. ✅ João tinha R$ 10,00 e gastou R$ 4,00 em um lanche. Quanto sobrou?
2. ✅ Maria comprou 5 balas, cada uma custando R$ 0,50. Quanto ela pagou?
3. ✅ Quanto é 8 × 6?
4. ✅ Um pacote tem 12 biscoitos. Pedro comeu 4. Quantos restam?
5. ✅ Quanto é 45 ÷ 5?
6. ✅ Ana tinha 20 reais. Comprou um lanche de R$ 12,00. Quanto sobrou?
7. ✅ Quanto é 9 + 18?
8. ✅ Qual é o dobro de 14?
9. ✅ Lucas comprou 3 pães por R$ 1,00 cada. Quanto gastou?
10. ✅ Quanto é 50 – 17?
11. ✅ Paula tinha 30 figurinhas e deu 10 para um amigo. Com quantas ficou?
12. ✅ Quanto é 7 × 4?
13. ✅ O triplo de 5 é:
14. ✅ Se um lápis custa R$ 2,00, quanto custam 3 lápis?
15. ✅ Quanto é 100 – 25?
16. ✅ Um ônibus tem 40 lugares. Se 25 estão ocupados, quantos estão livres?
17. ✅ Quanto é 6 × 9?
18. ✅ Qual é a metade de 50?
19. ✅ Pedro comprou 2 hambúrgueres de R$ 9,00 cada. Quanto pagou?
20. ✅ Quanto é 72 ÷ 8?

### **Tópicos Cobertos:**
- ✅ Operações básicas (+, -, ×, ÷)
- ✅ Problemas com dinheiro
- ✅ Problemas do dia a dia
- ✅ Multiplicação e divisão
- ✅ Dobro, triplo e metade

---

## 📙 **QUESTÕES MÉDIAS**

### **Informações:**
- **Total:** 20 questões
- **Nível:** Médio (medium)
- **Série:** 7º ano
- **Pontos:** 15 por questão
- **Status:** ⏳ Aguardando conteúdo

### **Tópicos a Serem Cobertos:**
- Frações (1/2, 1/4, 3/4, etc.)
- Porcentagem básica (10%, 25%, 50%)
- Problemas com frações
- Problemas com porcentagem
- Conversões (frações ↔ decimais ↔ porcentagem)

**Estilo escolhido:** C - Mistura de frações e porcentagem ✅

---

## 📕 **QUESTÕES DIFÍCEIS**

### **Informações:**
- **Total:** 20 questões
- **Nível:** Difícil (hard)
- **Série:** 8º-9º ano
- **Pontos:** 20 por questão
- **Status:** ⏳ Aguardando conteúdo

### **Tópicos Sugeridos:**
- Equações de 1º grau
- Problemas complexos
- Geometria básica
- Regra de três
- Juros simples

---

## 🔧 **COMO ADICIONAR AO BANCO**

### **Método 1: Via Supabase Dashboard**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de `scripts/add_easy_questions.sql`
4. Execute o script
5. Verifique em **Table Editor** → `questions`

### **Método 2: Via MCP (Model Context Protocol)**

Se o MCP Supabase estiver configurado, você pode executar:

```javascript
await mcp_supabase_apply_migration({
  name: "add_easy_math_questions",
  query: "/* Conteúdo do SQL */"
});
```

### **Método 3: Via Interface do Sistema (Futuro)**

No futuro, haverá uma interface no Portal do Professor para:
- Adicionar questões manualmente
- Importar questões de arquivo CSV/JSON
- Gerar questões com IA

---

## 📊 **ESTATÍSTICAS**

### **Por Nível:**
```
┌─────────────┬────────┬────────┬─────────┐
│ Nível       │ Total  │ Pontos │ Status  │
├─────────────┼────────┼────────┼─────────┤
│ Fácil       │ 20     │ 200    │ ✅ OK   │
│ Médio       │ 0      │ 0      │ ⏳ Pend │
│ Difícil     │ 0      │ 0      │ ⏳ Pend │
├─────────────┼────────┼────────┼─────────┤
│ **TOTAL**   │ **20** │ **200**│         │
└─────────────┴────────┴────────┴─────────┘
```

### **Por Série:**
```
6º ano: 20 questões ✅
7º ano: 0 questões ⏳
8º ano: 0 questões ⏳
9º ano: 0 questões ⏳
```

---

## ✅ **VALIDAÇÃO**

### **Checklist:**
- [x] Questões revisadas
- [x] Respostas corretas validadas
- [x] Explicações incluídas
- [x] Pontuação definida
- [x] Nível de dificuldade apropriado
- [x] Série adequada
- [x] Script SQL criado
- [ ] Script executado no banco
- [ ] Questões testadas no sistema

---

## 📝 **NOTAS**

- Todas as questões foram revisadas para garantir clareza
- Respostas corretas foram validadas
- Explicações foram adicionadas para ajudar no aprendizado
- O índice `correct_answer` começa em 0 (primeira opção = 0)

---

## 🚀 **PRÓXIMOS PASSOS**

1. ⏳ Receber 20 questões de nível MÉDIO (com frações e porcentagem)
2. ⏳ Receber 20 questões de nível DIFÍCIL
3. ⏳ Executar script SQL no banco de dados
4. ⏳ Testar questões no EduQuizApp
5. ⏳ Criar questões de outras matérias (Português, História, etc.)

---

**Última Atualização:** Novembro 2025  
**Status:** 📘 20/60 questões prontas (33%)

