# CRM Frontend Current Map

## Objetivo desta nota

Registrar a arquitetura final do frontend do CRM apos a reorganizacao por feature, preservando uma referencia tecnica unica para futuras manutencoes.

## Topologia geral

- `/`
  - landing publica fora da arvore de auth do CRM
- `/crm/login`
  - pagina de login do CRM dentro do `AuthProvider`, mas sem `ProtectedRoute`
- `/crm`
  - dashboard executivo autenticado do CRM
- `/crm/analytics`
  - leitura analitica de aquisicao, conversao, canais e funil
- `/crm/operacao`
  - leitura comercial da carteira, pipeline e distribuicoes
- `/crm/leads`
  - workspace principal da listagem de leads
- `/crm/leads/:id`
  - detalhe operacional do lead
- `*`
  - fallback global para `NotFoundPage`

Fonte principal: `src/App.tsx`

## Arvore de rotas do CRM

1. `QueryClientProvider`
2. `TooltipProvider`
3. `BrowserRouter`
4. rota `/crm`
5. `AuthProvider`
6. rota `login`
7. `ProtectedRoute`
8. `CrmLayout`
9. paginas lazy de dashboard, analytics, operacao, leads e detalhe

Pontos preservados:

- `AuthProvider` continua acima de login e da area protegida
- `ProtectedRoute` continua protegendo apenas as rotas autenticadas
- `CrmLayout` continua encapsulando dashboard, analytics, operacao, leads e detalhe
- o lazy loading foi aplicado apenas nas paginas do CRM, sem alterar a ordem dos wrappers

## Politica atual de acesso

As permissoes continuam derivadas por `buildAuthAccess`, sem camada paralela de autorizacao.

Permissoes reconhecidas:

- `crm:access`
- `crm:dashboard:read`
- `crm:leads:read`
- `crm:leads:write`
- `crm:notes:write`
- `crm:tasks:write`

Aplicacao atual nas rotas:

- entrada do CRM
  - exige `crm:access`
- `/crm`, `/crm/analytics`, `/crm/operacao`
  - exigem `crm:dashboard:read`
- `/crm/leads` e `/crm/leads/:id`
  - exigem `crm:leads:read`

Aplicacao atual nas acoes do detalhe do lead:

- etapa e ownership
  - exigem `crm:leads:write`
- anotacoes
  - exigem `crm:notes:write`
- tarefas e follow-ups
  - exigem `crm:tasks:write`

Quando o usuario nao possui a permissao pedida, `ProtectedRoute` calcula o melhor fallback seguro a partir do proprio conjunto de permissoes.

## Organizacao final por feature

### `src/features/crm/auth`

Responsavel por autenticacao e autorizacao do CRM:

- `providers/AuthProvider.tsx`
- `hooks/useAuth.ts`
- `components/ProtectedRoute.tsx`
- `lib/authAccess.ts`
- `types/auth-access.ts`
- `types/auth-context.ts`

Compatibilidade legada mantida por re-export:

- `src/contexts/AuthContext.tsx`
- `src/contexts/auth-context.ts`
- `src/hooks/useAuth.ts`
- `src/components/auth/ProtectedRoute.tsx`
- `src/lib/authAccess.ts`

### `src/features/crm/leads/list`

Responsavel pela listagem de leads:

- `page/LeadsPage.tsx`
- `components/LeadsWorkspaceToolbar.tsx`
- `components/LeadsResultsTable.tsx`
- `components/LeadsKanbanBoard.tsx`
- `components/LeadsPaginationControls.tsx`
- `hooks/useLeadsListState.ts`
- `selectors/leadListSelectors.ts`

### `src/features/crm/leads/detail`

Responsavel pelo detalhe e workspace do lead:

- `page/LeadDetailPage.tsx`
- componentes de header, identidade, pipeline, ownership, tasks, timeline, quick note e resumo operacional
- `hooks/useLeadDetailDrafts.ts`
- `hooks/useLeadWorkspace.ts`
- `selectors/leadDetailSelectors.ts`

### `src/features/crm/dashboard`

Responsavel pela home executiva do CRM:

- `page/DashboardPage.tsx`
- componentes de leitura rapida, atividade, atencao, follow-ups e atalhos
- `useCrmDashboardData.ts` como orquestrador de datasets e builders reutilizados

### `src/features/crm/analytics`

Responsavel pela leitura analitica da aquisicao:

- `page/AnalyticsPage.tsx`
- componentes de KPI, timeline, funil, origem do trafego e comparativos de canal
- reaproveita o mesmo `useCrmDashboardData.ts` sem alterar query keys ou services

### `src/features/crm/operacao`

Responsavel pela leitura comercial da carteira:

- `page/OperacaoPage.tsx`
- componentes de pipeline, distribuicao por estagio e origem comercial
- reaproveita os mesmos datasets do dashboard para leitura operacional isolada

### `src/features/crm/shared`

Nucleo compartilhado do CRM:

- `types/`: `crm.ts`, `dashboard.ts`, `auth-access.ts`
- `permissions/`: `authAccess.ts`
- `queryKeys/`: `crmQueryKeys.ts`
- `constants/`: `routes.ts`
- `formatters/`: `dateTime.ts`

## Infraestrutura

### `src/infra`

Camada de infraestrutura reutilizavel:

- `supabase/client.ts`: client singleton do Supabase
- `supabase/env.ts`: leitura tipada e validacao das envs publicas

Compatibilidade preservada:

- `src/lib/supabase.ts` continua existindo como fachada segura

## Servicos e contratos

Os services permanecem como camada de acesso a dados e nao foram reorganizados para dentro de `features`:

- `src/services/crmService.ts`
- `src/services/dashboardService.ts`

No dashboard, o service foi fatiado internamente, mas segue exposto por uma fachada de compatibilidade em `src/services/dashboardService.ts`.

## Query keys criticas

As query keys foram centralizadas em:

- `src/features/crm/shared/queryKeys/crmQueryKeys.ts`

Valores preservados:

- `["crm-leads"]`
- `["crm-leads-task-overview"]`
- `["crm-lead", leadId]`
- `["crm-owner-ids"]`
- `["crm-lead-notes", leadId]`
- `["crm-lead-events", leadId]`
- `["crm-lead-tasks", leadId]`
- `["crm-dashboard", "leads"]`
- `["crm-dashboard", "tasks"]`
- `["crm-dashboard", "events"]`
- `["crm-dashboard", "analytics"]`

## Papel atual de cada area do produto

- `/crm`
  - dashboard executivo
  - foco em visao geral, alertas, atividade recente e proximos passos
- `/crm/analytics`
  - area analitica
  - foco em performance da landing, trafego, conversao, funil e canais
- `/crm/operacao`
  - area operacional e comercial
  - foco em pipeline, distribuicoes e leitura da carteira
- `/crm/leads`
  - workspace operacional da base
  - foco em filtros, tabela, kanban, detalhe, notas, tarefas e timeline

## Regras de compatibilidade preservadas

- o CRM continua separado da landing publica na arvore de rotas
- o auth flow continua usando sessao inicial mais `onAuthStateChange` do Supabase
- `buildAuthAccess` continua sendo a fonte de verdade de permissao no frontend
- `useLeadWorkspace` continua invalidando as mesmas query keys
- tipos compartilhados continuam acessiveis pelos caminhos legados `src/types/crm.ts` e `src/types/dashboard.ts`
- helpers antigos continuam disponiveis por fachadas e re-exports quando isso reduz risco de migracao

## Lazy loading do CRM

As paginas abaixo sao carregadas via `React.lazy`:

- `LoginPage`
- `DashboardPage`
- `AnalyticsPage`
- `OperacaoPage`
- `LeadsPage`
- `LeadDetailPage`

O fallback continua simples e seguro, sem alterar fluxo de sessao, redirecionamento ou layout.
