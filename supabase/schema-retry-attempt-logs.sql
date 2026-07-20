-- Crestis retry attempt logs — admin observability
-- Module / Attempt / Duration / Tokens / Cost / Passed / Error

create table if not exists public.retry_attempt_logs (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  attempt integer not null,
  duration_ms integer not null default 0,
  tokens integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  passed boolean not null default false,
  error text,
  run_id text,
  user_email text,
  created_at timestamptz not null default now()
);

create index if not exists retry_attempt_logs_created_idx
  on public.retry_attempt_logs (created_at desc);

create index if not exists retry_attempt_logs_module_idx
  on public.retry_attempt_logs (module, created_at desc);

create index if not exists retry_attempt_logs_run_idx
  on public.retry_attempt_logs (run_id, attempt);

alter table public.retry_attempt_logs enable row level security;
