-- INFRAESTRUTURA CONSOLIDADA DO DETALHE DO LEAD (CRM)
-- Estado documental atual:
--   Este script documenta a infraestrutura esperada para o detalhe do lead,
--   incluindo RLS, FKs, indices e triggers auxiliares.
-- Objetivo:
--   Criar as tabelas auxiliares `lead_notes`, `lead_tasks` e `lead_events`
--   alinhadas ao frontend atual do CRM, sem qualquer impacto na landing.
--
-- Premissas:
--   1. `public.leads` ja existe e foi estendida para o CRM.
--   2. Nao ha RBAC complexo nesta etapa; o acesso e baseado em usuarios autenticados.
--   3. A landing publica nao usa nenhuma destas tabelas.
--   4. Para UUID, usamos `gen_random_uuid()` via `pgcrypto`, mais compativel com Supabase.
--   5. `lead_notes` e `lead_tasks` mantem `updated_at` via trigger.

BEGIN;

-- 0. Extensao para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Trigger helper para manter `updated_at`
-- Reusa o mesmo nome da migration de `leads`; `CREATE OR REPLACE` evita drift.
CREATE OR REPLACE FUNCTION public.set_row_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. lead_notes
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage lead notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Authenticated users can read lead notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Authenticated users can create lead notes" ON public.lead_notes;

CREATE POLICY "Authenticated users can read lead notes"
ON public.lead_notes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create lead notes"
ON public.lead_notes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id_created_at
ON public.lead_notes(lead_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_lead_notes_set_updated_at ON public.lead_notes;
CREATE TRIGGER trg_lead_notes_set_updated_at
BEFORE UPDATE ON public.lead_notes
FOR EACH ROW
EXECUTE FUNCTION public.set_row_updated_at();

-- 3. lead_tasks
CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage lead tasks" ON public.lead_tasks;
DROP POLICY IF EXISTS "Authenticated users can read lead tasks" ON public.lead_tasks;
DROP POLICY IF EXISTS "Authenticated users can create lead tasks" ON public.lead_tasks;
DROP POLICY IF EXISTS "Authenticated users can update their lead tasks" ON public.lead_tasks;

CREATE POLICY "Authenticated users can read lead tasks"
ON public.lead_tasks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create lead tasks"
ON public.lead_tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = assignee_id);

CREATE POLICY "Authenticated users can update their lead tasks"
ON public.lead_tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = assignee_id)
WITH CHECK (auth.uid() = assignee_id);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id_due_date
ON public.lead_tasks(lead_id, due_date);

DROP TRIGGER IF EXISTS trg_lead_tasks_set_updated_at ON public.lead_tasks;
CREATE TRIGGER trg_lead_tasks_set_updated_at
BEFORE UPDATE ON public.lead_tasks
FOR EACH ROW
EXECUTE FUNCTION public.set_row_updated_at();

-- 4. lead_events
CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view lead events" ON public.lead_events;
DROP POLICY IF EXISTS "Authenticated users can insert lead events" ON public.lead_events;
DROP POLICY IF EXISTS "Authenticated users can read lead events" ON public.lead_events;
DROP POLICY IF EXISTS "Authenticated users can create lead events" ON public.lead_events;

CREATE POLICY "Authenticated users can read lead events"
ON public.lead_events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create lead events"
ON public.lead_events
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id_created_at
ON public.lead_events(lead_id, created_at DESC);

COMMIT;

-- ROLLBACK MANUAL DESTA ETAPA
-- BEGIN;
-- DROP INDEX IF EXISTS public.idx_lead_events_lead_id_created_at;
-- DROP INDEX IF EXISTS public.idx_lead_tasks_lead_id_due_date;
-- DROP INDEX IF EXISTS public.idx_lead_notes_lead_id_created_at;
-- DROP POLICY IF EXISTS "Authenticated users can create lead events" ON public.lead_events;
-- DROP POLICY IF EXISTS "Authenticated users can read lead events" ON public.lead_events;
-- DROP POLICY IF EXISTS "Authenticated users can update their lead tasks" ON public.lead_tasks;
-- DROP POLICY IF EXISTS "Authenticated users can create lead tasks" ON public.lead_tasks;
-- DROP POLICY IF EXISTS "Authenticated users can read lead tasks" ON public.lead_tasks;
-- DROP POLICY IF EXISTS "Authenticated users can create lead notes" ON public.lead_notes;
-- DROP POLICY IF EXISTS "Authenticated users can read lead notes" ON public.lead_notes;
-- DROP TRIGGER IF EXISTS trg_lead_tasks_set_updated_at ON public.lead_tasks;
-- DROP TRIGGER IF EXISTS trg_lead_notes_set_updated_at ON public.lead_notes;
-- DROP TABLE IF EXISTS public.lead_events;
-- DROP TABLE IF EXISTS public.lead_tasks;
-- DROP TABLE IF EXISTS public.lead_notes;
-- COMMIT;
