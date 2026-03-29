# ⏰ Ponto Eletrônico — Landing Page

Landing page de captação de leads para sistema de ponto eletrônico corporativo voltado a PMEs.

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **React 18** | Biblioteca de UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Bundler e dev server |
| **Tailwind CSS 3** | Estilização utility-first |
| **shadcn/ui** | Componentes UI (Radix + CVA) |
| **Zod** | Validação de formulários |
| **React Router** | Roteamento SPA |
| **React Query** | Gerenciamento de estado async |
| **Lucide React** | Ícones |

## 📁 Estrutura do Projeto

```
src/
├── main.tsx                      # Entry point da aplicação
├── App.tsx                       # Root component (providers + rotas)
│
├── assets/
│   └── images/                   # Imagens estáticas (logo, mockups)
│
├── components/
│   ├── layout/                   # Componentes estruturais
│   │   ├── Header.tsx            # Navbar fixa
│   │   └── Footer.tsx            # Rodapé
│   ├── sections/                 # Seções da landing page
│   │   ├── Hero.tsx              # Banner principal
│   │   ├── Problems.tsx          # Problemas do público-alvo
│   │   ├── Solution.tsx          # Funcionalidades do sistema
│   │   ├── Benefits.tsx          # Benefícios para o cliente
│   │   ├── SocialProof.tsx       # Depoimentos e métricas
│   │   ├── Pricing.tsx           # Tabela de preços
│   │   ├── Security.tsx          # Segurança e conformidade
│   │   ├── LeadForm.tsx          # Formulário de captação
│   │   └── FinalCTA.tsx          # Call-to-action final
│   └── ui/                       # Componentes primitivos (shadcn/ui)
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Toast.tsx
│       ├── Toaster.tsx
│       └── Tooltip.tsx
│
├── hooks/
│   ├── useToast.ts               # Sistema de notificações toast
│   └── useScrollAnimation.ts     # Animação on-scroll (IntersectionObserver)
│
├── services/
│   └── leadService.ts            # Integração com Supabase e webhook n8n
│
├── styles/
│   └── globals.css               # Design tokens, variáveis CSS e animações
│
├── utils/
│   └── cn.ts                     # Utilitário de merge de classes (clsx + twMerge)
│
└── pages/
    ├── HomePage.tsx               # Página principal (monta todas as seções)
    └── NotFoundPage.tsx           # Página 404
```

## 🚀 Desenvolvimento

### Pré-requisitos

- Node.js >= 18
- npm, yarn ou bun

### Instalação

```bash
# Clonar repositório
git clone https://github.com/KaduPacheco/CapturaLeeds.git
cd CapturaLeeds

# Instalar dependências
npm install
```

### Executar em desenvolvimento

```bash
npm run dev
```

O servidor inicia em `http://localhost:8080`.

### Build de produção

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔌 Integrações

### Supabase
O formulário de leads envia dados para uma tabela `leads` no Supabase via REST API (sem SDK).

### n8n Webhook
Após salvar no Supabase, os dados são replicados para um webhook n8n para automações (notificações, CRM, etc.). Falhas no webhook não bloqueiam o fluxo principal.

## 📋 Melhorias Futuras

| Melhoria | Descrição |
|---|---|
| **Testes unitários** | Adicionar testes com Vitest para componentes e serviços |
| **Testes E2E** | Cypress ou Playwright para validar fluxo de conversão |
| **Variáveis de ambiente** | Mover `SUPABASE_URL` e `SUPABASE_ANON_KEY` para `.env` |
| **SEO avançado** | Adicionar `<link rel="icon">` no `<head>`, structured data (JSON-LD) |
| **Acessibilidade** | Melhorar labels ARIA, focus management, skip links |
| **Internacionalização** | Preparar para i18n caso escale para outros idiomas |
| **Analytics** | Integrar Google Analytics / Plausible para métricas de conversão |
| **Performance** | Lazy loading de seções abaixo do fold, otimização de imagens (WebP) |
| **CI/CD** | GitHub Actions para lint, build e deploy automático |
| **Dark mode** | Ativar toggle de tema (variáveis CSS já preparadas) |

## 📄 Licença

Projeto privado — todos os direitos reservados.
