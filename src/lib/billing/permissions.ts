import {
  entitlementsForPlanId,
  normalizePlanId,
} from "@/lib/billing/catalog";
import type { PlanEntitlements, PlanId } from "@/lib/billing/types";

export type PermissionInput =
  | PlanEntitlements
  | PlanId
  | string
  | null
  | undefined;

function resolve(input: PermissionInput): PlanEntitlements {
  if (!input) return entitlementsForPlanId("free");
  if (typeof input === "object") return input;
  return entitlementsForPlanId(normalizePlanId(input));
}

export function canPublish(input: PermissionInput): boolean {
  return resolve(input).canPublish;
}

export function canUseAnalytics(input: PermissionInput): boolean {
  return resolve(input).canUseAnalytics;
}

export function canUseCustomDomain(input: PermissionInput): boolean {
  return resolve(input).canUseCustomDomain;
}

export function canUseUnlimitedProjects(input: PermissionInput): boolean {
  return resolve(input).canUseUnlimitedProjects;
}

export function canUsePremiumTemplates(input: PermissionInput): boolean {
  const ent = resolve(input);
  return ent.canPublish;
}

export function canUseAIEditing(input: PermissionInput): boolean {
  return resolve(input).canUseAIEditing;
}

export function canUseBusinessFeatures(input: PermissionInput): boolean {
  return resolve(input).canUseBusinessFeatures;
}

/** Whether the user may create another website given current count. */
export function canCreateWebsite(
  input: PermissionInput,
  currentWebsiteCount: number,
): boolean {
  const ent = resolve(input);
  if (ent.canUseUnlimitedProjects) return true;
  if (ent.maxProjects == null) return true;
  return currentWebsiteCount < ent.maxProjects;
}

/** @deprecated use canCreateWebsite */
export function canCreateProject(
  input: PermissionInput,
  currentProjectCount: number,
): boolean {
  return canCreateWebsite(input, currentProjectCount);
}
