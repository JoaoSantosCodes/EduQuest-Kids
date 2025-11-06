# 🔧 Solução para Erro de Registro

## ❌ Problema Atual

O erro `ERR_CONNECTION_REFUSED` na porta 3001 ocorre porque:

1. **Supabase não está configurado** (mostra warnings no console)
2. **Sistema tenta usar API REST** como fallback
3. **Backend Node.js não está rodando** na porta 3001

## ✅ Soluções

### Opção 1: Configurar Supabase (Recomendado) ⭐

Esta é a forma mais fácil e recomendada!

#### Passos:

1. **Criar projeto no Supabase:**
   - Acesse: https://supabase.com
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Obter credenciais:**
   - Vá em Settings > API
   - Copie a URL e a chave anônima (anon key)

3. **Criar arquivo `.env` na raiz do projeto:**
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

4. **Executar o schema SQL:**
   - Veja o arquivo `GUIA_SUPABASE.md`
   - Execute o SQL completo no Supabase SQL Editor

5. **Reiniciar o servidor:**
   ```bash
   npm run dev
   ```

✅ **Pronto!** O registro funcionará com Supabase.

---

### Opção 2: Configurar Backend Node.js

Se preferir usar API REST tradicional:

#### Passos:

1. **Configurar o backend:**
   - Veja a pasta com o código do backend Node.js/Express
   - Configure o banco PostgreSQL
   - Configure as variáveis de ambiente

2. **Iniciar o backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   O backend deve rodar na porta 3001

3. **Criar arquivo `.env` no frontend (opcional):**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

✅ **Pronto!** O registro funcionará com API REST.

---

## 🎯 Recomendação

**Use Supabase** porque:
- ✅ Mais fácil de configurar
- ✅ Não precisa configurar backend separado
- ✅ Autenticação já pronta
- ✅ Banco de dados gerenciado
- ✅ Gratuito para começar

---

## 📝 Verificar Configuração

Após configurar, teste em:
- http://localhost:3000/test-supabase

Se estiver tudo OK, você verá:
- ✅ "Conexão Supabase bem-sucedida!"

---

## 🐛 Ainda com erro?

1. Verifique se o arquivo `.env` está na raiz do projeto
2. Reinicie o servidor (`npm run dev`)
3. Limpe o cache do navegador (Ctrl+Shift+R)
4. Verifique o console do navegador para erros específicos

