# 🔍 Verificar Logs de Debug - Guia Rápido

## 🎯 Problema

Os logs de debug `[DEBUG]` não aparecem no console, mas o erro "Sessão não encontrada" aparece.

## ✅ Soluções em Ordem de Prioridade

### **1. Reiniciar o Servidor Completamente**

1. Pare o servidor: `Ctrl + C` no terminal
2. Aguarde 5 segundos
3. Inicie novamente: `npm run dev`
4. Aguarde o servidor inicializar completamente
5. Recarregue a página no navegador

### **2. Limpar Cache do Navegador**

1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Selecione "Última hora" ou "Todo o período"
4. Clique em "Limpar dados"
5. Recarregue a página (`F5`)

### **3. Hard Refresh da Página**

1. Pressione `Ctrl + Shift + R` (ou `Ctrl + F5`)
2. Isso força o navegador a recarregar todos os recursos
3. Verifique se os logs aparecem agora

### **4. Verificar Filtros do Console**

1. Abra o console (`F12`)
2. Verifique os filtros no topo:
   - ✅ "Logs" deve estar habilitado
   - ✅ "Debug" deve estar habilitado
   - ✅ "Info" deve estar habilitado
3. Se algum estiver desabilitado, clique para habilitar

### **5. Limpar o Console**

1. Clique no ícone de lixeira (🗑️) no console
2. Ou pressione `Ctrl + L`
3. Isso limpa todos os logs antigos
4. Tente fazer login novamente

### **6. Verificar se o Código Foi Salvo**

1. Abra `src/pages/AuthCallback.jsx`
2. Verifique se os logs estão presentes (linhas 11-13 e 17-21)
3. Se não estiverem, salve o arquivo (`Ctrl + S`)
4. Aguarde o hot reload do Vite

### **7. Verificar Erros Antes dos Logs**

1. Abra o console (`F12`)
2. Procure por erros em vermelho ANTES dos logs
3. Erros de sintaxe ou importação podem impedir a execução
4. Se houver erros, corrija-os primeiro

## 🔍 Logs Esperados

### **Quando o arquivo é carregado:**
```
[DEBUG] ============================================
[DEBUG] AuthCallback.jsx CARREGADO
[DEBUG] ============================================
```

### **Quando o componente é montado:**
```
[DEBUG] ============================================
[DEBUG] AuthCallback componente montado
[DEBUG] URL atual: http://localhost:3000/auth/callback#access_token=...
[DEBUG] Hash da URL: #access_token=...
[DEBUG] ============================================
```

### **Quando o useEffect executa:**
```
[DEBUG] ============================================
[DEBUG] AuthCallback iniciado
[DEBUG] URL atual: http://localhost:3000/auth/callback#access_token=...
[DEBUG] Hash da URL: #access_token=...
[DEBUG] ============================================
[DEBUG] Chamando handleAuthCallback...
```

### **Quando handleAuthCallback executa:**
```
[DEBUG] ============================================
[DEBUG] handleAuthCallback iniciado
[DEBUG] URL completa: http://localhost:3000/auth/callback#access_token=...
[DEBUG] Hash da URL: #access_token=...
[DEBUG] ============================================
```

## ⚠️ Se Nenhum Log Aparecer

Se mesmo após seguir todos os passos nenhum log aparecer:

1. **Verifique se o arquivo existe:**
   - `src/pages/AuthCallback.jsx` deve existir
   - `src/App.jsx` deve importar o componente

2. **Verifique se há erros de build:**
   - Olhe o terminal onde o Vite está rodando
   - Procure por erros de compilação
   - Se houver erros, corrija-os primeiro

3. **Verifique se a rota está configurada:**
   - `src/App.jsx` deve ter a rota `/auth/callback`
   - O componente deve ser importado corretamente

4. **Tente recarregar a página manualmente:**
   - Acesse `http://localhost:3000/auth/callback#test`
   - Verifique se os logs aparecem

## 📝 Próximos Passos

Após verificar todos os passos acima:

1. **Teste novamente** fazendo login com Google
2. **Reporte** quais logs aparecem e quais não aparecem
3. **Inclua** qualquer erro que apareça no console
4. **Inclua** uma captura de tela do console completo

---

**Última atualização:** Guia criado para verificar por que os logs de debug não aparecem.

