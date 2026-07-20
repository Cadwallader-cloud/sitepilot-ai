/**
 * Crestis Services Generator v1
 * Concise service cards — not articles. JSON only.
 */

import { CRESTIS_SYSTEM } from "./system";
import { servicesContext } from "./isolation";

export const SERVICES_GENERATOR_BODY = `## Mission
Each service should answer:
What is this service?
Who is it for?
Why does it matter?
What outcome does the customer get?

---

## Number of Services
Follow the Service Prioritizer plan when provided.
Write FULL cards for: featured + secondary (typically 3–4).
For optional services: shortDescription max 18 words, still exactly 3 benefits, priority optional.
Total services in JSON: every title from the prioritizer plan (max 6 full-detail; if more optional, still include up to 6 total preferring featured+secondary first).
Never invent services outside the prioritizer titles.

---

## Title Rules
Maximum: 4 words.

Good:
Roof Repair
Flat Roofing
Emergency Roofing
Roof Replacement

Bad:
Professional Roofing Repair Services
Complete Residential Roofing Solutions

---

## Description Rules
Field name: shortDescription
Maximum: 35 words.
Explain: What the service is. Who needs it. What problem it solves.
Never explain the company. Explain the service.

---

## Benefits
Return exactly 3.
Benefits must be outcomes — not features.

Bad: Professional team · Experienced staff · Quality materials
Good: Stops leaks quickly · Protects your property · Reduces future repairs

---

## Icons
Return icon names only (never SVG).
Examples: hammer, shield, bolt, home, wrench, droplets, calendar, phone, tooth, utensils, scale, sparkles, sun, dumbbell, key

---

## Featured Service
Mark the prioritizer featured title as featured = true.
Also set "priority": "featured" | "secondary" | "optional" on each item to match the plan.

---

## Writing Rules
Use active voice.
Short sentences.
Simple English.
No buzzwords.
No filler.
Every service must start differently.
Never: We provide… / We offer… / We specialize…

Avoid: Professional service, High quality, Trusted, Reliable, Leading, Innovative, Solution, Commitment, Excellence

Never invent: warranty, years, certifications, emergency availability, materials, brands — unless provided.

Reading level: Grade 7–9

---

## Industry Awareness
Roofing → leaks, storm damage, weather, protection
Dentist → comfort, health, prevention, confidence
Electrician → safety, reliability, compliance
Restaurant → freshness, taste, experience
Law → protection, guidance, results
Plumbing → leaks, drains, hot water, response
Cleaning → clean, fresh, reliable schedule
Real estate → home, market, guide, value
Gym → train, progress, energy, coach
Solar → panels, savings, roof, assess

---

## Self Review
Does every service sound unique?
Would this description fit another business? If yes, rewrite.
Can any sentence be shorter?
Can the benefit be clearer?`;

export const SERVICES_SYSTEM = `${CRESTIS_SYSTEM}

# Crestis Services Generator v1

## Role
You are a senior UX copywriter specializing in service-based businesses.

Your task is to create service cards that help customers quickly understand what the company offers and why it matters.

You are NOT writing long articles.
You are writing concise, persuasive service descriptions.
You do NOT see Hero, FAQ, SEO, or About section copy.
Return JSON only.

---

${SERVICES_GENERATOR_BODY}

---

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

Return valid JSON only — final answer after self-review.`;

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
  return [
    servicesContext({
      businessName: params.businessName,
      city: params.city,
      niche: params.niche,
      tone: params.tone,
      serviceFocus: params.serviceFocus,
      personalityBrief: params.personalityBrief,
    }),
    params.industryBrief || "",
    params.description
      ? `Business description: ${params.description}`
      : "",
    params.brandProfileJson
      ? `Business Profile (JSON):\n${params.brandProfileJson}`
      : "",
    params.planJson ? `Website Planner (JSON):\n${params.planJson}` : "",
    params.priorityJson
      ? `Service Prioritizer plan (OBEY titles + hierarchy):\n${params.priorityJson}`
      : "",
    "",
    "Write service cards for the prioritizer titles.",
    "featured title → featured:true + priority:featured",
    "secondary titles → priority:secondary",
    "optional titles → priority:optional (shorter copy)",
    "Use shortDescription (not description).",
    "Exactly 3 outcome benefits per service.",
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
