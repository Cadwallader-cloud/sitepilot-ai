/** Canonical plan ids — must match `public.plans.id`. */
export type PlanId = "free" | "pro" | "business";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "inactive";

/** Entitlements used by permission helpers (provider-agnostic). */
export type PlanEntitlements = {
  planId: PlanId;
  canPublish: boolean;
  canUseAnalytics: boolean;
  canUseCustomDomain: boolean;
  canUseUnlimitedProjects: boolean;
  canUseAIEditing: boolean;
  canUseBusinessFeatures: boolean;
  /** Null when unlimited websites are allowed. */
  maxProjects: number | null;
};

export type PlanRow = {
  id: PlanId;
  name: string;
  description: string;
  price_label: string;
  can_publish: boolean;
  can_use_analytics: boolean;
  can_use_custom_domain: boolean;
  can_use_unlimited_projects: boolean;
  can_use_ai_editing: boolean;
  can_use_business_features: boolean;
  max_projects: number | null;
  sort_order: number;
  active: boolean;
};

export type SubscriptionRow = {
  id: string;
  user_email: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  provider: string | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/** Feature keys for upgrade UX — never check plan names in UI. */
export type FeatureKey =
  | "publish"
  | "analytics"
  | "custom_domain"
  | "create_website"
  | "ai_editing"
  | "business_features"
  /** @deprecated use create_website */
  | "unlimited_projects";
