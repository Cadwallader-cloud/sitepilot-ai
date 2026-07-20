# Crestis

AI Website Builder for Local Businesses — [crestis.app](https://crestis.app)

**Free → Preview → Draft → Upgrade (Pro / Business)**

## Features

- Landing page + demo showcase
- Form-based website builder at `/create`
- Crypto checkout at `/checkout` (USDT / USDC / BTC)
- Provider-agnostic billing (Free / Pro / Business)
- Early access leads (`Request Access` → Supabase `leads`)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

```bash
npx vercel --prod
```

Set `NEXT_PUBLIC_APP_URL` to `https://crestis.app`.

## Model routing (site generation)

Simple Engine uses **GPT-5 mini only** (3 calls):

1. Brand Personality → DNA JSON  
2. Website Plan → Plan JSON  
3. Website JSON → copy + SEO + visual tokens  

```bash
OPENAI_MODEL=gpt-5-mini
```

Full `gpt-5` / `gpt-4o` env values are remapped to `gpt-5-mini` unless `CRESTIS_ALLOW_FULL_MODEL=true`.

Optional cheaper: `OPENAI_MODEL=gpt-5-nano`.

## Supabase

Run SQL in the Supabase SQL Editor as needed:

- `supabase/schema.sql`
- `supabase/schema-subscriptions.sql` or `schema-billing-v2.sql`
- `supabase/schema-crypto-orders.sql`
- `supabase/schema-payment-wallets.sql`
- `supabase/schema-leads.sql`
