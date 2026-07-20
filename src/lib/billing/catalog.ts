import type { PlanEntitlements, PlanId, PlanRow } from "@/lib/billing/types";

/**
 * In-code fallback if Supabase `plans` table is missing.
 * Keep in sync with supabase/schema-subscriptions.sql seeds.
 */
export const DEFAULT_PLAN_ROWS: PlanRow[] = [
  {
    id: "free",
    name: "Free",
    description: "1 website — preview and draft editing",
    price_label: "Free",
    can_publish: false,
    can_use_analytics: false,
    can_use_custom_domain: false,
    can_use_unlimited_projects: false,
    can_use_ai_editing: false,
    can_use_business_features: false,
    max_projects: 1,
    sort_order: 0,
    active: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Unlimited websites, publish, domains, analytics, AI editing",
    price_label: "Pro",
    can_publish: true,
    can_use_analytics: true,
    can_use_custom_domain: true,
    can_use_unlimited_projects: true,
    can_use_ai_editing: true,
    can_use_business_features: false,
    max_projects: null,
    sort_order: 1,
    active: true,
  },
  {
    id: "business",
    name: "Business",
    description: "Everything in Pro plus team, white label, API, priority support",
    price_label: "Business",
    can_publish: true,
    can_use_analytics: true,
    can_use_custom_domain: true,
    can_use_unlimited_projects: true,
    can_use_ai_editing: true,
    can_use_business_features: true,
    max_projects: null,
    sort_order: 2,
    active: true,
  },
];

export const DEFAULT_PLAN_ID: PlanId = "free";

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

export function isPlanId(value: unknown): value is PlanId {
  return value === "free" || value === "pro" || value === "business";
}

/** Map legacy plan ids onto current catalog. */
export function normalizePlanId(value: string | null | undefined): PlanId {
  if (!value) return "free";
  const id = value.toLowerCase().trim();
  if (id === "pro") return "pro";
  if (id === "business") return "business";
  if (id === "unlimited") return "business"; // legacy Unlimited → Business
  if (id === "starter") return "pro"; // legacy paid Starter
  if (id === "free") return "free";
  return "free";
}

export function entitlementsFromPlanRow(row: PlanRow): PlanEntitlements {
  return {
    planId: row.id,
    canPublish: row.can_publish,
    canUseAnalytics: row.can_use_analytics,
    canUseCustomDomain: row.can_use_custom_domain,
    canUseUnlimitedProjects: row.can_use_unlimited_projects,
    canUseAIEditing: Boolean(row.can_use_ai_editing),
    canUseBusinessFeatures: Boolean(row.can_use_business_features),
    maxProjects: row.can_use_unlimited_projects ? null : row.max_projects,
  };
}

export function entitlementsForPlanId(planId: PlanId): PlanEntitlements {
  const row =
    DEFAULT_PLAN_ROWS.find((p) => p.id === planId) ?? DEFAULT_PLAN_ROWS[0]!;
  return entitlementsFromPlanRow(row);
}

export function getPlanRow(planId: PlanId): PlanRow {
  return DEFAULT_PLAN_ROWS.find((p) => p.id === planId) ?? DEFAULT_PLAN_ROWS[0]!;
}

/** Whether target is a higher tier than current (for upgrade CTAs). */
export function canUpgradeTo(current: PlanId, target: PlanId): boolean {
  return PLAN_RANK[target] > PLAN_RANK[current];
}
