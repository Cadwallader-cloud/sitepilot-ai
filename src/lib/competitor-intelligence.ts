/**
 * Crestis AI Engine V2 — Layer 2 Competitor Intelligence
 * Live web search when available → strengths/weaknesses → superior structure.
 * Never copies competitor copy.
 */

import type { SiteLayoutSection } from "./site-types";

export type CompetitorSource = {
  title: string;
  url: string;
};

export type CompetitorProfile = {
  /** Display label, e.g. "Local storm-repair specialist" */
  label: string;
  /** Optional known brand if confident — otherwise leave empty */
  name?: string;
  url?: string;
  strengths: string[];
  weaknesses: string[];
};

export type CompetitorIntelligence = {
  /** e.g. "Dallas Roofing" */
  marketQuery: string;
  /** How Layer 2 gathered evidence */
  mode: "live_web_search" | "market_archetypes";
  competitors: CompetitorProfile[];
  /** Real URLs from web search (when mode is live) */
  sources: CompetitorSource[];
  /** What competitors do well that we must match or beat */
  whatTheyDoWell: string[];
  /** Gaps / mistakes to exploit */
  whatTheyDoPoorly: string[];
  /** Patterns Crestis must never copy */
  avoidPatterns: string[];
  /** How our site should win structurally */
  differentiationAngle: string;
  /** Better section order — structure, not copy */
  superiorStructure: SiteLayoutSection[];
  /** Short notes for Planner (structure only) */
  structureNotes: string[];
};

export function buildMarketQuery(params: {
  location: string;
  category: string;
  industry?: string;
}): string {
  const place = params.location.trim();
  const niche = (params.category || params.industry || "Business").trim();
  return `${place} ${niche}`.replace(/\s+/g, " ").trim();
}

export function normalizeCompetitorIntelligence(
  raw: Partial<CompetitorIntelligence> | Record<string, unknown>,
  fallbackQuery: string,
  defaults?: {
    mode?: CompetitorIntelligence["mode"];
    sources?: CompetitorSource[];
  },
): CompetitorIntelligence {
  const competitorsRaw = Array.isArray(raw.competitors) ? raw.competitors : [];
  const competitors: CompetitorProfile[] = competitorsRaw
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const row = c as Record<string, unknown>;
      const strengths = Array.isArray(row.strengths)
        ? row.strengths.map(String).map((s) => s.trim()).filter(Boolean)
        : [];
      const weaknesses = Array.isArray(row.weaknesses)
        ? row.weaknesses.map(String).map((s) => s.trim()).filter(Boolean)
        : [];
      const label = String(row.label ?? row.name ?? "").trim();
      if (!label) return null;
      const name = String(row.name ?? "").trim();
      const url = String(row.url ?? "").trim();
      return {
        label,
        ...(name && name !== label ? { name } : {}),
        ...(url ? { url } : {}),
        strengths: strengths.slice(0, 5),
        weaknesses: weaknesses.slice(0, 5),
      } satisfies CompetitorProfile;
    })
    .filter((c): c is CompetitorProfile => Boolean(c))
    .slice(0, 5);

  const list = (v: unknown) =>
    (Array.isArray(v) ? v : [])
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);

  const sourcesRaw = Array.isArray(raw.sources)
    ? raw.sources
    : defaults?.sources ?? [];
  const sources: CompetitorSource[] = sourcesRaw
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const row = s as { title?: string; url?: string };
      const url = String(row.url ?? "").trim();
      if (!url) return null;
      return {
        title: String(row.title ?? "").trim() || url,
        url,
      };
    })
    .filter((s): s is CompetitorSource => Boolean(s))
    .slice(0, 12);

  const structureRaw = Array.isArray(raw.superiorStructure)
    ? raw.superiorStructure
    : [];
  const superiorStructure = structureRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { id?: string; label?: string };
      const id = String(row.id ?? "").trim() as SiteLayoutSection["id"];
      const label = String(row.label ?? "").trim();
      if (!id || !label) return null;
      return { id, label } satisfies SiteLayoutSection;
    })
    .filter((s): s is SiteLayoutSection => Boolean(s));

  const mode =
    raw.mode === "live_web_search" || raw.mode === "market_archetypes"
      ? raw.mode
      : defaults?.mode ?? (sources.length ? "live_web_search" : "market_archetypes");

  return {
    marketQuery: String(raw.marketQuery ?? "").trim() || fallbackQuery,
    mode,
    competitors:
      competitors.length > 0
        ? competitors
        : [
            {
              label: "Typical local competitor site",
              strengths: ["Clear phone number", "Service list"],
              weaknesses: ["Generic headline", "Weak local proof"],
            },
          ],
    sources,
    whatTheyDoWell: list(raw.whatTheyDoWell),
    whatTheyDoPoorly: list(raw.whatTheyDoPoorly),
    avoidPatterns: list(raw.avoidPatterns),
    differentiationAngle:
      String(raw.differentiationAngle ?? "").trim() ||
      "Lead with a specific local outcome and clearer trust hierarchy than typical competitors.",
    superiorStructure,
    structureNotes: list(raw.structureNotes),
  };
}
