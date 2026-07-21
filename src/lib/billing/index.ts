export {
  canUpgradeTo,
  DEFAULT_PLAN_ID,
  DEFAULT_PLAN_ROWS,
  entitlementsForPlanId,
  entitlementsFromPlanRow,
  getPlanRow,
  isPlanId,
  normalizePlanId,
  PLAN_RANK,
} from "@/lib/billing/catalog";
export {
  canCreateProject,
  canCreateWebsite,
  canPublish,
  canUseAIEditing,
  canUseAnalytics,
  canUseBusinessFeatures,
  canUseCustomDomain,
  canUsePremiumTemplates,
  canUseUnlimitedProjects,
} from "@/lib/billing/permissions";
export {
  ensureUserSubscription,
  getUserBilling,
  listPlans,
  listSubscriptions,
  setUserPlan,
  type UserBilling,
} from "@/lib/billing/subscriptions";
export {
  BillingService,
  type CurrentPlan,
} from "@/lib/billing/service";
export type {
  FeatureKey,
  PlanEntitlements,
  PlanId,
  PlanRow,
  SubscriptionRow,
  SubscriptionStatus,
} from "@/lib/billing/types";
export {
  activateCheckoutSession,
  setProjectPlanLegacy,
  type CheckoutActivation,
} from "@/lib/billing/provider-hooks";
export {
  assertCanCreateProject,
  assertCanCreateWebsite,
  assertCanPublish,
  assertCanUseAIEditing,
  assertCanUseAnalytics,
  assertCanUseBusinessFeatures,
  assertCanUseCustomDomain,
  forbiddenUpgrade,
  loadBilling,
} from "@/lib/billing/enforce";
