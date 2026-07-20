-- Add BTC (Bitcoin) to payment_wallets + crypto_orders check constraints.

alter table public.payment_wallets
  drop constraint if exists payment_wallets_currency_check;
alter table public.payment_wallets
  drop constraint if exists payment_wallets_network_check;
alter table public.payment_wallets
  add constraint payment_wallets_currency_check
    check (currency in ('USDT', 'USDC', 'BTC'));
alter table public.payment_wallets
  add constraint payment_wallets_network_check
    check (network in ('TRC20', 'POLYGON', 'BITCOIN'));

alter table public.crypto_orders
  drop constraint if exists crypto_orders_asset_check;
alter table public.crypto_orders
  drop constraint if exists crypto_orders_network_check;
alter table public.crypto_orders
  add constraint crypto_orders_asset_check
    check (asset in ('USDT', 'USDC', 'BTC'));
alter table public.crypto_orders
  add constraint crypto_orders_network_check
    check (network in ('TRC20', 'POLYGON', 'BITCOIN'));

insert into public.payment_wallets (currency, network, address, active)
values ('BTC', 'BITCOIN', '', false)
on conflict (currency, network) do nothing;
