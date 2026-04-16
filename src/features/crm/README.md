# CRM Features

Esta pasta concentra a arquitetura atual do frontend do CRM organizada por feature e por contexto de uso.

## Mapa de rotas

- `/crm`
  - papel: dashboard executivo
  - foco: situacao atual, prioridades, atividade e atalhos
- `/crm/analytics`
  - papel: leitura analitica da aquisicao
  - foco: trafego, conversao, funil e origem do trafego
- `/crm/operacao`
  - papel: leitura comercial da carteira
  - foco: pipeline, distribuicao por estagio e distribuicao por origem comercial
- `/crm/leads`
  - papel: workspace operacional da base
  - foco: filtros, tabela, kanban, detalhe do lead e acompanhamento individual

## Organizacao atual

- `auth/`
  - autenticacao, guards e contexto de acesso do CRM
- `dashboard/`
  - pagina e componentes do dashboard executivo
  - hook de orquestracao `useCrmDashboardData`
- `analytics/`
  - pagina e componentes analiticos ligados a aquisicao e conversao
- `operacao/`
  - pagina e componentes da leitura comercial da carteira
- `leads/`
  - workspace operacional da base, dividido entre `list/` e `detail/`
- `shared/`
  - componentes estruturais, layout, constantes, tipos, query keys, permissoes e formatters reutilizados

## Reaproveitamento entre areas

- `useCrmDashboardData` continua como ponto unico de orquestracao dos dados usados por dashboard, analytics e operacao
- `shared/components/`
  - `DashboardSection`
  - `DashboardSurface`
  - `KpiCard`
  - `SectionStates`
- `shared/layout/CrmLayout.tsx`
  - layout principal e navegacao da area autenticada do CRM

Esse desenho preserva:

- query keys
- contracts de dados
- services e builders
- auth flow
- rotas publicas ja estabilizadas

## Controle de acesso atual

- `buildAuthAccess` continua derivando o conjunto de permissoes a partir da sessao do usuario
- `ProtectedRoute` aplica as permissoes por rota sem criar um sistema novo de autorizacao
- dashboard, analytics e operacao exigem `crm:dashboard:read`
- leads e detalhe do lead exigem `crm:leads:read`
- acoes mutaveis do detalhe do lead respeitam `crm:leads:write`, `crm:notes:write` e `crm:tasks:write`
- o layout principal mostra apenas navegacoes que o usuario autenticado pode acessar com o conjunto atual de permissoes

## Principios de UI adotados

- separacao por contexto de uso: cada rota responde a uma pergunta operacional diferente
- dashboard mais executivo: menos densidade e mais decisao rapida
- analytics como area propria: graficos e series com protagonismo
- operacao como area propria: pipeline e carteira sem competir com aquisicao
- leads como workspace: execucao detalhada fora do dashboard
- consistencia visual: mesma base de cascas, grids, titulos e estados vazios e erro

## Compatibilidade

- `src/pages/crm/*.tsx` permanecem como entrypoints de rota e podem atuar como wrappers quando necessario
- `src/components/layout/CrmLayout.tsx` pode continuar existindo como ponto de compatibilidade para imports legados
- a landing publica continua fora desta pasta
- as paginas do CRM continuam lazy-loaded em `src/App.tsx`
- `src/infra/` continua concentrando adaptadores como o client do Supabase
