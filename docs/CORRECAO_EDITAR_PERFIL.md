# 🔧 CORREÇÃO: Editar Perfil - Salvamento de Dados

## ❌ PROBLEMAS IDENTIFICADOS

1. **Telefone não estava salvando**
2. **Data de nascimento não estava salvando**
3. **Endereço não estava salvando**
4. **Faltava campo de gênero**

---

## ✅ SOLUÇÕES APLICADAS

### 1. **Adicionada Coluna `gender` no Banco**

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
```

Valores possíveis:
- `masculino`
- `feminino`
- `outro`
- `prefiro_nao_dizer`

---

### 2. **Corrigido Salvamento de Dados**

**ANTES (❌):**
```javascript
const { data, error } = await supabase
  .from('users')
  .update({
    name: profileData.name,
    phone: profileData.phone || null,
    address: profileData.address || null,
    birth_date: profileData.birth_date || null,
    avatar_url: profileData.avatar_url || null,
  })
  .eq('id', user.id)
  .select();
```

**DEPOIS (✅):**
```javascript
const updateData = {
  name: profileData.name,
  phone: profileData.phone || null,
  address: profileData.address || null,
  birth_date: profileData.birth_date || null,
  avatar_url: profileData.avatar_url || null,
  gender: profileData.gender || null,
};

console.log('📤 Dados a serem salvos:', updateData);

const { data, error } = await supabase
  .from('users')
  .update(updateData)
  .eq('id', user.id)
  .select();
```

**Mudanças:**
- ✅ Adicionado campo `gender`
- ✅ Criado objeto `updateData` separado para debug
- ✅ Adicionado log dos dados antes de salvar

---

### 3. **Adicionado Campo de Gênero no Formulário**

```javascript
<div>
  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
    Gênero
  </label>
  <select
    id="gender"
    value={profileData.gender}
    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
  >
    <option value="">Selecione...</option>
    <option value="masculino">Masculino</option>
    <option value="feminino">Feminino</option>
    <option value="outro">Outro</option>
    <option value="prefiro_nao_dizer">Prefiro não dizer</option>
  </select>
</div>
```

---

### 4. **Atualizado Estado Inicial**

**ANTES (❌):**
```javascript
const [profileData, setProfileData] = useState({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  address: user?.address || '',
  birth_date: user?.birth_date || '',
  avatar_url: user?.avatar_url || '',
});
```

**DEPOIS (✅):**
```javascript
const [profileData, setProfileData] = useState({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  address: user?.address || '',
  birth_date: user?.birth_date || '',
  avatar_url: user?.avatar_url || '',
  gender: user?.gender || '',
});
```

---

## 🎨 LAYOUT DO FORMULÁRIO

### Grid de Campos:
```
┌─────────────────────────────────────────────┐
│ Nome Completo *     │ Email (readonly)      │
├─────────────────────────────────────────────┤
│ Telefone            │ Data de Nascimento    │
├─────────────────────────────────────────────┤
│ Gênero (select)     │                       │
├─────────────────────────────────────────────┤
│ Endereço (full width)                       │
└─────────────────────────────────────────────┘
```

---

## 🧪 TESTE

### Passo 1: Abrir Modal
1. Faça login como coordenador
2. Vá para aba "Professores" (ou Alunos/Pais)
3. Clique no ícone 📝 de um usuário
4. Modal abre

### Passo 2: Preencher Campos
1. **Nome:** Ana Barbosa
2. **Telefone:** (11) 98765-4321
3. **Data de Nascimento:** 15/03/1990
4. **Gênero:** Feminino
5. **Endereço:** Rua das Flores, 123, Centro, São Paulo, SP

### Passo 3: Salvar
1. Clique em "Salvar Alterações"
2. Aguarde: ✅ "Perfil atualizado com sucesso!"
3. Modal fecha
4. Lista recarrega

### Passo 4: Verificar
1. Abra o modal novamente
2. ✅ Todos os campos devem estar preenchidos
3. ✅ Telefone: (11) 98765-4321
4. ✅ Data: 1990-03-15
5. ✅ Gênero: Feminino
6. ✅ Endereço: Rua das Flores, 123...

---

## 🔍 DEBUG

### Console Logs Adicionados:

```javascript
console.log('💾 Salvando perfil do usuário...', {
  userId: user.id,
  data: profileData,
});

console.log('📤 Dados a serem salvos:', updateData);

console.log('📊 Resposta do Supabase:', { data, error });
```

### O que verificar no console:

1. **Antes de salvar:**
   ```
   💾 Salvando perfil do usuário...
   📤 Dados a serem salvos: {
     name: "Ana Barbosa",
     phone: "(11) 98765-4321",
     address: "Rua das Flores, 123...",
     birth_date: "1990-03-15",
     gender: "feminino",
     avatar_url: "..."
   }
   ```

2. **Depois de salvar:**
   ```
   📊 Resposta do Supabase: {
     data: [{...}],
     error: null
   }
   ✅ Perfil atualizado com sucesso!
   ```

3. **Se houver erro:**
   ```
   ❌ Erro detalhado: {...}
   ❌ Detalhes: message, details, hint
   ```

---

## ✅ CAMPOS DO FORMULÁRIO

| Campo | Tipo | Obrigatório | Placeholder/Opções |
|-------|------|-------------|-------------------|
| Nome Completo | text | ✅ Sim | "Nome completo" |
| Email | email | - | (somente leitura) |
| Telefone | text | ❌ Não | "(XX) XXXXX-XXXX" |
| Data de Nascimento | date | ❌ Não | - |
| Gênero | select | ❌ Não | Masculino, Feminino, Outro, Prefiro não dizer |
| Endereço | text | ❌ Não | "Rua, Número, Bairro, Cidade, Estado" |

---

## ✅ STATUS

- ✅ Coluna `gender` adicionada ao banco
- ✅ Campo `gender` adicionado ao formulário
- ✅ Estado `profileData` atualizado
- ✅ Função `handleSave` corrigida
- ✅ Logs de debug adicionados
- ✅ Salvamento de telefone corrigido
- ✅ Salvamento de data de nascimento corrigido
- ✅ Salvamento de endereço corrigido
- ⏳ **Aguardando teste do usuário**

---

**RECARREGUE A PÁGINA E TESTE!** 🚀

Pressione: **Ctrl + Shift + R**

Edite um perfil e preencha TODOS os campos, depois verifique se salvou corretamente!

