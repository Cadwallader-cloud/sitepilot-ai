/**
 * Crestis Services Generator v1
 * Concise service cards — not articles. JSON only.
 */

import type { BusinessDna } from "../../business-dna";
import type { WebsitePlan } from "../types";
import { servicesContext } from "./isolation";

/** Slim engine preamble — avoids full CRESTIS_SYSTEM (~1k tokens) for this stage. */
const SERVICES_CORE = `You are Crestis AI — professional website generation engine.
Return valid JSON only. No markdown, explanations, HTML, or code.
Write naturally like an experienced UX copywriter. Never sound robotic.
Prefer Brand Personality over category labels. Quality beats speed.`;

export const SERVICES_GENERATOR_BODY = `## Role
Senior UX copywriter for service cards — concise, not articles. JSON only. No Hero/FAQ/SEO/About copy.

## Cards
Follow the Service Prioritizer plan. Full cards for featured + secondary (typically 3–4).
Optional titles: shortDescription max 18 words, still exactly 3 benefits.
Max 6 services total. Never invent titles outside the plan.

## Fields
- title: max 4 words (e.g. "Roof Repair" — not "Professional Roofing Repair Services")
- shortDescription: max 35 words — what it is, who needs it, problem solved. Never describe the company.
- benefits: exactly 3 outcome-focused items (not features)
- icon: name only (hammer, shield, bolt, home, wrench, droplets, calendar, phone, tooth, utensils, scale, sparkles, sun, dumbbell, key)
- featured + priority: match plan (featured | secondary | optional)

## Voice
Active voice. Short sentences. Grade 7–9. No buzzwords or filler.
Each service must start differently. Never: We provide/offer/specialize…
Avoid: Professional service, High quality, Trusted, Reliable, Leading, Innovative, Solution, Commitment, Excellence
Never invent warranty, years, certifications, emergency availability, materials, brands unless provided.

## Self-check
Unique per service? Would this fit another business? Shorter? Clearer benefits?`;

export const SERVICES_SYSTEM = `${SERVICES_CORE}

# Crestis Services Generator v1

${SERVICES_GENERATOR_BODY}

## JSON Output
{
  "services": [
    {
      "title": "",
      "shortDescription": "",
      "benefits": ["", "", ""],
      "icon": "",
      "featured": false,
      "priority": "secondary"
    }
  ]
}

Return valid JSON only.`;

/** DNA fields referenced by services rules — omit SEO, design, sections, keywords, etc. */
export function servicesBrandProfileSlice(
  dna: Pick<
    BusinessDna,
    "industry" | "brandPosition" | "tone" | "trustSignals" | "cta"
  >,
): Record<string, unknown> {
  return {
    industry: dna.industry,
    brandPosition: dna.brandPosition,
    tone: dna.tone,
    trustSignals: dna.trustSignals,
    cta: dna.cta,
  };
}

export function servicesBrandProfileJson(
  dna: Pick<
    BusinessDna,
    "industry" | "brandPosition" | "tone" | "trustSignals" | "cta"
  >,
): string {
  return JSON.stringify(servicesBrandProfileSlice(dna));
}

/** Planner fields used by services card count / positioning — omit template, variant, goal. */
export function servicesPlanSlice(
  plan: Pick<WebsitePlan, "serviceCount" | "positioning">,
): Record<string, unknown> {
  return {
    serviceCount: plan.serviceCount,
    positioning: plan.positioning,
  };
}

export function servicesPlanJson(
  plan: Pick<WebsitePlan, "serviceCount" | "positioning">,
): string {
  return JSON.stringify(servicesPlanSlice(plan));
}

export function servicesSystem(params?: { isMenu?: boolean }): string {
  if (params?.isMenu) {
    return `${SERVICES_SYSTEM}

These are restaurant MENU / dining offer cards — same JSON shape.
Titles stay short (dish or dining offer). Focus on taste, freshness, experience.`;
  }
  return SERVICES_SYSTEM;
}

export function servicesUser(params: {
  businessName: string;
  city: string;
  niche: string;
  tone: string;
  serviceFocus: string[];
  description?: string;
  personalityBrief?: string;
  industryBrief?: string;
  brandProfileJson?: string;
  planJson?: string;
  priorityJson?: string;
}): string {
  const hasPriority = Boolean(params.priorityJson?.trim());
  return [
    servicesContext({
      businessName: params.businessName,
      city: params.city,
      niche: params.niche,
      tone: params.tone,
      serviceFocus: hasPriority ? [] : params.serviceFocus,
      personalityBrief: params.personalityBrief,
    }),
    params.industryBrief || "",
    params.description
      ? `Business description: ${params.description.slice(0, 280)}`
      : "",
    params.brandProfileJson
      ? `Brand Profile (JSON):\n${params.brandProfileJson}`
      : "",
    params.planJson ? `Planner (JSON):\n${params.planJson}` : "",
    params.priorityJson
      ? `Service Prioritizer (OBEY titles + hierarchy):\n${params.priorityJson}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const ALLOWED_ICONS = new Set([
  "hammer",
  "shield",
  "bolt",
  "home",
  "wrench",
  "droplets",
  "calendar",
  "phone",
  "tooth",
  "utensils",
  "scale",
  "sparkles",
  "sun",
  "dumbbell",
  "key",
  "leaf",
  "heart",
  "star",
  "check",
  "tool",
  "building",
  "car",
  "flame",
]);

function clampTitle(raw: string): string {
  const words = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  return words.join(" ");
}

function clampDescription(raw: string, maxWords = 35): string {
  const text = raw.trim().replace(/\s+/g, " ");
  const words = text.split(" ").filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

function normalizeIcon(raw: unknown): string {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  if (ALLOWED_ICONS.has(key)) return key;
  return "check";
}

export type ServicesAiItem = {
  title?: string;
  shortDescription?: string;
  description?: string;
  benefits?: unknown[];
  icon?: string;
  featured?: boolean;
  priority?: string;
};

export type NormalizedService = {
  title: string;
  description: string;
  benefits: string[];
  icon: string;
  featured: boolean;
  priority: "featured" | "secondary" | "optional";
};

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizeServicesFromAi(
  raw: unknown,
  priority?: {
    featured: string;
    secondary: string[];
    optional: string[];
  },
): NormalizedService[] {
  const list = Array.isArray(raw) ? raw : [];
  const mapped = list
    .map((item) => {
      const row = (item && typeof item === "object"
        ? item
        : {}) as ServicesAiItem;
      const title = clampTitle(String(row.title ?? ""));
      const isOptional =
        String(row.priority ?? "").toLowerCase() === "optional" ||
        (priority?.optional ?? []).some(
          (t) => normalizeKey(t) === normalizeKey(title),
        );
      const description = clampDescription(
        String(row.shortDescription ?? row.description ?? ""),
        isOptional ? 18 : 35,
      );
      const benefits = (Array.isArray(row.benefits) ? row.benefits : [])
        .map((b) => String(b ?? "").trim())
        .filter(Boolean)
        .slice(0, 3);
      const pRaw = String(row.priority ?? "")
        .trim()
        .toLowerCase();
      const priorityValue: NormalizedService["priority"] =
        pRaw === "featured" || pRaw === "secondary" || pRaw === "optional"
          ? pRaw
          : "secondary";
      return {
        title,
        description,
        benefits,
        icon: normalizeIcon(row.icon),
        featured: row.featured === true,
        priority: priorityValue,
      };
    })
    .filter((s) => s.title && s.description)
    .slice(0, 6);

  // Ensure exactly 3 benefits when short
  for (const s of mapped) {
    while (s.benefits.length < 3) {
      s.benefits.push("Clear next step");
    }
    s.benefits = s.benefits.slice(0, 3);
  }

  if (priority) {
    const featKey = normalizeKey(priority.featured);
    const secKeys = new Set(priority.secondary.map(normalizeKey));
    const optKeys = new Set(priority.optional.map(normalizeKey));

    for (const s of mapped) {
      const key = normalizeKey(s.title);
      if (key === featKey) {
        s.priority = "featured";
        s.featured = true;
      } else if (secKeys.has(key)) {
        s.priority = "secondary";
        s.featured = false;
      } else if (optKeys.has(key)) {
        s.priority = "optional";
        s.featured = false;
      }
    }

    // Ensure featured title exists; if AI missed it, promote first match or inject stub
    if (!mapped.some((s) => s.priority === "featured") && mapped.length) {
      const hit =
        mapped.find((s) => normalizeKey(s.title) === featKey) || mapped[0];
      hit.priority = "featured";
      hit.featured = true;
      mapped.forEach((s) => {
        if (s !== hit) s.featured = false;
      });
    }
  } else {
    const featuredIdx = mapped.findIndex((s) => s.featured);
    if (mapped.length) {
      mapped.forEach((s, i) => {
        s.featured = i === (featuredIdx >= 0 ? featuredIdx : 0);
        s.priority = s.featured
          ? "featured"
          : i <= 2
            ? "secondary"
            : "optional";
      });
    }
  }

  // Stable order: featured → secondary → optional
  const rank = { featured: 0, secondary: 1, optional: 2 };
  return mapped.sort((a, b) => rank[a.priority] - rank[b.priority]);
}
