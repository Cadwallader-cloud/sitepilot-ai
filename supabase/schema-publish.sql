-- Run once in Supabase SQL Editor (publish columns)
alter table public.projects
  add column if not exists slug text,
  add column if not exists published_at timestamptz;

create unique index if not exists projects_slug_unique
  on public.projects (slug)
  where slug is not null;

create index if not exists projects_slug_idx
  on public.projects (slug)
  where published_at is not null;
