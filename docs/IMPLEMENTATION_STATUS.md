# Status de Implementacao

Este documento consolida o estado real atualmente implementado no projeto.

## 1. Landing Publica

Estado:

- ativa e funcional em `/`
- isolada do contexto de autenticacao do CRM
- envio de leads via `src/services/leadService.ts`
- persistencia em `public.leads`
- integracao secundaria com webhook n8n sem bloquear o fluxo principal

Contrato preservado:

- `nome`
- `whatsapp`
- `email`
- `empresa`
- `funcionarios`
- `origem = 'landing_page'`
- `status = 'novo'`

## 2. CRM Autenticado

Rotas implementadas:

- `/crm/login`
- `/crm`
- `/crm/leads`
- `/crm/leads/:id`

Fluxos implementados:

- login com Supabase Auth
- listagem autenticada de leads
- detalhe do lead
- notas
- tarefas
- timeline de eventos
- logout

Hardening ja concluido:

- normalizacao segura de `due_date` antes de persistir `lead_tasks`
- feedback de erro no logout
- renderizacao defensiva para erros de timeline e tarefas

## 3. Supabase

### `public.leads`

Colunas CRM aplicadas:

- `owner_id`
- `pipeline_stage`
- `lifetime_value`
- `last_interaction_at`
- `updated_at`

Politicas atuais:

- `INSERT` para `anon`
- `SELECT` para `authenticated`
- `UPDATE` para `authenticated`

### Tabelas auxiliares

Existem e estao ativas:

- `public.lead_notes`
- `public.lead_tasks`
- `public.lead_events`

Garantias atuais:

- RLS ativo nas tres tabelas
- `lead_notes` com `SELECT` e `INSERT` para `authenticated`
- `lead_tasks` com `SELECT`, `INSERT` e `UPDATE` para `authenticated`
- `lead_events` com `SELECT` e `INSERT` para `authenticated`
- triggers de `updated_at` em `lead_notes` e `lead_tasks`

## 4. Validacoes Ja Executadas

Validado manualmente:

- landing continua captando
- listagem do CRM destravou
- detalhe do lead funciona
- nota funciona
- tarefa funciona
- conclusao e reabertura funcionam
- timeline registra eventos

Validado tecnicamente:

- build passando com `npm run build`
- protecao de rota sem sessao validada por teste

## 5. Pendencias Remanescentes

Pendencias reais atuais:

- futura edicao de `pipeline_stage`
- observabilidade melhor para falhas silenciosas de `logLeadEvent`
- endurecimento futuro da tipagem/renderizacao de payload da timeline

## 6. Fonte de Verdade

Quando houver divergencia entre documentacao antiga e o estado atual:

1. este arquivo deve prevalecer como resumo executivo
2. os arquivos SQL em `docs/sql/` devem prevalecer como referencia de infraestrutura
3. o codigo em `src/` deve prevalecer como implementacao final
