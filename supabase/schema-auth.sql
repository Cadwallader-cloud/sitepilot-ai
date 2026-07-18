-- Email OTP login codes (Auth.js Google stays JWT-only)
create table if not exists public.email_otps (
  email text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.email_otps enable row level security;
-- Server uses service role only; no public policies.
