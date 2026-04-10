# Checklist de Estabilidade: Landing + CRM

Este checklist serve como guardrail para qualquer nova etapa do projeto.

## Regras de Ouro

1. Nunca quebrar o `INSERT` anonimo da landing em `public.leads`.
2. Nunca adicionar campo `NOT NULL` em `public.leads` sem `DEFAULT` seguro.
3. Nunca alterar `LeadForm.tsx` ou `leadService.ts` sem necessidade extrema.
4. Nunca mudar `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` sem revalidar a landing imediatamente.
5. Nunca assumir que uma migration foi aplicada: sempre validar no Supabase e na API.

## Smoke Test Minimo

### Landing publica

- [ ] acessar `/`
- [ ] enviar lead de teste
- [ ] confirmar sucesso visual
- [ ] confirmar lead salvo com `origem = 'landing_page'`

### CRM autenticado

- [ ] login em `/crm/login`
- [ ] abrir `/crm/leads`
- [ ] abrir `/crm/leads/:id`
- [ ] criar nota
- [ ] criar tarefa
- [ ] concluir tarefa
- [ ] reabrir tarefa
- [ ] verificar timeline
- [ ] sair do sistema

## Estado Validado Atual

Ja validados manualmente:

- login
- listagem de leads
- detalhe do lead
- notas
- tarefas
- timeline
- logout
- landing publica isolada

## Sinais de Alerta

- `PGRST205`: tabela nao visivel no schema cache
- `401` ou `403` no envio publico: RLS da landing quebrado
- `400` por campo ausente: drift de schema na tabela `leads`
- data de tarefa exibida em dia errado: risco de timezone em `due_date`

## Rollback Operacional

1. parar a etapa atual
2. isolar se o problema e landing ou CRM
3. preservar primeiro a captura publica
4. reverter apenas a ultima mudanca conhecida e pequena
