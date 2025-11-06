# 🔧 CORREÇÃO: Upload de Avatar

## ❌ ERRO ATUAL

```
StorageApiError: new row violates row-level security policy
```

### Causa:
O bucket `avatars` no Supabase Storage não tem política RLS configurada para permitir uploads.

---

## ✅ SOLUÇÃO

### **1. Configurar RLS no Supabase Storage**

Acesse o Supabase Dashboard:
1. Vá para **Storage** → **Policies**
2. Selecione o bucket **`avatars`**
3. Adicione as seguintes políticas:

#### **Política 1: Allow Upload**
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### **Política 2: Allow Update**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### **Política 3: Allow Public Read**
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### **Política 4: Allow Delete**
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

### **2. Verificar se o Bucket Existe**

No Supabase Dashboard:
1. **Storage** → **Buckets**
2. Se não existe bucket `avatars`, criar:
   - Nome: `avatars`
   - Public: ✅ Yes
   - File size limit: 2MB
   - Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp`

---

### **3. Alternativa: Tornar Bucket Público**

Se as políticas acima não funcionarem:

1. **Storage** → **Buckets** → `avatars`
2. Configurações:
   - ✅ **Public bucket** (marcar)
3. Isso permite uploads sem RLS (menos seguro, mas funciona)

---

## 🧪 TESTE

Após configurar:

1. Vá para **Configurações de Perfil**
2. Clique no avatar
3. Selecione uma imagem
4. ✅ Deve fazer upload com sucesso!

---

**Status:** ⚠️ PRECISA CONFIGURAÇÃO NO SUPABASE
**Ação:** Aplicar políticas RLS no Storage

