# CRM Leads

Agrupa a estrutura atual da feature de leads do CRM.

## Papel da rota

- rota: `/crm/leads`
- responsabilidade: workspace operacional da base
- foco: triagem, filtros, tabela, kanban, detalhe do lead e acompanhamento individual

Subareas:

- `list/`: pagina de listagem, filtros, ordenacao, tabela, kanban e paginacao
- `detail/`: workspace do lead, timeline, notas, ownership e pipeline

Estado atual:

- `list/` concentra estado local, selectors e componentes da listagem
- `detail/` concentra a composicao da pagina e seus paineis menores
- os caminhos legados em `src/pages/crm/LeadsPage.tsx` e `src/pages/crm/LeadDetailPage.tsx` seguem disponiveis por re-export

## Relacao com as outras areas

- `/crm` aponta para Leads como continuidade dos proximos passos
- `/crm/operacao` aponta para Leads como continuidade da execucao comercial
- Analytics e Operacao removem densidade da home, mas a execucao detalhada continua centralizada aqui
