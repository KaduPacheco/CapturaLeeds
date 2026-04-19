# CRM Dashboard

Referencia tecnica da area executiva do CRM.

## Papel da rota

- rota: `/crm`
- responsabilidade: visao geral de decisao rapida
- foco: situacao atual, prioridades, atividade e proximos passos

## Estrutura atual

- pagina principal em `page/DashboardPage.tsx`
- componentes da feature em `components/`
- datasets e builders continuam expostos por `src/services/dashboardService.ts`
- orquestracao de dados em `src/features/crm/dashboard/useCrmDashboardData.ts`
- wrappers legados podem continuar disponiveis em `src/pages/crm/DashboardPage.tsx` e `src/components/crm/dashboard/`
- internamente, o dashboard service foi fatiado em:
  - `src/services/dashboard/dashboard.api.ts`
  - `src/services/dashboard/dashboard.selectors.ts`
  - `src/services/dashboard/dashboard.constants.ts`
  - `src/services/dashboard/dashboard.formatters.ts`

## Arquitetura visual final

O dashboard foi reorganizado como uma sequencia de camadas com papeis visuais distintos. A intencao nao foi mudar o comportamento da tela, e sim redistribuir o conteudo para melhorar hierarquia, escaneabilidade e conforto visual.

### 1. Hero executivo

Responsabilidade:

- introduzir a leitura do dashboard
- mostrar contexto da sessao
- manter um CTA unico para a base operacional

### 2. KPIs principais

Responsabilidade:

- concentrar os indicadores mais importantes no primeiro bloco util da pagina
- separar visao comercial e visao analitica sem misturar tudo em uma unica grade

### 3. Atencao e atividade

Responsabilidade:

- fechar a pagina com o que exige acao, contexto recente e leitura operacional curta
- separar prioridade, fila imediata e historico recente

## Componentes estruturais

Os componentes abaixo funcionam como base de composicao do dashboard:

- `DashboardSection`
- `DashboardSurface`
- `KpiCard`
- `AttentionPanel`
- `UpcomingTasksList`
- `RecentLeadsList`
- `ActivityFeed`

## Principios de UI adotados

- hierarquia em camadas: cada faixa da pagina tem um papel explicito
- prioridade visual progressiva: hero, KPIs, analytics, operacao, atencao
- menos competicao no primeiro viewport: menos blocos fortes ao mesmo tempo
- graficos como protagonistas: resumos e breakdowns laterais ficam mais compactos
- listas mais escaneaveis: menos caixas internas, mais respiro e metadados agrupados
- consistencia sem monotonia: mesma base de borda, raio, espacamento e tipografia, com pesos diferentes por camada

## Restricoes arquiteturais mantidas

- nenhuma camada visual altera query keys, services, auth, rotas ou contratos de dados
- os componentes continuam consumindo os mesmos builders e tipos ja expostos
- a reorganizacao visual permanece desacoplada da logica de negocio
