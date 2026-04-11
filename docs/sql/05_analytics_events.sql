create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in (
      'page_view',
      'cta_click',
      'lead_form_start',
      'lead_form_submit_attempt',
      'lead_form_submit_success',
      'lead_form_submit_error'
    )
  ),
  visitor_id text not null,
  session_id text not null,
  page_path text not null,
  page_url text not null,
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  utm_term text null,
  utm_content text null,
  occurred_at timestamptz not null default now(),
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_occurred_at_idx on public.analytics_events (occurred_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_event_name_occurred_at_idx on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_session_id_idx on public.analytics_events (session_id);
create index if not exists analytics_events_visitor_id_idx on public.analytics_events (visitor_id);
create index if not exists analytics_events_utm_source_idx on public.analytics_events (utm_source);
create index if not exists analytics_events_payload_gin_idx on public.analytics_events using gin (event_payload);

grant usage on schema public to anon, authenticated, service_role;
grant insert on table public.analytics_events to anon, authenticated;
grant select on table public.analytics_events to authenticated, service_role;

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_events_insert_public" on public.analytics_events;
create policy "analytics_events_insert_public"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "analytics_events_select_authenticated" on public.analytics_events;
create policy "analytics_events_select_authenticated"
  on public.analytics_events
  for select
  to authenticated
  using (true);

comment on table public.analytics_events is
  'Eventos de analytics da landing. Permite medir visitas, interacoes e conversoes ate o envio do lead.';
