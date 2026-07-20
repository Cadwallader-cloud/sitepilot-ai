/**
 * BillingService — single entry point for plan / subscription operations.
 * App code and future providers (crypto, Polar, invoices) call this only;
 * they must not mutate entitlements elsewhere.
 */
import {
  getPlanRow,
  isPlanId,
  normalizePlanId,
  PLAN_RANK,
} from "@/lib/billing/catalog";
import type {
  PlanEntitlements,
  PlanId,
  PlanRow,
  SubscriptionStatus,
} from "@/lib/billing/types";
import {
  ensureUserSubscription,
  getUserBilling,
  listPlans,
  setUserPlan,
  type UserBilling,
} from "@/lib/billing/subscriptions";

export type CurrentPlan = {
  planId: PlanId;
  plan: PlanRow;
  entitlements: PlanEntitlements;
  status: SubscriptionStatus;
  renewalDate: string | null;
  provider: string | null;
  subscription: UserBilling["subscription"];
  persisted: boolean;
};

async function toCurrentPlan(billing: UserBilling): Promise<CurrentPlan> {
  // Display the subscribed plan even when canceled; entitlements may be Free.
  const displayPlanId = billing.subscription
    ? normalizePlanId(billing.subscription.plan_id)
    : billing.planId;
  const plans = await listPlans();
  const plan =
    plans.find((p) => p.id === displayPlanId) ?? getPlanRow(displayPlanId);
  return {
    planId: displayPlanId,
    plan,
    entitlements: billing.entitlements,
    status: billing.subscription?.status ?? "active",
    renewalDate: billing.subscription?.current_period_end ?? null,
    provider: billing.subscription?.provider ?? null,
    subscription: billing.subscription,
    persisted: billing.persisted,
  };
}

export const BillingService = {
  /** Ensure Free subscription exists, then return billing state. */
  async ensureSubscription(userEmail: string): Promise<UserBilling> {
    return ensureUserSubscription(userEmail);
  },

  async getCurrentPlan(userEmail: string): Promise<CurrentPlan> {
    const billing = await getUserBilling(userEmail);
    return toCurrentPlan(billing);
  },

  async getPermissions(userEmail: string): Promise<PlanEntitlements> {
    const billing = await getUserBilling(userEmail);
    return billing.entitlements;
  },

  /**
   * Move to a higher plan. Provider-agnostic (manual / crypto / Polar later).
   */
  async upgradePlan(params: {
    userEmail: string;
    planId: PlanId;
    provider?: string | null;
    actorEmail?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<UserBilling | null> {
    if (!isPlanId(params.planId) || params.planId === "free") return null;
    const current = await getUserBilling(params.userEmail);
    if (PLAN_RANK[params.planId] <= PLAN_RANK[current.planId]) {
      return null;
    }
    return setUserPlan({
      userEmail: params.userEmail,
      planId: params.planId,
      provider: params.provider ?? "manual",
      status: "active",
      actorEmail: params.actorEmail,
      metadata: { ...params.metadata, action: "upgrade" },
    });
  },

  /**
   * Move to a lower plan (or Free). Does not talk to a payment provider.
   */
  async downgradePlan(params: {
    userEmail: string;
    planId: PlanId;
    provider?: string | null;
    actorEmail?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<UserBilling | null> {
    if (!isPlanId(params.planId)) return null;
    const current = await getUserBilling(params.userEmail);
    if (PLAN_RANK[params.planId] >= PLAN_RANK[current.planId]) {
      return null;
    }
    return setUserPlan({
      userEmail: params.userEmail,
      planId: params.planId,
      provider: params.provider ?? "manual",
      status: "active",
      actorEmail: params.actorEmail,
      metadata: { ...params.metadata, action: "downgrade" },
    });
  },

  /** Admin / provider: set any plan without rank checks. */
  async changePlan(params: {
    userEmail: string;
    planId: PlanId;
    status?: SubscriptionStatus;
    provider?: string | null;
    actorEmail?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<UserBilling | null> {
    if (!isPlanId(params.planId)) return null;
    return setUserPlan({
      userEmail: params.userEmail,
      planId: params.planId,
      status: params.status ?? "active",
      provider: params.provider ?? "manual",
      actorEmail: params.actorEmail,
      metadata: params.metadata,
    });
  },

  async activateSubscription(params: {
    userEmail: string;
    actorEmail?: string | null;
  }): Promise<UserBilling | null> {
    const current = await getUserBilling(params.userEmail);
    return setUserPlan({
      userEmail: params.userEmail,
      planId: current.planId,
      status: "active",
      provider: current.subscription?.provider ?? "manual",
      actorEmail: params.actorEmail,
      metadata: { action: "activate" },
    });
  },

  async cancelSubscription(params: {
    userEmail: string;
    actorEmail?: string | null;
  }): Promise<UserBilling | null> {
    const current = await getUserBilling(params.userEmail);
    return setUserPlan({
      userEmail: params.userEmail,
      planId: current.planId,
      status: "canceled",
      provider: current.subscription?.provider ?? "manual",
      actorEmail: params.actorEmail,
      metadata: { action: "cancel" },
    });
  },

  listPlans,
};

export type { UserBilling };
