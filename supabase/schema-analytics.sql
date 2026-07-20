-- Crestis site analytics — run in Supabase SQL Editor once (after schema.sql)
-- Safe to re-run.

create extension if not exists "pgcrypto";

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

-- FK only if projects exists (avoids hard fail on empty DBs)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'projects'
  ) and not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'analytics_events'
      and constraint_name = 'analytics_events_project_id_fkey'
  ) then
    alter table public.analytics_events
      add constraint analytics_events_project_id_fkey
      foreign key (project_id) references public.projects (id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from information_schema.constraint_column_usage
    where table_schema = 'public'
      and table_name = 'analytics_events'
      and constraint_name = 'analytics_events_type_check'
  ) then
    alter table public.analytics_events
      add constraint analytics_events_type_check
      check (
        event_type in (
          'page_view',
          'contact_click',
          'phone_click',
          'maps_click'
        )
      );
  end if;
end $$;

create index if not exists analytics_events_project_created_idx
  on public.analytics_events (project_id, created_at desc);

create index if not exists analytics_events_project_type_idx
  on public.analytics_events (project_id, event_type);

alter table public.analytics_events enable row level security;
