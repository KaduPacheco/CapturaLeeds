# Compatibilidade de `public.leads` com Landing + CRM

Este documento registra o contrato atual da tabela compartilhada `public.leads`.

## Estado Atual

`public.leads` hoje atende simultaneamente:

- a landing publica
- o CRM autenticado

Colunas CRM aplicadas:

- `owner_id`
- `pipeline_stage`
- `lifetime_value`
- `last_interaction_at`
- `updated_at`

## O que permanece preservado

- `INSERT` anonimo da landing
- payload de `src/services/leadService.ts`
- captura publica isolada da autenticacao do CRM
- contrato visual e funcional da landing

## Politicas atuais

Em `public.leads`:

- `INSERT` para `anon`
- `SELECT` para `authenticated`
- `UPDATE` para `authenticated`

## Decisoes de retrocompatibilidade

- `owner_id`, `pipeline_stage`, `lifetime_value` e `last_interaction_at` permanecem nullable
- `updated_at` possui `DEFAULT now()` e trigger
- a landing continua sem precisar conhecer campos do CRM

## Arquivos de referencia

- `docs/sql/00_extend_leads_for_crm.sql`
- `docs/sql/01_rls_leads.sql`

## Rollback

Qualquer rollback em `public.leads` deve preservar primeiro:

- o `INSERT` anonimo da landing
- as colunas legadas usadas pela captura publica
- os dados ja gravados pelo CRM
