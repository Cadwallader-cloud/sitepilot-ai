import {
  buildMarketQuery,
  normalizeCompetitorIntelligence,
  type CompetitorIntelligence,
} from "../competitor-intelligence";
import { searchLiveCompetitors } from "./competitor-search";
import { completeJsonObject } from "./openai-json";
import {
  COMPETITOR_INTEL_SYSTEM,
  competitorIntelUser,
} from "./prompts/competitors";
import type { BusinessBrief, EngineContext } from "./types";

function archetypeFallback(
  marketQuery: string,
  brief: BusinessBrief,
): CompetitorIntelligence {
  return normalizeCompetitorIntelligence(
    {
      marketQuery,
      mode: "market_archetypes",
      competitors: [
        {
          label: `Typical ${brief.dna.industry} site in ${brief.city}`,
          strengths: ["Lists services", "Shows phone number"],
          weaknesses: [
            "Generic headline",
            "Weak local specificity",
            "Cluttered CTA",
          ],
        },
        {
          label: "Franchise-style competitor",
          strengths: ["Polished look", "Warranty messaging"],
          weaknesses: ["Feels impersonal", "Thin local proof"],
        },
        {
          label: "Directory / lead-gen listing",
          strengths: ["High SEO visibility"],
          weaknesses: ["Weak brand trust", "Thin service detail"],
        },
      ],
      sources: [],
      whatTheyDoWell: ["Visible phone", "Service grids"],
      whatTheyDoPoorly: ["Cliché heroes", "No clear trust order"],
      avoidPatterns: [
        "Professional … Services",
        "Welcome",
        "Quality You Can Trust",
      ],
      differentiationAngle: `Beat ${brief.city} competitors with a specific local outcome hero and clearer trust → services → FAQ flow.`,
      structureNotes: [
        "Lead with a city-specific outcome",
        "Keep services to 3 sharp cards",
        "Place trust proof before FAQ",
      ],
    },
    marketQuery,
    { mode: "market_archetypes", sources: [] },
  );
}

/** Instant Crestis archetypes — no GPT, no web_search (fast path). */
export function analyzeCompetitorsCrestis(
  ctx: EngineContext,
  brief: BusinessBrief,
): CompetitorIntelligence {
  const marketQuery = buildMarketQuery({
    location: brief.city || ctx.input.location,
    category: ctx.input.category || brief.dna.industry,
    industry: brief.dna.industry,
  });
  return archetypeFallback(marketQuery, brief);
}

/**
 * Layer 2 — Competitor Intelligence
 * 1) Live web_search for market query (Dallas Roofing)
 * 2) Analyze strengths/weaknesses → superior structure
 * 3) Fallback to market archetypes if search fails
 * Never copies. Never writes page copy.
 */
export async function analyzeCompetitors(
  ctx: EngineContext,
  brief: BusinessBrief,
): Promise<CompetitorIntelligence> {
  const marketQuery = buildMarketQuery({
    location: brief.city || ctx.input.location,
    category: ctx.input.category || brief.dna.industry,
    industry: brief.dna.industry,
  });

  // Fast path / regenerate: skip live web_search (slow)
  const live = ctx.options.regenerate
    ? {
        ok: false as const,
        mode: "disabled" as const,
        marketQuery,
        competitors: [],
        sources: [],
        error: "skipped_on_regenerate",
      }
    : await searchLiveCompetitors({
        marketQuery,
        location: brief.city,
        category: ctx.input.category || brief.dna.industry,
        userEmail: ctx.options.userEmail,
      });

  const liveMode = live.ok ? "live_web_search" : "market_archetypes";
  const liveSearchJson = live.ok
    ? JSON.stringify(
        {
          competitors: live.competitors,
          sources: live.sources,
          notes: live.rawNotes,
        },
        null,
        2,
      )
    : JSON.stringify(
        {
          searchStatus: live.mode,
          error: live.error ?? "unavailable",
          hint: "Use market archetypes only — no invented URLs",
        },
        null,
        2,
      );

  try {
    const ai = await completeJsonObject<Partial<CompetitorIntelligence>>({
      stage: "competitor_intelligence",
      userEmail: ctx.options.userEmail,
      temperature: 0.4,
      system: COMPETITOR_INTEL_SYSTEM,
      user: competitorIntelUser({
        marketQuery,
        businessName: ctx.input.businessName,
        location: brief.city,
        category: ctx.input.category || brief.dna.industry,
        dnaJson: JSON.stringify(brief.dna, null, 2),
        liveSearchJson,
        liveMode,
      }),
    });

    const normalized = normalizeCompetitorIntelligence(ai, marketQuery, {
      mode: liveMode,
      sources: live.sources,
    });

    // Prefer live sources; keep analysis competitors but attach URLs when possible
    if (live.ok && live.sources.length) {
      normalized.mode = "live_web_search";
      normalized.sources = live.sources;
    }

    return normalized;
  } catch (error) {
    console.warn("Competitor Intelligence AI failed, using fallback:", error);
    if (live.ok) {
      // Still return live hits even if analysis JSON failed
      return normalizeCompetitorIntelligence(
        {
          marketQuery,
          mode: "live_web_search",
          competitors: live.competitors.map((c) => ({
            label: c.name,
            name: c.name,
            url: c.url,
            strengths: c.notes ? [c.notes] : ["Visible online presence"],
            weaknesses: ["Needs deeper structural audit"],
          })),
          sources: live.sources,
          whatTheyDoWell: ["Found via live web search"],
          whatTheyDoPoorly: ["Analysis incomplete — used live list only"],
          avoidPatterns: [
            "Professional … Services",
            "Welcome",
            "Quality You Can Trust",
          ],
          differentiationAngle: `Use a sharper local structure than ${marketQuery} competitors found online.`,
          structureNotes: [
            "Lead with a city-specific outcome",
            "Keep services to 3 sharp cards",
          ],
        },
        marketQuery,
        { mode: "live_web_search", sources: live.sources },
      );
    }
    return archetypeFallback(marketQuery, brief);
  }
}

export type { CompetitorIntelligence };
