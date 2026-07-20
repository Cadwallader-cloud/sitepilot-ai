-- Crestis payment wallets: deposit addresses live in DB (not env / not redeploy).
-- Admin edits at /admin#wallets. Checkout reads the active row per currency+network.

create table if not exists public.payment_wallets (
  id uuid primary key default gen_random_uuid(),
  currency text not null check (currency in ('USDT', 'USDC', 'BTC')),
  network text not null check (network in ('TRC20', 'POLYGON', 'BITCOIN')),
  address text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_wallets_currency_network_unique unique (currency, network)
);

create index if not exists payment_wallets_active_idx
  on public.payment_wallets (active)
  where active = true;

comment on table public.payment_wallets is
  'Crypto deposit wallets: change address/active without redeploying the app';

alter table public.payment_wallets enable row level security;

-- Skeleton rows (inactive, empty address). Admin fills real addresses in the panel.
insert into public.payment_wallets (currency, network, address, active)
values
  ('USDT', 'TRC20', '', false),
  ('USDC', 'POLYGON', '', false),
  ('BTC', 'BITCOIN', '', false)
on conflict (currency, network) do nothing;
