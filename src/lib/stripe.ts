import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(key);
}

export function getAppUrl(fallbackOrigin: string) {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || fallbackOrigin;
}
