# CRM Stage 0 Baseline

Resumo tecnico criado antes de reorganizacoes maiores no frontend do CRM.

## Escopo atual do sistema

- landing publica em `/`
- CRM autenticado em `/crm`
- rotas ativas do CRM:
  - `/crm`
  - `/crm/analytics`
  - `/crm/operacao`
  - `/crm/leads`
  - `/crm/leads/:id`

## Fluxos criticos preservados

- autenticacao e guard de acesso via `AuthProvider` e `ProtectedRoute`
- leitura de permissao via `buildAuthAccess` e `hasPermission`
- captura de leads da landing via `leadService`
- tracking analitico via `analyticsService`
- leitura operacional e mutacoes do workspace de lead via `crmService` e `useLeadWorkspace`
- agregacoes executivas do CRM via builders puros de `dashboard.selectors`

## Regras puras com cobertura prioritaria

- auth:
  - `buildAuthAccess`
  - `hasPermission`
- apresentacao operacional de leads:
  - `getLeadStageValue`
  - `getLeadStageLabel`
  - `buildLeadTaskSummary`
  - `paginateCollection`
  - `filterLeadRows`
  - `sortLeadRows`
- dashboard:
  - KPIs de leads e tarefas
  - distribuicoes de pipeline e origem
  - attention panel
  - builders de analytics consolidados por `dashboardService`

## Arquivos-base auditados nesta etapa

- `src/App.tsx`
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/contexts/auth-context.ts`
- `src/hooks/useAuth.ts`
- `src/components/auth/ProtectedRoute.tsx`
- `src/lib/authAccess.ts`
- `src/lib/crmLeadPresentation.ts`
- `src/hooks/useLeadWorkspace.ts`
- `src/services/crmService.ts`
- `src/services/dashboardService.ts`
- `src/services/leadService.ts`
- `src/services/analyticsService.ts`
- `src/types/crm.ts`
- `src/types/dashboard.ts`
- `src/tests/setup.ts`

## Validacao minima esperada antes de etapas maiores

- `npm run build`
- `npm run test`

## Limites desta etapa

- sem alteracao de regra de negocio
- sem reorganizacao de arquitetura
- sem mudanca visual
- sem alteracao de backend, schema, RLS ou integracao externa
