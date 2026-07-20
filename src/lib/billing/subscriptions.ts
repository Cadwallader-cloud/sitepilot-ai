import {
  DEFAULT_PLAN_ID,
  DEFAULT_PLAN_ROWS,
  entitlementsFromPlanRow,
  entitlementsForPlanId,
  getPlanRow,
  isPlanId,
  normalizePlanId,
} from "@/lib/billing/catalog";
import type {
  PlanEntitlements,
  PlanId,
  PlanRow,
  SubscriptionRow,
  SubscriptionStatus,
} from "@/lib/billing/types";
import { getSupabaseAdmin } from "@/lib/supabase";

export type UserBilling = {
  email: string;
  subscription: SubscriptionRow | null;
  entitlements: PlanEntitlements;
  planId: PlanId;
  /** True when row was created/loaded from DB; false when using in-memory fallback. */
  persisted: boolean;
};

function freeSubscriptionStub(email: string): SubscriptionRow {
  const now = new Date().toISOString();
  return {
    id: "local-free",
    user_email: email,
    plan_id: "free",
    status: "active",
    provider: "manual",
    provider_subscription_id: null,
    provider_customer_id: null,
    current_period_start: null,
    current_period_end: null,
    canceled_at: null,
    metadata: {},
    created_at: now,
    updated_at: now,
  };
}

function coercePlanRow(raw: Record<string, unknown>, planId: PlanId): PlanRow {
  const fallback = getPlanRow(planId);
  return {
    ...fallback,
    id: planId,
    name: typeof raw.name === "string" ? raw.name : fallback.name,
    description:
      typeof raw.description === "string" ? raw.description : fallback.description,
    price_label:
      typeof raw.price_label === "string" ? raw.price_label : fallback.price_label,
    can_publish: Boolean(raw.can_publish ?? fallback.can_publish),
    can_use_analytics: Boolean(
      raw.can_use_analytics ?? fallback.can_use_analytics,
    ),
    can_use_custom_domain: Boolean(
      raw.can_use_custom_domain ?? fallback.can_use_custom_domain,
    ),
    can_use_unlimited_projects: Boolean(
      raw.can_use_unlimited_projects ?? fallback.can_use_unlimited_projects,
    ),
    can_use_ai_editing: Boolean(
      raw.can_use_ai_editing ?? fallback.can_use_ai_editing,
    ),
    can_use_business_features: Boolean(
      raw.can_use_business_features ?? fallback.can_use_business_features,
    ),
    max_projects:
      raw.max_projects === null || typeof raw.max_projects === "number"
        ? (raw.max_projects as number | null)
        : fallback.max_projects,
    sort_order:
      typeof raw.sort_order === "number" ? raw.sort_order : fallback.sort_order,
    active: raw.active === undefined ? fallback.active : Boolean(raw.active),
  };
}

async function fetchPlanRow(planId: PlanId): Promise<PlanRow> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getPlanRow(planId);

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (error || !data) return getPlanRow(planId);
  return coercePlanRow(data as Record<string, unknown>, planId);
}

export async function listPlans(): Promise<PlanRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return DEFAULT_PLAN_ROWS;

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return DEFAULT_PLAN_ROWS;
  return (data as Record<string, unknown>[])
    .filter((row) => row.active !== false && isPlanId(row.id))
    .map((row) => coercePlanRow(row, row.id as PlanId))
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Ensure the user has a subscription row (defaults to free).
 * Safe to call on every login / request.
 */
export async function ensureUserSubscription(
  userEmail: string,
): Promise<UserBilling> {
  const email = userEmail.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      email,
      subscription: freeSubscriptionStub(email),
      entitlements: entitlementsForPlanId("free"),
      planId: "free",
      persisted: false,
    };
  }

  const existing = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_email", email)
    .maybeSingle();

  if (!existing.error && existing.data) {
    const sub = existing.data as SubscriptionRow;
    const storedPlanId = normalizePlanId(sub.plan_id);
    const entitled =
      sub.status === "active" || sub.status === "trialing";
    const planId = entitled ? storedPlanId : "free";
    const plan = await fetchPlanRow(planId);
    return {
      email,
      subscription: { ...sub, plan_id: storedPlanId },
      entitlements: entitlementsFromPlanRow(plan),
      planId,
      persisted: true,
    };
  }

  // Table missing / RLS / first create
  const inserted = await supabase
    .from("subscriptions")
    .insert({
      user_email: email,
      plan_id: DEFAULT_PLAN_ID,
      status: "active" satisfies SubscriptionStatus,
      provider: "manual",
      metadata: { source: "ensureUserSubscription" },
    })
    .select("*")
    .single();

  if (inserted.error || !inserted.data) {
    // plans/subscriptions tables may not be migrated yet
    console.warn(
      "ensureUserSubscription fallback:",
      inserted.error?.message ?? existing.error?.message,
    );
    return {
      email,
      subscription: freeSubscriptionStub(email),
      entitlements: entitlementsForPlanId("free"),
      planId: "free",
      persisted: false,
    };
  }

  const sub = inserted.data as SubscriptionRow;
  return {
    email,
    subscription: sub,
    entitlements: entitlementsForPlanId(normalizePlanId(sub.plan_id)),
    planId: normalizePlanId(sub.plan_id),
    persisted: true,
  };
}

export async function getUserBilling(
  userEmail: string,
): Promise<UserBilling> {
  return ensureUserSubscription(userEmail);
}

/**
 * Admin / future provider webhook: set a user's plan.
 * Does not talk to Stripe — only updates our tables.
 */
export async function setUserPlan(params: {
  userEmail: string;
  planId: PlanId;
  /** Who/what changed the plan */
  provider?: string | null;
  status?: SubscriptionStatus;
  metadata?: Record<string, unknown>;
  actorEmail?: string | null;
}): Promise<UserBilling | null> {
  const email = params.userEmail.trim().toLowerCase();
  if (!isPlanId(params.planId)) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const now = new Date().toISOString();
  const metadata = {
    ...(params.metadata ?? {}),
    ...(params.actorEmail
      ? { lastChangedBy: params.actorEmail, lastChangedAt: now }
      : {}),
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_email: email,
        plan_id: params.planId,
        status: params.status ?? "active",
        provider: params.provider ?? "manual",
        metadata,
        updated_at: now,
        canceled_at: params.status === "canceled" ? now : null,
      },
      { onConflict: "user_email" },
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("setUserPlan:", error?.message);
    return null;
  }

  // Best-effort: mirror onto projects.plan for legacy admin stats
  await supabase
    .from("projects")
    .update({ plan: params.planId, updated_at: now })
    .eq("user_email", email);

  const sub = data as SubscriptionRow;
  const plan = await fetchPlanRow(params.planId);
  return {
    email,
    subscription: sub,
    entitlements: entitlementsFromPlanRow(plan),
    planId: params.planId,
    persisted: true,
  };
}

export async function listSubscriptions(): Promise<
  (SubscriptionRow & { plan_name?: string })[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(name)")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    // Fallback without join
    const plain = await supabase
      .from("subscriptions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (plain.error || !plain.data) return [];
    return plain.data as SubscriptionRow[];
  }

  return (data as (SubscriptionRow & { plans?: { name: string } | null })[]).map(
    (row) => ({
      ...row,
      plan_name: row.plans?.name,
    }),
  );
}
