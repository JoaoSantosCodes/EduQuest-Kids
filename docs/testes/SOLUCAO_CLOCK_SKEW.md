# 🕐 Solução: Clock Skew no Supabase OAuth

## 🎯 Problema Identificado

O aviso do Supabase indica que há um problema de sincronização de relógio entre o dispositivo do cliente e o servidor Supabase:

```
@supabase/gotrue-js: Session as retrieved from URL was issued in the future? 
Check the device clock for skew 1762250558 1762254158 1762250353
```

Isso pode fazer com que o Supabase rejeite a sessão mesmo que os tokens estejam corretos na URL.

## 🔍 Causa

O relógio do sistema Windows pode estar desincronizado com o servidor do Supabase. Isso faz com que:

1. O token JWT seja considerado "emitido no futuro" pelo Supabase
2. A validação de expiração do token falhe
3. A sessão seja rejeitada mesmo com tokens válidos

## ✅ Soluções

### **Solução 1: Sincronizar o relógio do Windows**

1. **Abra as Configurações do Windows:**
   - Pressione `Win + I`
   - Vá para "Hora e idioma" → "Data e hora"

2. **Sincronize o relógio:**
   - Ative "Definir hora automaticamente"
   - Clique em "Sincronizar agora"
   - Aguarde a sincronização completar

3. **Verifique a sincronização:**
   - Abra o PowerShell como Administrador
   - Execute: `w32tm /resync`
   - Verifique se não há erros

### **Solução 2: Verificar se o relógio está correto**

1. **Compare com um servidor de tempo confiável:**
   - Acesse https://time.is
   - Compare com o relógio do Windows
   - Se houver diferença maior que 5 minutos, sincronize

2. **Verifique o fuso horário:**
   - Certifique-se de que o fuso horário está correto
   - Windows: Configurações → Hora e idioma → Fuso horário

### **Solução 3: Ignorar o aviso (desenvolvimento)**

O aviso do Supabase é apenas um aviso, não um erro fatal. Se o relógio estiver sincronizado, o código deve funcionar mesmo com o aviso.

## 🔧 Teste de Verificação

Após sincronizar o relógio:

1. **Limpe o cache do navegador** (`Ctrl + Shift + Delete`)
2. **Reinicie o servidor** (`Ctrl + C` e `npm run dev`)
3. **Faça logout** (se estiver logado)
4. **Tente fazer login com Google novamente**
5. **Verifique se o aviso ainda aparece**

## 📝 Notas Importantes

- O aviso de clock skew é comum em ambientes de desenvolvimento
- Em produção, isso geralmente não é um problema
- O Supabase tem uma tolerância de ~5 minutos para clock skew
- Se a diferença for maior, o token será rejeitado

## ⚠️ Se o Problema Persistir

Se mesmo após sincronizar o relógio o problema persistir:

1. **Verifique os logs do console:**
   - Os logs `[DEBUG]` devem aparecer
   - Se não aparecerem, há outro problema

2. **Verifique se o código foi recarregado:**
   - Reinicie o servidor completamente
   - Limpe o cache do navegador
   - Faça um hard refresh (`Ctrl + Shift + R`)

3. **Verifique se há erros no console:**
   - Procure por erros antes dos logs
   - Erros de sintaxe podem impedir a execução

---

**Última atualização:** Guia criado para resolver o problema de clock skew no Supabase OAuth.

