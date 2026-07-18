-- Crestis projects — run in Supabase SQL Editor once
create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  business_name text not null,
  input jsonb not null,
  site jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_email_idx
  on public.projects (user_email);

create index if not exists projects_updated_at_idx
  on public.projects (updated_at desc);

alter table public.projects enable row level security;

-- App uses the service role on the server (NextAuth), so no public policies.
-- Deny anon/authenticated direct table access by default.
