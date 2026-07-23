/**
 * Crestis Service Prioritizer v1
 *
 * Runs before Services Generator.
 * Outputs hierarchy: featured → secondary → optional (titles only).
 */

import { completeJsonObject } from "./openai-json";
import {
  SERVICE_PRIORITIZER_SYSTEM,
  servicePrioritizerUser,
} from "./prompts/service-prioritizer";

export type ServicePriorityPlan = {
  featured: string;
  secondary: string[];
  optional: string[];
  /** Flat ordered titles for downstream copy agents */
  orderedTitles: string[];
};

/** Fallback skip when only raw services exist (no planner serviceFocus). */
export const SERVICE_PRIORITIZER_SKIP_MAX = 3;

/** Skip AI prioritizer when planner brief already lists services (any count). */
export function shouldSkipServicePrioritizer(
  servicesList: string[],
  plannerServiceFocus?: string[],
): boolean {
  const plannerTitles = (plannerServiceFocus ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (plannerTitles.length >= 1) return true;
  return (
    servicesList.length >= 1 &&
    servicesList.length <= SERVICE_PRIORITIZER_SKIP_MAX
  );
}

/** Deterministic hierarchy from Planner / brief serviceFocus — no OpenAI call. */
export function servicePriorityFromPlanner(
  serviceFocus: string[],
): ServicePriorityPlan {
  const titles = serviceFocus.map(clampTitle).filter(Boolean);
  return fallbackServicePriority(titles);
}

function parseServiceList(raw: string): string[] {
  return raw
    .split(/[,;•\n|/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 16);
}

function clampTitle(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}

function normalizeMatch(a: string): string {
  return a.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickClosest(candidate: string, pool: string[]): string | null {
  const key = normalizeMatch(candidate);
  if (!key) return null;
  const exact = pool.find((p) => normalizeMatch(p) === key);
  if (exact) return exact;
  const partial = pool.find((p) => {
    const n = normalizeMatch(p);
    return n.includes(key) || key.includes(n);
  });
  return partial ?? null;
}

export function fallbackServicePriority(
  servicesList: string[],
): ServicePriorityPlan {
  const titles = servicesList.map(clampTitle).filter(Boolean);
  if (!titles.length) {
    return {
      featured: "Core Service",
      secondary: ["Support Service", "Follow-Up Service"],
      optional: [],
      orderedTitles: ["Core Service", "Support Service", "Follow-Up Service"],
    };
  }
  const featured = titles[0];
  const secondary = titles.slice(1, 3);
  const optional = titles.slice(3);
  // Ensure at least 2 secondary-ish for generator if only 1 input
  while (secondary.length < 2 && titles.length === 1) {
    secondary.push(`${featured} Support`);
    break;
  }
  const orderedTitles = [featured, ...secondary, ...optional];
  return { featured, secondary, optional, orderedTitles };
}

export function normalizeServicePriority(
  raw: unknown,
  servicesList: string[],
): ServicePriorityPlan {
  const pool = servicesList.map(clampTitle).filter(Boolean);
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  if (!pool.length) return fallbackServicePriority([]);

  const used = new Set<string>();
  const take = (label: string): string | null => {
    const matched = pickClosest(label, pool);
    if (!matched) return null;
    const key = normalizeMatch(matched);
    if (used.has(key)) return null;
    used.add(key);
    return matched;
  };

  let featured =
    take(String(row.featured ?? "")) ||
    take(pool[0]) ||
    pool[0];

  const secondaryRaw = Array.isArray(row.secondary) ? row.secondary : [];
  const secondary: string[] = [];
  for (const item of secondaryRaw) {
    const t = take(String(item ?? ""));
    if (t) secondary.push(t);
    if (secondary.length >= 3) break;
  }

  const optionalRaw = Array.isArray(row.optional) ? row.optional : [];
  const optional: string[] = [];
  for (const item of optionalRaw) {
    const t = take(String(item ?? ""));
    if (t) optional.push(t);
  }

  // Place unused inputs into optional (or secondary if thin)
  for (const title of pool) {
    const key = normalizeMatch(title);
    if (used.has(key)) continue;
    if (secondary.length < 2) {
      secondary.push(title);
      used.add(key);
    } else {
      optional.push(title);
      used.add(key);
    }
  }

  if (!featured) featured = pool[0];
  if (normalizeMatch(featured) === normalizeMatch(secondary[0] || "")) {
    // keep distinct
  }

  const orderedTitles = [
    featured,
    ...secondary.filter((s) => normalizeMatch(s) !== normalizeMatch(featured)),
    ...optional.filter((s) => normalizeMatch(s) !== normalizeMatch(featured)),
  ];

  return {
    featured,
    secondary: secondary
      .filter((s) => normalizeMatch(s) !== normalizeMatch(featured))
      .slice(0, 3),
    optional: optional
      .filter((s) => normalizeMatch(s) !== normalizeMatch(featured))
      .slice(0, 8),
    orderedTitles,
  };
}

export async function runServicePrioritizer(params: {
  businessName: string;
  industry: string;
  location: string;
  description: string;
  servicesRaw: string;
  /** Planner brief serviceFocus — when set, skip AI prioritizer (any count) */
  serviceFocus?: string[];
  userEmail?: string | null;
  industryBrief?: string;
  brandPosition?: string;
  primaryGoal?: string;
}): Promise<ServicePriorityPlan> {
  const servicesList = parseServiceList(params.servicesRaw);
  const plannerTitles = (params.serviceFocus ?? [])
    .map((s) => s.trim())
    .filter(Boolean);

  if (shouldSkipServicePrioritizer(servicesList, plannerTitles)) {
    const source = plannerTitles.length ? plannerTitles : servicesList;
    return servicePriorityFromPlanner(source);
  }

  try {
    const ai = await completeJsonObject<{
      featured?: string;
      secondary?: string[];
      optional?: string[];
    }>({
      stage: "copy_service_ai",
      userEmail: params.userEmail,
      temperature: 0.35,
      maxCompletionTokens: 1024,
      system: SERVICE_PRIORITIZER_SYSTEM,
      user: servicePrioritizerUser({
        businessName: params.businessName,
        industry: params.industry,
        location: params.location,
        description: params.description,
        servicesList,
        industryBrief: params.industryBrief,
        brandPosition: params.brandPosition,
        primaryGoal: params.primaryGoal,
      }),
    });
    return normalizeServicePriority(ai, servicesList);
  } catch (error) {
    console.warn("Service Prioritizer failed, using fallback:", error);
    return fallbackServicePriority(servicesList);
  }
}

export { parseServiceList };
