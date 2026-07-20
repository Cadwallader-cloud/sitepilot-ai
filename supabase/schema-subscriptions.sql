-- Crestis billing (provider-agnostic) — run once in Supabase SQL Editor
-- Plans define entitlements. Subscriptions bind a user (email) to a plan.
-- Payment providers (crypto, Polar, invoices) plug in later via provider_* only.

create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text not null default '',
  price_label text not null default 'Free',
  can_publish boolean not null default false,
  can_use_analytics boolean not null default false,
  can_use_custom_domain boolean not null default false,
  can_use_unlimited_projects boolean not null default false,
  can_use_ai_editing boolean not null default false,
  can_use_business_features boolean not null default false,
  max_projects integer,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.plans is 'Catalog of product plans / entitlements (not tied to a payment provider)';
comment on column public.plans.max_projects is 'Null means unlimited when can_use_unlimited_projects is true';

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  plan_id text not null references public.plans (id),
  status text not null default 'active'
    check (status in ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
  provider text,
  provider_subscription_id text,
  provider_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_email_unique unique (user_email)
);

create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

comment on table public.subscriptions is 'One subscription row per user email; source of truth for entitlements';
comment on column public.subscriptions.provider is 'null | manual | crypto | polar | invoice — business logic ignores this';

alter table public.subscriptions enable row level security;
alter table public.plans enable row level security;

-- Seed Free / Pro / Business
insert into public.plans (
  id, name, description, price_label,
  can_publish, can_use_analytics, can_use_custom_domain, can_use_unlimited_projects,
  can_use_ai_editing, can_use_business_features,
  max_projects, sort_order, active
) values
  (
    'free',
    'Free',
    '1 website — preview and draft editing',
    'Free',
    false, false, false, false,
    false, false,
    1,
    0,
    true
  ),
  (
    'pro',
    'Pro',
    'Unlimited websites, publish, domains, analytics, AI editing',
    'Pro',
    true, true, true, true,
    true, false,
    null,
    1,
    true
  ),
  (
    'business',
    'Business',
    'Everything in Pro plus team, white label, API, priority support',
    'Business',
    true, true, true, true,
    true, true,
    null,
    2,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_label = excluded.price_label,
  can_publish = excluded.can_publish,
  can_use_analytics = excluded.can_use_analytics,
  can_use_custom_domain = excluded.can_use_custom_domain,
  can_use_unlimited_projects = excluded.can_use_unlimited_projects,
  can_use_ai_editing = excluded.can_use_ai_editing,
  can_use_business_features = excluded.can_use_business_features,
  max_projects = excluded.max_projects,
  sort_order = excluded.sort_order,
  active = excluded.active;
