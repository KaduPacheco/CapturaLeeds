-- RLS DOCUMENTADO PARA `public.leads`
-- Estado atual validado:
--   - INSERT para anon
--   - SELECT para authenticated
--   - UPDATE para authenticated

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public leads are viewable by everyone" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.leads;
DROP POLICY IF EXISTS "Enable all access for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

CREATE POLICY "Enable insert for anonymous users"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated users can read leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.leads ALTER COLUMN origem SET DEFAULT 'landing_page';
ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'novo';
ALTER TABLE public.leads ALTER COLUMN created_at SET DEFAULT now();

-- Guardrail permanente:
-- qualquer coluna nova do CRM em `public.leads` deve ser nullable ou ter
-- default seguro para nao quebrar a captura publica.
