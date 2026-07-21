/**
 * Marketing / UI plan copy + contact helpers.
 * Entitlements & subscriptions live in `@/lib/billing` (BillingService).
 */
import { brand } from "@/lib/brand";
import { DEFAULT_PLAN_ROWS, isPlanId } from "@/lib/billing/catalog";
import { canPublish } from "@/lib/billing/permissions";
import type { PlanId } from "@/lib/billing/types";

export type { PlanId };
export { canPublish, isPlanId };
export { canPublish as canPublishWithPlan };

/** Public contact for Pro / Business upgrades. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || brand.supportEmail;

export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Crestis upgrade request",
)}`;

export type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
  priceCents?: number;
};

/** Legacy Stripe plan amounts (admin revenue rollups). */
export const LEGACY_PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 2_900,
  pro: 7_900,
  unlimited: 19_900,
  business: 19_900,
};

export const FREE_FEATURES = [
  "1 website",
  "Preview",
  "Draft editing",
] as const;

export const PRO_FEATURES = [
  "Unlimited websites",
  "Publish",
  "Custom domains",
  "Analytics",
  "AI editing",
] as const;

/** Unlocked immediately after Pro crypto payment (Task 7). */
export const PRO_UNLOCK_FEATURES = [
  "Custom Domain",
  "Unlimited Publish",
  "Premium Templates",
] as const;

export const BUSINESS_FEATURES = [
  "Everything in Pro",
  "Team members",
  "White label",
  "API access",
  "Priority support",
] as const;

export const UPGRADE_REQUIRED_FEATURES = [
  "Publish",
  "Custom domain",
  "Analytics",
  "AI editing",
] as const;

export const PLANS: Plan[] = DEFAULT_PLAN_ROWS.map((row) => ({
  id: row.id,
  name: row.name,
  priceLabel: row.price_label,
  blurb: row.description,
  features:
    row.id === "free"
      ? [...FREE_FEATURES]
      : row.id === "business"
        ? [...BUSINESS_FEATURES]
        : [...PRO_FEATURES],
  highlighted: row.id === "pro",
  priceCents: LEGACY_PLAN_PRICES[row.id] ?? 0,
}));

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}
