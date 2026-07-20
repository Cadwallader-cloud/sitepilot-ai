-- Crestis billing — run in Supabase SQL Editor once (after schema.sql)
alter table public.projects
  add column if not exists plan text,
  add column if not exists stripe_session_id text;

comment on column public.projects.plan is 'starter | pro | unlimited after Stripe checkout';
