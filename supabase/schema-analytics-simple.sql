-- Minimal analytics table — paste this if the full script failed

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  event_type text not null,
  path text,
  visitor_id text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_project_created_idx
  on public.analytics_events (project_id, created_at desc);

create index if not exists analytics_events_project_type_idx
  on public.analytics_events (project_id, event_type);
