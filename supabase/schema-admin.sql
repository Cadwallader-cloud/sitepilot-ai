-- Crestis admin usage logs — run in Supabase SQL Editor once

create table if not exists public.api_usage (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  method text not null default 'POST',
  user_email text,
  status integer,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists api_usage_created_idx
  on public.api_usage (created_at desc);

create index if not exists api_usage_route_idx
  on public.api_usage (route, created_at desc);

create table if not exists public.openai_usage (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  model text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists openai_usage_created_idx
  on public.openai_usage (created_at desc);

alter table public.api_usage enable row level security;
alter table public.openai_usage enable row level security;
