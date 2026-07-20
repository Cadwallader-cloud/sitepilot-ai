-- Multi-tenant publishing — run once in Supabase SQL Editor
-- Adds owner_id, custom_domain, published while keeping user_email / published_at.

alter table public.projects
  add column if not exists owner_id text,
  add column if not exists custom_domain text,
  add column if not exists published boolean not null default false;

-- Backfill from existing rows
update public.projects
set owner_id = lower(user_email)
where owner_id is null;

update public.projects
set published = true
where published_at is not null and published = false;

create index if not exists projects_owner_id_idx
  on public.projects (owner_id);

create unique index if not exists projects_custom_domain_unique
  on public.projects (custom_domain)
  where custom_domain is not null;

create index if not exists projects_published_slug_idx
  on public.projects (slug)
  where published = true;

create index if not exists projects_published_domain_idx
  on public.projects (custom_domain)
  where published = true and custom_domain is not null;

comment on column public.projects.owner_id is 'Tenant owner (email) — synced with user_email';
comment on column public.projects.custom_domain is 'Optional apex/www hostname, e.g. www.acmeroofing.com';
comment on column public.projects.published is 'True when site is publicly live';
