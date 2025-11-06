# 🎮 EduQuest Kids - App de Estudo Gamificado

Sistema educacional gamificado para crianças do 6º e 7º ano com 4 portais integrados:
- **Portal do Aluno**: Quiz interativo e gamificação
- **Portal dos Pais**: Monitoramento e relatórios
- **Portal do Professor**: Gestão de conteúdo e avaliações
- **Portal do Coordenador**: Gestão de turmas e professores

## 🚀 Tecnologias

- **React 18** + **Vite**
- **React Router** para navegação
- **TailwindCSS** para estilização
- **Lucide React** para ícones
- **Recharts** para gráficos
- **Supabase** para backend e banco de dados
- **Capacitor** para build Android/iOS
- **Context API** para gerenciamento de estado
- **Sonner** para notificações

## 📦 Instalação

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

## 🏗️ Build para Produção

### Web
```bash
npm run build
```

### Android
```bash
# Build e sincronizar
npm run android:sync

# Abrir no Android Studio
npm run cap:open:android
```

Consulte `BUILD_ANDROID.md` para instruções completas de publicação na Play Store.

## 📱 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção (web)
- `npm run preview` - Preview do build de produção
- `npm run android:build` - Build completo e abre Android Studio
- `npm run android:sync` - Sincroniza após build
- `npm run cap:open:android` - Abre projeto no Android Studio

## 🏗️ Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
│   ├── auth/         # Login e Registro
│   ├── common/       # Componentes comuns
│   ├── parent/       # Componentes do Portal dos Pais
│   ├── student/      # Componentes do Portal do Aluno
│   └── teacher/      # Componentes do Portal do Professor
├── context/          # Context API (Auth)
├── hooks/            # Custom hooks
├── pages/            # Páginas principais
│   ├── Student/      # Portal do Aluno
│   ├── Parent/       # Portal dos Pais
│   ├── Teacher/      # Portal do Professor
│   └── Coordinator/  # Portal do Coordenador
├── services/         # Serviços de API
├── utils/            # Funções utilitárias
└── config/           # Configurações
```

## 🔐 Autenticação

O sistema possui autenticação híbrida:
- **Supabase Auth** (prioritário se configurado)
- **API REST** (fallback)

### Roles Disponíveis:
- `student` - Aluno
- `parent` - Pai/Responsável
- `teacher` - Professor
- `coordinator` - Coordenador

## 🌐 Integração com Supabase

O app está configurado para usar Supabase como backend:
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o schema SQL (veja `docs/`)
3. Configure as variáveis de ambiente
4. Pronto! O app funcionará com Supabase

## 📱 Funcionalidades

### Portal do Aluno
- ✅ Quiz interativo por matéria
- ✅ Sistema de pontuação e níveis
- ✅ Cronômetro de estudo
- ✅ Sequência de acertos (streak)
- ✅ Sistema de conquistas
- ✅ Plano de estudos
- ✅ Ranking

### Portal dos Pais
- ✅ Dashboard com métricas
- ✅ Relatórios detalhados por matéria
- ✅ Controle parental
- ✅ Gráficos de desempenho
- ✅ Vinculação de filhos
- ✅ Exportação PDF

### Portal do Professor
- ✅ Gestão completa de questões
- ✅ Criação de quizzes/provas
- ✅ Relatórios de alunos
- ✅ Dashboard com estatísticas
- ✅ Importação/Exportação de questões
- ✅ Gestão de turmas

### Portal do Coordenador
- ✅ Gestão de turmas
- ✅ Atribuição de professores
- ✅ Visualização de todas as turmas

## 📚 Documentação

A documentação está completamente organizada na pasta `docs/`:

- 📖 **Guias:** `docs/guias/` - Guias práticos de uso
- ⚙️ **Configuração:** `docs/configuracao/` - Setup e configuração
- 🔧 **Correções:** `docs/correcoes/` - Soluções de problemas
- 💻 **Implementação:** `docs/implementacao/` - Documentação de implementação
- 📊 **Resumos:** `docs/resumos/` - Resumos e validações

**Consulte:** `docs/README.md` ou `docs/INDEX.md` para navegação completa.

## 🎯 Próximos Passos

1. Configurar Supabase
2. Executar schema SQL
3. Testar todas as funcionalidades
4. Build para Android
5. Publicar na Play Store

## 📝 Licença

Este projeto é privado e destinado ao uso educacional.

## 🆘 Suporte

Para problemas ou dúvidas, consulte a documentação em `docs/` ou verifique os arquivos de troubleshooting.

---

**Desenvolvido com ❤️ para educação**
