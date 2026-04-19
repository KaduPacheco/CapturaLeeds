# Checklist de Estabilidade: Landing Page vs. CRM

Este checklist deve ser consultado antes de cada nova etapa de desenvolvimento do CRM para garantir que a captura pública de leads permaneça funcional.

## 🛡️ Regras de Ouro
1. **NUNCA** mude o nome de colunas existentes na tabela `leads` sem atualizar o `leadService.ts`.
2. **NUNCA** adicione colunas `NOT NULL` sem um valor `DEFAULT` na tabela `leads`.
3. **NUNCA** desative a policy de `INSERT` para o role `anon`.
4. **NUNCA** altere a `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` sem testar o formulário público imediatamente.

## ✅ Teste de Sanidade (Smoke Test)
Sempre que houver mudanças no banco ou no sistema de autenticação, realize este teste manual:
- [ ] Acessar a Home (`/`).
- [ ] Scroll até o formulário de contato.
- [ ] Preencher com dados de teste.
- [ ] Clicar em "Quero testar agora".
- [ ] Verificar se o Toast de sucesso aparece.
- [ ] Verificar no Dashboard do Supabase se o lead foi criado com `origem = 'landing_page'`.

## 🚨 Sinais de Alerta
- Erro `401 Unauthorized` ou `403 Forbidden` no console ao enviar o formulário: **RLS bloqueando o role anon.**
- Erro `400 Bad Request` com mensagem de "property X is missing": **Campo obrigatório adicionado ao banco sem default/not-null.**
- Erro de CORS no console: **Mudança indevida nas configurações de domínio do Supabase.**

## 🔄 Procedimento de Rollback
1. Reverter alterações de SQL no Supabase (Rodar script de remoção de RLS temporário se necessário: `ALTER TABLE leads DISABLE ROW LEVEL SECURITY;`).
2. Reverter código para o commit estável anterior.
