-- Crestis Crypto Billing Phase 1 — run once in Supabase SQL Editor
-- Manual admin approval now; webhook automation later via provider_* + fulfillCryptoOrder().

create table if not exists public.crypto_orders (
  id uuid primary key default gen_random_uuid(),
  -- Human-friendly unique reference shown at checkout
  order_ref text not null,
  user_email text not null,
  plan_id text not null default 'pro' references public.plans (id),
  -- Asset + network
  asset text not null check (asset in ('USDT', 'USDC', 'BTC')),
  network text not null check (network in ('TRC20', 'POLYGON', 'BITCOIN')),
  amount numeric(18, 6) not null,
  currency text not null default 'USD',
  wallet_address text not null,
  status text not null default 'pending'
    check (status in (
      'pending',
      'awaiting_payment',
      'paid',
      'expired',
      'canceled',
      'failed'
    )),
  -- Future automation hooks (null in Phase 1)
  provider text default 'manual',
  provider_payment_id text,
  provider_tx_hash text,
  provider_payload jsonb not null default '{}'::jsonb,
  -- Lifecycle
  expires_at timestamptz not null,
  paid_at timestamptz,
  paid_by text,
  project_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crypto_orders_order_ref_unique unique (order_ref)
);

create index if not exists crypto_orders_user_email_idx
  on public.crypto_orders (user_email);
create index if not exists crypto_orders_status_idx
  on public.crypto_orders (status);
create index if not exists crypto_orders_expires_at_idx
  on public.crypto_orders (expires_at);

comment on table public.crypto_orders is
  'Crypto checkout orders — Phase 1 manual admin mark-paid; webhooks call same fulfill path';
comment on column public.crypto_orders.provider is
  'manual | nowpayments | helius | … — fulfillment ignores provider specifics';
comment on column public.crypto_orders.provider_tx_hash is
  'On-chain tx hash when auto-detected or pasted by admin';

alter table public.crypto_orders enable row level security;
