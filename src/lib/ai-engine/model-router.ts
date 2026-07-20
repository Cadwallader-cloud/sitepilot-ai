/**
 * Crestis model router — site generation runs on GPT-5 mini only.
 *
 * Default pipeline:
 *   Business Analyzer → Website Planner → Template Selector
 *   → Content Generator → Theme Selector → Quality Review → Assemble
 *
 * Template + Theme are Crestis-owned (no model). Full gpt-5 never used at launch.
 */

export type ModelTier = "fast" | "quality";

/** Kept for /api/ai-status compatibility — every stage resolves to the same model. */
export const STAGE_MODEL_TIERS: Record<string, ModelTier> = {
  business_intelligence: "fast",
  competitor_intelligence: "fast",
  ux_planner: "fast",
  website_planner: "fast",
  copy_hero_ai: "fast",
  copy_about_ai: "fast",
  copy_cta_ai: "fast",
  copy_service_ai: "fast",
  copy_testimonials_ai: "fast",
  copy_faq_ai: "fast",
  visual_ai: "fast",
  design_planner: "fast",
  seo_ai: "fast",
  seo_generator: "fast",
  cro_ai: "fast",
  qa_ai: "fast",
  quality_reviewer: "fast",
  human_detector: "fast",
  final_score: "fast",
};

/** Only cheap GPT-5 family models allowed for site generation */
const DEFAULT_MODEL = "gpt-5-mini";

function isAllowedSiteModel(model: string): boolean {
  const id = model.toLowerCase();
  return (
    id === "gpt-5-mini" ||
    id.startsWith("gpt-5-mini-") ||
    id === "gpt-5-nano" ||
    id.startsWith("gpt-5-nano-")
  );
}

/**
 * Full gpt-5 / gpt-4o / etc. are remapped — site gen stays on mini.
 * Opt into other models only with CRESTIS_ALLOW_FULL_MODEL=true (not recommended at launch).
 */
function normalizeSiteModel(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return DEFAULT_MODEL;

  const allowFull =
    process.env.CRESTIS_ALLOW_FULL_MODEL?.trim().toLowerCase() === "true" ||
    process.env.CRESTIS_ALLOW_FULL_MODEL?.trim().toLowerCase() === "1";

  if (allowFull) return trimmed;
  if (isAllowedSiteModel(trimmed)) return trimmed;

  // Bare "gpt-5" or any other model → mini
  return DEFAULT_MODEL;
}

function parseRouteOverrides(): Record<string, string> {
  const raw = process.env.OPENAI_MODEL_ROUTES?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [stage, model] of Object.entries(parsed)) {
      if (typeof model === "string" && model.trim()) {
        out[stage] = normalizeSiteModel(model);
      }
    }
    return out;
  } catch {
    console.warn("OPENAI_MODEL_ROUTES is not valid JSON — ignored");
    return {};
  }
}

/** Resolved single model for Simple Engine — always gpt-5-mini unless nano opted in */
export function resolveEngineModel(): string {
  const candidates = [
    process.env.OPENAI_MODEL,
    process.env.OPENAI_MODEL_MINI,
    process.env.OPENAI_MODEL_FAST,
    process.env.OPENAI_MODEL_QUALITY,
  ];

  for (const candidate of candidates) {
    const raw = candidate?.trim();
    if (!raw) continue;
    return normalizeSiteModel(raw);
  }

  return DEFAULT_MODEL;
}

export function tierForStage(_stage: string): ModelTier {
  return "fast";
}

/**
 * Resolve which OpenAI model runs this engine stage.
 * Site generation: gpt-5-mini for every stage.
 */
export function resolveModelForStage(stage: string): string {
  const overrides = parseRouteOverrides();
  if (overrides[stage]) return overrides[stage];
  return resolveEngineModel();
}

/** Snapshot for /api/ai-status and admin debugging */
export function getModelRoutingSnapshot(): {
  routingEnabled: boolean;
  fast: string;
  quality: string;
  legacy: string | null;
  stages: { stage: string; tier: ModelTier; model: string }[];
} {
  const model = resolveEngineModel();
  const legacy = process.env.OPENAI_MODEL?.trim() || null;

  const stages = Object.keys(STAGE_MODEL_TIERS).map((stage) => ({
    stage,
    tier: "fast" as const,
    model: resolveModelForStage(stage),
  }));

  return {
    routingEnabled: true,
    fast: model,
    quality: model,
    legacy,
    stages,
  };
}
