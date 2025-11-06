# 🔍 Debug OAuth Callback - Guia de Diagnóstico

## 🎯 Problema Identificado

Os logs de debug `[DEBUG]` não aparecem no console, mesmo com tokens presentes na URL (`#access_token=...`).

## ✅ Logs Implementados

### **1. Logs no Módulo (AuthCallback.jsx)**
```javascript
// Log FORA do componente para garantir que aparece
console.log('[DEBUG] ============================================');
console.log('[DEBUG] AuthCallback.jsx CARREGADO');
console.log('[DEBUG] ============================================');
```
- **Executa quando:** O arquivo é carregado pelo bundler
- **Deve aparecer:** Sempre que o arquivo é importado

### **2. Logs no Componente (AuthCallback.jsx)**
```javascript
export default function AuthCallback() {
  console.log('[DEBUG] ============================================');
  console.log('[DEBUG] AuthCallback componente montado');
  console.log('[DEBUG] URL atual:', window.location.href);
  console.log('[DEBUG] Hash da URL:', window.location.hash);
  // ...
}
```
- **Executa quando:** O componente é montado
- **Deve aparecer:** Quando a rota `/auth/callback` é acessada

### **3. Logs no useEffect (AuthCallback.jsx)**
```javascript
useEffect(() => {
  const processCallback = async () => {
    console.log('[DEBUG] ============================================');
    console.log('[DEBUG] AuthCallback iniciado');
    // ...
  };
  processCallback();
}, [navigate, setAuth]);
```
- **Executa quando:** O `useEffect` é executado após a montagem
- **Deve aparecer:** Imediatamente após a montagem do componente

### **4. Logs no handleAuthCallback (supabaseAuthService.js)**
```javascript
export const handleAuthCallback = async () => {
  console.log('[DEBUG] ============================================');
  console.log('[DEBUG] handleAuthCallback iniciado');
  // ...
}
```
- **Executa quando:** A função é chamada
- **Deve aparecer:** Quando `handleAuthCallback()` é chamado

## 🔍 Possíveis Causas

### **1. Componente não está sendo renderizado**
- **Sintoma:** Nenhum log aparece
- **Causa:** React Router não está correspondendo à rota `/auth/callback`
- **Solução:** Verificar se a rota está configurada corretamente em `App.jsx`

### **2. Código não foi recarregado**
- **Sintoma:** Logs antigos não aparecem
- **Causa:** Hot reload não funcionou ou servidor não reiniciou
- **Solução:** Reiniciar o servidor (`Ctrl + C` e `npm run dev`)

### **3. Erro antes dos logs**
- **Sintoma:** Nenhum log aparece, mas há erros no console
- **Causa:** Erro de sintaxe ou importação que impede a execução
- **Solução:** Verificar erros no console e corrigir

### **4. Logs estão sendo filtrados**
- **Sintoma:** Logs não aparecem, mas outros logs aparecem
- **Causa:** Filtro do console está desabilitando logs
- **Solução:** Verificar filtros do console (habilitar "Logs" e "Debug")

## 🧪 Passos para Diagnóstico

### **Passo 1: Verificar se o arquivo é carregado**
1. Abra o console do navegador
2. Limpe o console (`Ctrl + L`)
3. Recarregue a página (`F5`)
4. **Procure por:** `[DEBUG] AuthCallback.jsx CARREGADO`
5. **Se não aparecer:** O arquivo não está sendo importado

### **Passo 2: Verificar se o App.jsx está renderizando**
1. Abra o console do navegador
2. Limpe o console
3. Recarregue a página
4. **Procure por:** `[DEBUG] App.jsx renderizado`
5. **Se não aparecer:** Há um erro no App.jsx

### **Passo 3: Verificar se a rota está sendo acessada**
1. Abra o console do navegador
2. Limpe o console
3. Acesse `http://localhost:3000/auth/callback#access_token=test`
4. **Procure por:** `[DEBUG] AuthCallback componente montado`
5. **Se não aparecer:** A rota não está correspondendo

### **Passo 4: Verificar se o useEffect executa**
1. Se o componente está montado, o `useEffect` deve executar
2. **Procure por:** `[DEBUG] AuthCallback iniciado`
3. **Se não aparecer:** Há um erro no `useEffect` ou nas dependências

### **Passo 5: Verificar se handleAuthCallback é chamado**
1. Se o `useEffect` executa, `handleAuthCallback()` deve ser chamado
2. **Procure por:** `[DEBUG] handleAuthCallback iniciado`
3. **Se não aparecer:** Há um erro antes de chamar a função

## 🔧 Soluções Aplicadas

### **1. Logs adicionados em múltiplos pontos**
- ✅ Logs no nível do módulo
- ✅ Logs no componente
- ✅ Logs no useEffect
- ✅ Logs no handleAuthCallback

### **2. Log no App.jsx**
- ✅ Log para verificar se o App está renderizando
- ✅ Log para verificar se o AuthCallback está importado

### **3. Verificação de rota**
- ✅ Rota `/auth/callback` configurada em `App.jsx`
- ✅ Componente `AuthCallback` importado corretamente

## 📝 Próximos Passos

1. **Teste novamente** após reiniciar o servidor
2. **Verifique os logs** seguindo os passos de diagnóstico
3. **Reporte** quais logs aparecem e quais não aparecem
4. **Inclua** qualquer erro que apareça no console

## ⚠️ Observações Importantes

- Os logs usam `console.log('[DEBUG] ...')` para garantir visibilidade
- Os logs são prefixados com `[DEBUG]` para facilitar filtragem
- Os logs incluem informações detalhadas sobre a URL e hash
- Se nenhum log aparecer, isso indica um problema mais fundamental

## 🎯 Status Atual

- ✅ Logs implementados em todos os pontos críticos
- ✅ Logs adicionados no App.jsx
- ⏳ Aguardando teste para verificar quais logs aparecem
- ⏳ Diagnóstico pendente baseado nos logs que aparecem

---

**Última atualização:** Logs adicionados em múltiplos pontos para diagnóstico completo.

