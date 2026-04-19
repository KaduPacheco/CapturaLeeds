# CRM Operacao

Referencia tecnica da area operacional e comercial do CRM.

## Papel da rota

- rota: `/crm/operacao`
- responsabilidade: concentrar a leitura estrutural da carteira comercial
- objetivo: separar pipeline e distribuicoes comerciais do dashboard executivo

## Componentes principais

- `page/OperacaoPage.tsx`
  - compoe a hierarquia da rota
- `components/PipelineChart.tsx`
  - distribuicao por estagio
- `components/SourceChart.tsx`
  - distribuicao por origem comercial

## Reaproveitamento

- os indicadores operacionais seguem vindo de `useCrmDashboardData`
- `KpiCard`, `DashboardSection`, `DashboardSurface` e `SectionStates` sao compartilhados via `shared/components/`
- o acesso para `/crm/leads` foi mantido como continuidade natural da execucao comercial

## Principios de UI

- leitura direta de carteira
- menos texto redundante
- charts com mais espaco util
- mesma base visual de dashboard e analytics para manter consistencia

## Restricoes mantidas

- nenhuma mudanca em backend, auth, query keys, services ou contratos
- a pagina so reorganiza o contexto de leitura da operacao
