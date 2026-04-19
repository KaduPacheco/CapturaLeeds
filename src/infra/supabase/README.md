# Infra Supabase

Area reservada para infraestrutura compartilhada de acesso ao Supabase.

Objetivo atual:

- concentrar cliente, leitura de env publica e adaptadores de integracao tecnica
- separar infraestrutura de regras de negocio e features

Nesta etapa:

- `src/infra/supabase/client.ts` concentra o client singleton do frontend
- `src/infra/supabase/env.ts` concentra a leitura tipada e a validacao das variaveis publicas
- `src/lib/supabase.ts` permanece como fachada de compatibilidade para imports legados
