/**
 * Crestis SEO Planner v1
 * Runs after Business Analyzer, before content generators.
 */

import { getIndustryPack } from "../industries";
import { seoMemoryBrief, type SeoMemory } from "../seo-memory";
import { completeJsonObject } from "./openai-json";
import {
  SEO_PLANNER_SYSTEM,
  seoPlannerUser,
} from "./prompts/seo-planner";

export type SeoPlan = {
  primaryKeyword: string;
  secondaryKeywords: string[];
  entities: string[];
  searchIntent: string;
  titlePattern: string;
  metaAngle: string;
  localSeoAngle: string;
  schemaType: string;
  slug: string;
  internalLinkTargets: string[];
  avoid: string[];
  notes: string[];
};

const ALLOWED_SECTIONS = new Set([
  "hero",
  "services",
  "why_us",
  "about",
  "trust",
  "projects",
  "gallery",
  "menu",
  "testimonials",
  "faq",
  "contact",
]);

function cleanList(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const s = String(item ?? "")
      .trim()
      .replace(/\s+/g, " ");
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

export function normalizeSeoPlan(
  raw: unknown,
  fallback: {
    businessName: string;
    city: string;
    niche: string;
    serviceFocus: string[];
  },
): SeoPlan {
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const primary =
    String(row.primaryKeyword ?? "").trim() ||
    `${fallback.serviceFocus[0] || fallback.niche} in ${fallback.city}`;

  const secondary = cleanList(row.secondaryKeywords, 12);
  const entities = cleanList(row.entities, 16);
  const avoid = cleanList(row.avoid, 10);
  const notes = cleanList(row.notes, 6);

  const targets = cleanList(row.internalLinkTargets, 8)
    .map((t) => t.replace(/^#/, "").toLowerCase())
    .filter((t) => ALLOWED_SECTIONS.has(t));

  const slugRaw = String(row.slug ?? "/").trim().toLowerCase();
  const slug =
    !slugRaw || slugRaw === "home" || slugRaw === "homepage" ? "/" : slugRaw;

  return {
    primaryKeyword: primary.slice(0, 80),
    secondaryKeywords: secondary.length
      ? secondary
      : [
          `${fallback.niche} ${fallback.city}`,
          ...fallback.serviceFocus.slice(0, 5),
          fallback.businessName,
        ].filter(Boolean),
    entities: entities.length
      ? entities
      : [fallback.niche, fallback.city, "Homeowner", "Quote", "Inspection"],
    searchIntent:
      String(row.searchIntent ?? "").trim() || "Local",
    titlePattern:
      String(row.titlePattern ?? "").trim() ||
      `{Primary} in {City} | {Brand}`,
    metaAngle:
      String(row.metaAngle ?? "").trim() ||
      `Explain what ${fallback.businessName} offers in ${fallback.city} and invite contact.`,
    localSeoAngle:
      String(row.localSeoAngle ?? "").trim() ||
      `Mention ${fallback.city} once, naturally.`,
    schemaType:
      String(row.schemaType ?? "").trim() || "LocalBusiness",
    slug: slug.startsWith("/") ? slug : `/${slug}`,
    internalLinkTargets: targets.length
      ? targets
      : ["services", "about", "faq", "contact"],
    avoid: avoid.length
      ? avoid
      : ["best in the world", "industry leading", "#1", "guaranteed ranking"],
    notes: notes.length
      ? notes
      : [
          "Keep title human and clickable.",
          "Do not repeat the city name.",
          "Align keywords with real services only.",
        ],
  };
}

export function seoPlanBrief(plan: SeoPlan): string {
  return [
    "SEO PLAN (strategy for all copy + Final SEO Review):",
    `Primary keyword: ${plan.primaryKeyword}`,
    `Secondary keywords: ${plan.secondaryKeywords.join(" · ")}`,
    `Entities: ${plan.entities.join(", ")}`,
    `Search intent: ${plan.searchIntent}`,
    `Title pattern: ${plan.titlePattern}`,
    `Meta angle: ${plan.metaAngle}`,
    `Local SEO angle: ${plan.localSeoAngle}`,
    `Schema type: ${plan.schemaType}`,
    `Slug: ${plan.slug}`,
    `Internal links: ${plan.internalLinkTargets.map((t) => `#${t}`).join(", ")}`,
    `Avoid: ${plan.avoid.join(" · ")}`,
    `Notes: ${plan.notes.join(" | ")}`,
    "Use naturally — never keyword stuff.",
  ].join("\n");
}

export async function runSeoPlanner(params: {
  businessName: string;
  industry: string;
  location: string;
  description: string;
  services: string;
  dnaJson: string;
  city: string;
  niche: string;
  serviceFocus: string[];
  industryId?: string;
  userEmail?: string | null;
  seoMemory?: SeoMemory | null;
}): Promise<SeoPlan> {
  const pack = getIndustryPack(params.industryId);
  const industrySeoBrief =
    pack.id === "general"
      ? undefined
      : [
          `Industry SEO vocab (${pack.label}):`,
          `Primary terms: ${pack.seoVocab.primaryTerms.join(", ")}`,
          `Local modifiers: ${pack.seoVocab.localModifiers.join(", ")}`,
          `Avoid: ${pack.seoVocab.avoid.join(", ")}`,
        ].join("\n");

  try {
    const ai = await completeJsonObject<Partial<SeoPlan>>({
      stage: "seo_ai",
      userEmail: params.userEmail,
      temperature: 0.35,
      maxCompletionTokens: 2048,
      system: SEO_PLANNER_SYSTEM,
      user: seoPlannerUser({
        businessName: params.businessName,
        industry: params.industry,
        location: params.location,
        description: params.description,
        services: params.services,
        dnaJson: params.dnaJson,
        industrySeoBrief,
        seoMemoryBrief: seoMemoryBrief(params.seoMemory),
      }),
    });
    return normalizeSeoPlan(ai, {
      businessName: params.businessName,
      city: params.city,
      niche: params.niche,
      serviceFocus: params.serviceFocus,
    });
  } catch (error) {
    console.warn("SEO Planner failed, using Crestis fallback:", error);
    return normalizeSeoPlan(null, {
      businessName: params.businessName,
      city: params.city,
      niche: params.niche,
      serviceFocus: params.serviceFocus,
    });
  }
}
