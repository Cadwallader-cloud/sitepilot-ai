import type { CompetitorIntelligence } from "../competitor-intelligence";
import { detectTrade } from "../trade-images";
import {
  defaultUxSections,
  normalizeUxSections,
  type UxPlan,
} from "../ux-plan";
import { completeJsonObject } from "./openai-json";
import { UX_PLANNER_SYSTEM, uxPlannerUser } from "./prompts/ux-planner";
import type { BusinessBrief, EngineContext } from "./types";

/** Instant niche UX — no GPT (fast path). */
export function planUxCrestis(
  ctx: EngineContext,
  brief: BusinessBrief,
): UxPlan {
  const nicheKey = detectTrade(
    [
      brief.dna.industry,
      brief.dna.subcategory,
      ctx.input.category,
      brief.tradeHint,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return {
    nicheKey,
    sections: defaultUxSections(nicheKey),
    rationale: [
      nicheKey === "restaurant"
        ? "Restaurant UX: menu and gallery before trust"
        : "Trade UX: trust and services before projects",
    ],
  };
}

/**
 * Layer 3 — UX Planner
 * Decides section order / UX only. Never writes website copy.
 * Restaurant order ≠ roofing order.
 */
export async function planUx(
  ctx: EngineContext,
  brief: BusinessBrief,
  competitors?: CompetitorIntelligence,
): Promise<UxPlan> {
  const fallback = planUxCrestis(ctx, brief);
  const nicheKey = fallback.nicheKey;

  try {
    const ai = await completeJsonObject<{
      sections?: unknown;
      rationale?: unknown;
    }>({
      stage: "ux_planner",
      userEmail: ctx.options.userEmail,
      temperature: 0.35,
      system: UX_PLANNER_SYSTEM,
      user: uxPlannerUser({
        businessName: ctx.input.businessName,
        location: brief.city,
        category: ctx.input.category || brief.dna.industry,
        nicheKey,
        dnaJson: JSON.stringify(brief.dna, null, 2),
        competitorJson: JSON.stringify(
          competitors
            ? {
                mode: competitors.mode,
                marketQuery: competitors.marketQuery,
                whatTheyDoPoorly: competitors.whatTheyDoPoorly,
                differentiationAngle: competitors.differentiationAngle,
                superiorStructure: competitors.superiorStructure,
                structureNotes: competitors.structureNotes,
              }
            : {},
          null,
          2,
        ),
      }),
    });

    const sections = normalizeUxSections(ai.sections, nicheKey);
    const rationale = (
      Array.isArray(ai.rationale) ? ai.rationale.map(String) : []
    )
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);

    return {
      nicheKey,
      sections,
      rationale: rationale.length ? rationale : fallback.rationale,
    };
  } catch (error) {
    console.warn("UX Planner AI failed, using niche defaults:", error);
    return fallback;
  }
}

export type { UxPlan };
