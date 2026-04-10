# CaptacaoLeeds

Aplicacao React com dois contextos isolados:

- landing page publica para captacao de leads
- CRM autenticado para operacao dos leads captados

O projeto foi evoluido para adicionar o CRM sem quebrar o fluxo publico da landing.

## Estado Atual

### Landing publica

- continua funcionando em `/`
- continua enviando leads via REST para `public.leads`
- continua isolada do contexto de autenticacao do CRM
- nao depende de `supabase-js` para captacao

### CRM autenticado

Rotas implementadas:

- `/crm/login`
- `/crm`
- `/crm/leads`
- `/crm/leads/:id`

Fluxos implementados e validados manualmente:

- login
- listagem de leads
- detalhe do lead
- criacao de nota
- criacao de tarefa
- conclusao de tarefa
- reabertura de tarefa
- timeline com eventos
- logout com tratamento de erro

### Supabase

Estrutura aplicada:

- extensao de `public.leads` para compatibilidade com CRM
- `public.lead_notes`
- `public.lead_tasks`
- `public.lead_events`

Politicas atuais de `public.leads`:

- `INSERT` para `anon`
- `SELECT` para `authenticated`
- `UPDATE` para `authenticated`

Tabelas auxiliares:

- RLS ativo nas tres tabelas
- triggers de `updated_at` em `lead_notes` e `lead_tasks`

## Stack

| Tecnologia | Uso |
|---|---|
| React 18 | UI |
| TypeScript | Tipagem |
| Vite | Build e dev server |
| Tailwind CSS | Estilizacao |
| React Router | Rotas |
| React Query | Estado async |
| Supabase | Auth + banco |
| Vitest | Testes |

## Estrutura Relevante

```text
src/
  App.tsx
  pages/
    HomePage.tsx
    crm/
      DashboardPage.tsx
      LoginPage.tsx
      LeadsPage.tsx
      LeadDetailPage.tsx
  services/
    leadService.ts
    crmService.ts
  contexts/
    AuthContext.tsx
  components/
    auth/
    layout/

docs/
  AUTH_SETUP.md
  CRM_STABILITY_CHECKLIST.md
  IMPLEMENTATION_STATUS.md
  LEADS_CRM_COMPATIBILITY.md
  sql/
    00_extend_leads_for_crm.sql
    01_rls_leads.sql
    05_crm_lead_detail_infra.sql
```

## Desenvolvimento

### Pre-requisitos

- Node.js 18+
- npm

### Instalar

```bash
npm install
```

### Rodar localmente

```bash
npm run dev
```

Por padrao, o Vite roda em `http://localhost:5173`.

### Build

```bash
npm run build
```

### Testes

```bash
npm run test
```

## Variaveis de Ambiente

Exigidas para o estado atual:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_WEBHOOK_URL` opcional

## Documentacao Operacional

- [AUTH_SETUP.md](./docs/AUTH_SETUP.md)
- [CRM_STABILITY_CHECKLIST.md](./docs/CRM_STABILITY_CHECKLIST.md)
- [IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md)
- [LEADS_CRM_COMPATIBILITY.md](./docs/LEADS_CRM_COMPATIBILITY.md)

## Proximas Evolucoes Seguras

- edicao de `pipeline_stage`
- observabilidade melhor do audit log de eventos
- endurecimento futuro de payload/tipagem da timeline

## Licenca

Projeto privado.
