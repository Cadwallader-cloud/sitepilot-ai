-- Migrate existing Crestis billing → Free / Pro / Business
-- Safe to re-run. Migrates legacy "unlimited" → "business".

alter table public.plans
  add column if not exists can_use_ai_editing boolean not null default false;
alter table public.plans
  add column if not exists can_use_business_features boolean not null default false;

insert into public.plans (
  id, name, description, price_label,
  can_publish, can_use_analytics, can_use_custom_domain, can_use_unlimited_projects,
  can_use_ai_editing, can_use_business_features,
  max_projects, sort_order, active
) values (
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

update public.subscriptions set plan_id = 'business' where plan_id = 'unlimited';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'plan'
  ) then
    update public.projects set plan = 'business' where plan = 'unlimited';
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'crypto_orders'
  ) then
    update public.crypto_orders set plan_id = 'business' where plan_id = 'unlimited';
  end if;
end $$;

update public.plans set
  name = 'Free',
  description = '1 website - preview and draft editing',
  price_label = 'Free',
  can_publish = false,
  can_use_analytics = false,
  can_use_custom_domain = false,
  can_use_unlimited_projects = false,
  can_use_ai_editing = false,
  can_use_business_features = false,
  max_projects = 1,
  sort_order = 0,
  active = true
where id = 'free';

update public.plans set
  name = 'Pro',
  description = 'Unlimited websites, publish, domains, analytics, AI editing',
  price_label = 'Pro',
  can_publish = true,
  can_use_analytics = true,
  can_use_custom_domain = true,
  can_use_unlimited_projects = true,
  can_use_ai_editing = true,
  can_use_business_features = false,
  max_projects = null,
  sort_order = 1,
  active = true
where id = 'pro';

update public.plans set
  active = false,
  description = 'Legacy - migrated to Business',
  sort_order = 99
where id = 'unlimited';
