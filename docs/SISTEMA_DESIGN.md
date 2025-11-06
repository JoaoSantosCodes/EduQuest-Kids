# 🎨 EduQuest Kids - Sistema de Design

## 📋 **ÍNDICE**

1. [Visão Geral](#visão-geral)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Espaçamento](#espaçamento)
5. [Componentes](#componentes)
6. [Responsividade](#responsividade)
7. [Animações](#animações)

---

## 🎯 **VISÃO GERAL**

O EduQuest Kids utiliza um sistema de design consistente baseado em Tailwind CSS, com componentes reutilizáveis e paletas de cores específicas para cada portal.

### **Princípios:**
- **Consistência:** Mesmo design em todos os portais
- **Responsividade:** Mobile-first approach
- **Acessibilidade:** Cores com contraste adequado
- **Performance:** Animações otimizadas
- **Escalabilidade:** Componentes reutilizáveis

---

## 🎨 **PALETA DE CORES**

### **Cores do Sistema:**
```css
--color-primary: #3B82F6    /* Azul */
--color-secondary: #8B5CF6  /* Roxo */
--color-success: #10B981    /* Verde */
--color-warning: #F59E0B    /* Amarelo */
--color-danger: #EF4444     /* Vermelho */
--color-info: #06B6D4       /* Ciano */
```

### **Cores por Portal:**

#### **Coordenador:**
- **Primária:** `#8B5CF6` (Roxo)
- **Secundária:** `#EC4899` (Rosa)
- **Gradiente:** `from-purple-600 to-pink-600`

#### **Professor:**
- **Primária:** `#059669` (Verde)
- **Secundária:** `#3B82F6` (Azul)
- **Gradiente:** `from-green-600 to-blue-600`

#### **Pais:**
- **Primária:** `#9333EA` (Roxo Escuro)
- **Secundária:** `#EC4899` (Rosa)
- **Gradiente:** `from-purple-600 to-pink-600`

#### **Aluno:**
- **Primária:** `#10B981` (Verde Claro)
- **Secundária:** `#3B82F6` (Azul)
- **Gradiente:** `from-green-600 to-blue-600`

---

## 📝 **TIPOGRAFIA**

### **Fonte Principal:**
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### **Tamanhos:**
- **Heading 1:** `text-3xl` (30px) - Títulos principais
- **Heading 2:** `text-2xl` (24px) - Subtítulos
- **Heading 3:** `text-xl` (20px) - Seções
- **Body:** `text-base` (16px) - Texto padrão
- **Small:** `text-sm` (14px) - Texto secundário
- **Tiny:** `text-xs` (12px) - Legendas

### **Pesos:**
- **Regular:** `font-normal` (400)
- **Medium:** `font-medium` (500)
- **Semibold:** `font-semibold` (600)
- **Bold:** `font-bold` (700)

---

## 📏 **ESPAÇAMENTO**

### **Scale Tailwind:**
```css
--spacing-0: 0px      /* spacing-0 */
--spacing-1: 4px      /* spacing-1 */
--spacing-2: 8px      /* spacing-2 */
--spacing-3: 12px     /* spacing-3 */
--spacing-4: 16px     /* spacing-4 */
--spacing-6: 24px     /* spacing-6 */
--spacing-8: 32px     /* spacing-8 */
--spacing-12: 48px    /* spacing-12 */
--spacing-16: 64px    /* spacing-16 */
```

### **Uso Recomendado:**
- **Padding de Cards:** `p-6` (24px)
- **Gap entre elementos:** `gap-4` (16px)
- **Margin entre seções:** `mb-8` (32px)

---

## 🧩 **COMPONENTES**

### **1. Button**
```jsx
import { Button } from '../components/common';

<Button variant="primary" size="md" icon={Plus}>
  Adicionar
</Button>
```

**Variantes:**
- `primary` - Azul (ação principal)
- `secondary` - Cinza (ação secundária)
- `success` - Verde (sucesso)
- `danger` - Vermelho (exclusão/perigo)
- `warning` - Amarelo (atenção)
- `info` - Ciano (informação)
- `ghost` - Transparente (sutil)
- `outline` - Contornado (alternativo)

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande
- `xl` - Extra grande

### **2. Card**
```jsx
import { Card } from '../components/common';

<Card variant="elevated" hover>
  Conteúdo
</Card>
```

**Variantes:**
- `default` - Borda simples
- `elevated` - Com sombra
- `gradient` - Com gradiente
- `colored` - Colorido

### **3. StatCard**
```jsx
import { StatCard } from '../components/common';

<StatCard
  icon={Users}
  title="Total de Alunos"
  value="250"
  subtitle="Ativos este ano"
  color="blue"
/>
```

### **4. PageHeader**
```jsx
import { PageHeader } from '../components/common';

<PageHeader
  title="Portal do Coordenador"
  subtitle={user?.name}
  icon={GraduationCap}
  gradient="from-purple-600 to-pink-600"
  onProfileClick={() => setShowProfile(true)}
/>
```

### **5. EmptyState**
```jsx
import { EmptyState } from '../components/common';

<EmptyState
  icon={Users}
  title="Nenhum aluno encontrado"
  description="Clique no botão abaixo para adicionar o primeiro aluno."
  actionLabel="Adicionar Aluno"
  onAction={() => setShowModal(true)}
/>
```

### **6. Badge**
```jsx
import { Badge } from '../components/common';

<Badge variant="success" size="md">
  Ativo
</Badge>
```

### **7. LoadingSpinner**
```jsx
import { LoadingSpinner } from '../components/common';

<LoadingSpinner size="lg" text="Carregando..." fullScreen />
```

---

## 📱 **RESPONSIVIDADE**

### **Breakpoints Tailwind:**
```css
sm:  640px   /* Mobile landscape / Tablet portrait */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop pequeno */
xl:  1280px  /* Desktop médio */
2xl: 1536px  /* Desktop grande */
```

### **Estratégia Mobile-First:**

```jsx
// ❌ Errado (Desktop-first)
<div className="grid grid-cols-3 md:grid-cols-1">

// ✅ Correto (Mobile-first)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### **Padrões Comuns:**

#### **Grid Responsivo:**
```jsx
// 1 coluna no mobile, 2 no tablet, 3 no desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### **Texto Responsivo:**
```jsx
<h1 className="text-xl sm:text-2xl lg:text-3xl">
  Título
</h1>
```

#### **Padding Responsivo:**
```jsx
<div className="px-4 sm:px-6 lg:px-8">
```

#### **Ocultar/Mostrar:**
```jsx
// Ocultar no mobile, mostrar no desktop
<span className="hidden sm:inline">Texto</span>

// Mostrar no mobile, ocultar no desktop
<span className="sm:hidden">Texto</span>
```

---

## ✨ **ANIMAÇÕES**

### **Classes Customizadas:**

```jsx
// Fade in
<div className="animate-fade-in">

// Slide up
<div className="animate-slide-up">

// Scale in
<div className="animate-scale-in">
```

### **Transições:**

```jsx
// Transição padrão
<div className="transition-all duration-200">

// Hover effects
<div className="hover:shadow-xl hover:-translate-y-1 transition-all">
```

### **Loading States:**

```jsx
// Spinner
<Loader2 className="w-6 h-6 animate-spin" />

// Pulse
<div className="animate-pulse bg-gray-200 h-4 w-24 rounded" />
```

---

## 📐 **LAYOUT PATTERNS**

### **Container Padrão:**
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Conteúdo */}
</div>
```

### **Dashboard Grid:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</div>
```

### **Two-Column Layout:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Conteúdo principal */}
  </div>
  <div>
    {/* Sidebar */}
  </div>
</div>
```

---

## 🎯 **BOAS PRÁTICAS**

### **1. Consistência:**
- Use os componentes pré-definidos sempre que possível
- Mantenha a paleta de cores de cada portal
- Siga o padrão de espaçamento

### **2. Performance:**
- Evite animações em loops infinitos
- Use `transform` e `opacity` para animações (melhor performance)
- Otimize imagens antes de fazer upload

### **3. Acessibilidade:**
- Sempre inclua `alt` em imagens
- Use contraste adequado (WCAG AA)
- Garanta que botões sejam clicáveis (min 44x44px)

### **4. Responsividade:**
- Teste em mobile (375px)
- Teste em tablet (768px)
- Teste em desktop (1280px)

---

## 📦 **ESTRUTURA DE ARQUIVOS**

```
src/
├── components/
│   ├── common/           # Componentes reutilizáveis
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Container.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PageHeader.jsx
│   │   ├── StatCard.jsx
│   │   └── index.js
│   ├── coordinator/      # Componentes do Coordenador
│   ├── teacher/          # Componentes do Professor
│   ├── parent/           # Componentes dos Pais
│   └── student/          # Componentes do Aluno
├── pages/                # Páginas principais
├── index.css             # Estilos globais + sistema de design
└── tailwind.config.js    # Configuração Tailwind
```

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ Criar componentes base reutilizáveis
2. ✅ Definir sistema de cores e tipografia
3. 🔄 Aplicar melhorias em todos os portais
4. ⏳ Criar biblioteca de componentes Storybook (futuro)
5. ⏳ Implementar dark mode (futuro)

---

## 📚 **RECURSOS**

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [Inter Font](https://fonts.google.com/specimen/Inter)

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe EduQuest Kids

