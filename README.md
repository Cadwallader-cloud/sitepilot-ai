# SitePilot AI for Contractors

AI-powered website builder for trade businesses — roofers, builders, plumbers, electricians, landscapers.

**Preview free · Publish for $199**

## Features

- Landing page with demo showcase (5 unique contractor sites)
- Form-based website builder at `/create`
- Stripe checkout at `/publish`
- OpenAI generation API (optional)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Optional | Enables AI generation |
| `STRIPE_SECRET_KEY` | For checkout | Stripe test/live secret key |
| `NEXT_PUBLIC_APP_URL` | Production | Your Vercel URL for Stripe redirects |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Google Analytics for ads |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional | Meta Pixel for Facebook ads |

## Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **Cadwallader-cloud/sitepilot-ai** from GitHub
3. Add environment variables (at minimum `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_APP_URL`)
4. Deploy

Or via CLI:

```bash
npx vercel
```

Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://sitepilot-ai.vercel.app`).

## Stripe test checkout

1. Add `STRIPE_SECRET_KEY` from [Stripe Dashboard → Test mode](https://dashboard.stripe.com/test/apikeys)
2. Go to `/publish` and click **Pay $199**
3. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

## Ads setup

After deploy, add tracking IDs to Vercel env vars:

- **Google Ads / Analytics:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Facebook Ads:** `NEXT_PUBLIC_META_PIXEL_ID`

Then create campaigns targeting contractors in your region.
