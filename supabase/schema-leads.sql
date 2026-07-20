-- Crestis early-access leads — run once in Supabase SQL Editor

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

comment on table public.leads is 'Early access / Request Access form submissions';

alter table public.leads enable row level security;
