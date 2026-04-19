# CRM Shared

Area compartilhada entre features do CRM.

Conteudo atual:

- `types/`
  - contratos compartilhados de CRM, dashboard e auth access
- `permissions/`
  - regras puras de autorizacao do frontend
- `queryKeys/`
  - chaves centralizadas do cache do CRM
- `constants/`
  - constantes transversais como rotas do CRM
- `formatters/`
  - formatadores compartilhados de apresentacao
- `components/`
  - shells, secoes e cards reutilizados entre dashboard, analytics e operacao
- `layout/`
  - layout principal e navegacao autenticada do CRM

Compatibilidade:

- os caminhos antigos de tipos e auth continuam existindo por re-export quando isso reduz risco
- os valores publicos de query keys e contratos foram preservados

Principio de reaproveitamento:

- tudo que representa estrutura compartilhada de pagina fica em `shared/`
- tudo que representa leitura especializada de rota fica em `dashboard/`, `analytics/`, `operacao/` ou `leads/`
