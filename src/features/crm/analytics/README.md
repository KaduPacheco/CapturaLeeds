# CRM Analytics

Referencia tecnica da area analitica do CRM.

## Papel da rota

- rota: `/crm/analytics`
- responsabilidade: concentrar a leitura de aquisicao e conversao da landing
- objetivo: remover a carga analitica detalhada do dashboard executivo sem alterar dados, calculos ou contratos

## Componentes principais

- `page/AnalyticsPage.tsx`
  - compoe a hierarquia completa da rota
- `components/AnalyticsTimelineChart.tsx`
  - serie temporal de visitors, conversoes e taxa
- `components/TrafficVsLeadsChart.tsx`
  - comparativo entre trafego e leads por canal
- `components/AnalyticsSourcesChart.tsx`
  - origem do trafego
- `components/AnalyticsFunnelChart.tsx`
  - funil de conversao

## Reaproveitamento

- os KPIs continuam sendo montados por `useCrmDashboardData`
- `KpiCard`, `DashboardSection`, `DashboardSurface` e `SectionStates` sao compartilhados via `shared/components/`
- a pagina nao cria services proprios nem altera o fluxo de dados existente

## Principios de UI

- graficos como protagonistas
- comparacoes lado a lado apenas quando a largura comporta
- linguagem objetiva orientada a performance
- pouca competicao entre helper text e dado principal

## Restricoes mantidas

- nenhuma mudanca em backend, auth, query keys, services ou contratos
- a pagina existe apenas como redistribuicao de contexto
