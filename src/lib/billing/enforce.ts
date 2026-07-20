import { isAdminEmail } from "@/lib/admin";
import {
  canCreateWebsite,
  canPublish,
  canUseAIEditing,
  canUseAnalytics,
  canUseBusinessFeatures,
  canUseCustomDomain,
} from "@/lib/billing/permissions";
import { BillingService, type UserBilling } from "@/lib/billing/service";
import type { FeatureKey } from "@/lib/billing/types";
import { listProjects } from "@/lib/projects";
import { NextResponse } from "next/server";

export async function loadBilling(email: string): Promise<UserBilling> {
  return BillingService.ensureSubscription(email);
}

export function forbiddenUpgrade(feature: FeatureKey, message: string) {
  return NextResponse.json(
    {
      error: message,
      upgradeRequired: true,
      feature,
    },
    { status: 402 },
  );
}

export async function assertCanPublish(email: string) {
  if (isAdminEmail(email)) return null;
  const billing = await loadBilling(email);
  if (!canPublish(billing.entitlements)) {
    return forbiddenUpgrade(
      "publish",
      "Upgrade Required — Publish is on Pro and Business.",
    );
  }
  return null;
}

export async function assertCanUseAnalytics(email: string) {
  if (isAdminEmail(email)) return null;
  const billing = await loadBilling(email);
  if (!canUseAnalytics(billing.entitlements)) {
    return forbiddenUpgrade(
      "analytics",
      "Upgrade Required — Analytics is on Pro and Business.",
    );
  }
  return null;
}

export async function assertCanUseCustomDomain(email: string) {
  if (isAdminEmail(email)) return null;
  const billing = await loadBilling(email);
  if (!canUseCustomDomain(billing.entitlements)) {
    return forbiddenUpgrade(
      "custom_domain",
      "Upgrade Required — Custom domains are on Pro and Business.",
    );
  }
  return null;
}

export async function assertCanCreateWebsite(email: string) {
  if (isAdminEmail(email)) return null;
  const billing = await loadBilling(email);
  const projects = await listProjects(email);
  if (!canCreateWebsite(billing.entitlements, projects.length)) {
    return forbiddenUpgrade(
      "create_website",
      "Upgrade Required — Free includes 1 website. Pro unlocks unlimited.",
    );
  }
  return null;
}

/** @deprecated use assertCanCreateWebsite */
export async function assertCanCreateProject(email: string) {
  return assertCanCreateWebsite(email);
}

export async function assertCanUseAIEditing(email: string) {
  if (isAdminEmail(email)) return null;
  const billing = await loadBilling(email);
  if (!canUseAIEditing(billing.entitlements)) {
    return forbiddenUpgrade(
      "ai_editing",
      "Upgrade Required — AI editing is on Pro and Business.",
    );
  }
  return null;
}

export async function assertCanUseBusinessFeatures(email: string) {
  if (isAdminEmail(email)) return null;
  const billing = await loadBilling(email);
  if (!canUseBusinessFeatures(billing.entitlements)) {
    return forbiddenUpgrade(
      "business_features",
      "Upgrade Required — Team, white label, and API are on Business.",
    );
  }
  return null;
}
