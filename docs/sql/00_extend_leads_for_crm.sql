-- EVOLUCAO SEGURA DA TABELA LEADS (ETAPA 2 CRM)
-- Estado documental atual:
--   Este script representa a migracao usada para compatibilizar `public.leads`
--   com o CRM sem quebrar a landing publica.
-- Objetivo:
--   Estender a tabela compartilhada `public.leads` com os campos esperados
--   pelo CRM atual, sem quebrar o INSERT anonimo da landing page.
--
-- Regras desta migration:
--   1. Nao alterar o contrato atual da landing.
--   2. Novas colunas permanecem nullable, exceto `updated_at`, que recebe
--      default seguro e trigger de manutencao automatica.
--   3. Nao aplicar RLS novo aqui. Esta etapa trata apenas compatibilidade
--      de schema da tabela `leads`.
--   4. Nao criar indices extras sem uso real no frontend atual.

BEGIN;

-- 1. Novas colunas esperadas pelo tipo `CrmLead`
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS owner_id UUID,
  ADD COLUMN IF NOT EXISTS pipeline_stage TEXT,
  ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- 2. Backfill seguro de `updated_at`
-- Mantem coerencia para registros antigos sem assumir que toda linha ja tem
-- esse campo populado.
UPDATE public.leads
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;

-- 3. Default seguro para inserts legados e futuros
ALTER TABLE public.leads
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

-- 4. Foreign key opcional de ownership
-- `owner_id` precisa permanecer nullable para nao quebrar capturas antigas
-- nem exigir atribuicao imediata no CRM.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leads_owner_id_fkey'
      AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_owner_id_fkey
      FOREIGN KEY (owner_id)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Trigger leve para manter `updated_at` correto em updates futuros
-- A mesma funcao pode ser reutilizada pelas tabelas auxiliares do CRM.
CREATE OR REPLACE FUNCTION public.set_row_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_leads_set_updated_at'
      AND tgrelid = 'public.leads'::regclass
  ) THEN
    CREATE TRIGGER trg_leads_set_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.set_row_updated_at();
  END IF;
END $$;

COMMIT;

-- ROLLBACK MANUAL DESTA ETAPA
-- Execute apenas se ainda nao houver codigo ou dados dependendo dos campos novos.
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS trg_leads_set_updated_at ON public.leads;
-- DROP FUNCTION IF EXISTS public.set_row_updated_at();
-- ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_owner_id_fkey;
-- ALTER TABLE public.leads
--   DROP COLUMN IF EXISTS owner_id,
--   DROP COLUMN IF EXISTS pipeline_stage,
--   DROP COLUMN IF EXISTS lifetime_value,
--   DROP COLUMN IF EXISTS last_interaction_at,
--   DROP COLUMN IF EXISTS updated_at;
-- COMMIT;
