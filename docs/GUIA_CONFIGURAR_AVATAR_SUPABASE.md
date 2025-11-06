# 🔧 GUIA: Configurar Avatar Upload no Supabase

## 📝 PASSO A PASSO

### 1️⃣ **Acessar Supabase Dashboard**
1. Vá para: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: **EduQuest Kids**

---

### 2️⃣ **Verificar/Criar Bucket**

1. No menu lateral, clique em **Storage**
2. Verifique se existe bucket chamado `avatars`
3. **Se NÃO existir**, clique em "New bucket":
   - Name: `avatars`
   - Public bucket: ✅ **Sim** (marcar)
   - File size limit: `2MB`
   - Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp`
   - Clique em **"Create bucket"**

---

### 3️⃣ **Configurar Políticas RLS**

1. Clique no bucket `avatars`
2. Vá para aba **"Policies"**
3. Clique em **"New Policy"**
4. Adicione as 4 políticas abaixo:

#### **Política 1: Allow Upload**
```sql
-- Nome: Users can upload own avatar
-- Operation: INSERT

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);
```

#### **Política 2: Allow Update**
```sql
-- Nome: Users can update own avatar
-- Operation: UPDATE

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');
```

#### **Política 3: Allow Public Read**
```sql
-- Nome: Anyone can view avatars
-- Operation: SELECT

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### **Política 4: Allow Delete**
```sql
-- Nome: Users can delete own avatar
-- Operation: DELETE

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

---

### 4️⃣ **ALTERNATIVA SIMPLES (SE AS POLÍTICAS NÃO FUNCIONAREM)**

Se as políticas acima não funcionarem, use esta solução mais simples:

1. Vá para **Storage** → Buckets
2. Clique nos 3 pontinhos do bucket `avatars`
3. Clique em **"Edit bucket"**
4. Marque: ✅ **"Public bucket"**
5. Clique em **"Save"**

**Isso torna o bucket público para qualquer um fazer upload** (menos seguro, mas funciona!)

---

### 5️⃣ **TESTAR**

Após configurar:

1. **Recarregue** a aplicação (Ctrl + Shift + R)
2. **Vá para** Configurações de Perfil
3. **Clique no avatar**
4. **Selecione uma imagem**
5. **✅ Deve fazer upload com sucesso!**

---

## 🔍 VERIFICAR SE FUNCIONOU

No console do navegador (F12), você verá:

**ANTES (erro):**
```
❌ Erro ao fazer upload: StorageApiError: new row violates row-level security policy
```

**DEPOIS (sucesso):**
```
✅ Foto carregada com sucesso!
```

---

## 📊 STATUS

| Item | Status |
|------|--------|
| Bucket `avatars` existe | ⬜ Verificar |
| Bucket é público | ⬜ Configurar |
| Políticas RLS | ⬜ Adicionar |
| Upload funciona | ⬜ Testar |

---

**Após configurar, teste e me avise se funcionou!** 🚀

