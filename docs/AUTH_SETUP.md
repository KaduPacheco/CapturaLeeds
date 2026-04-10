# Configuracao de Acesso ao CRM

O CRM autenticado usa Supabase Auth.

Estado atual:

- login funcional em `/crm/login`
- logout funcional
- qualquer usuario confirmado em `Authentication > Users` consegue acessar o CRM
- ainda nao existe RBAC por perfil ou organizacao

## Como criar um usuario de acesso

1. Acesse o projeto no Supabase Dashboard.
2. Abra `Authentication`.
3. Clique em `Add User`.
4. Crie um usuario com e-mail e senha.
5. Mantenha o usuario confirmado.

Se o fluxo de convite por e-mail estiver ativo, garanta que o usuario termine a confirmacao antes do smoke test.

## Acesso Local

- URL: `http://localhost:5173/crm/login`
- Credenciais: as mesmas criadas no Supabase Auth

## Escopo Atual de Acesso

No estado atual do projeto:

- `authenticated` pode entrar no CRM
- `public.leads` aceita `INSERT` de `anon`
- `public.leads` permite `SELECT` e `UPDATE` para `authenticated`
- tabelas auxiliares do detalhe do lead usam RLS para `authenticated`

## Validacao Manual Recomendada

- fazer login
- abrir `/crm/leads`
- abrir `/crm/leads/:id`
- criar nota
- criar tarefa
- concluir e reabrir tarefa
- sair do sistema

## Observacao de Seguranca

O acesso ainda nao diferencia admin de usuario comum. A proxima evolucao de seguranca planejada e RBAC/escopo mais restrito, mas isso ainda nao esta implementado.
