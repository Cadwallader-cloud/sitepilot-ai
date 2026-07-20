import {
  applyDesignRecommendations,
  colorsForPalette,
  planDesignSystem,
  resolvePaletteDirection,
} from "../design-system";
import { attachTradeAssets, detectTrade } from "../trade-images";
import { completeJsonObject } from "./openai-json";
import { VISUAL_AI_SYSTEM, visualAiUser } from "./prompts/visual-ai";
import type {
  BusinessBrief,
  ContentDraft,
  DesignPlan,
  EngineContext,
  WebsitePlan,
} from "./types";

type VisualAiJson = {
  theme?: string;
  palette?: string;
  font?: string;
  radius?: string;
  spacing?: string;
  imageStyle?: string;
  sectionStyle?: string;
};

async function buildVisualPlan(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  content: ContentDraft;
  plan?: WebsitePlan;
  useAi: boolean;
}): Promise<DesignPlan> {
  const { ctx, brief, content, plan, useAi } = params;
  const hint = [
    brief.tradeHint,
    brief.niche,
    ...content.services.map((s) => s.title),
    ctx.runId,
  ].join(" ");

  const detectedTrade = detectTrade(hint);
  let design = planDesignSystem({
    tradeKey: detectedTrade,
    tone: (plan?.tone || brief.tone).toLowerCase(),
    seed: [
      ctx.input.businessName,
      brief.city,
      brief.dna?.brandPosition,
      ctx.runId,
    ]
      .filter(Boolean)
      .join("::"),
  });

  // Prefer Template Library locked tokens when planner picked a template
  if (plan?.template) {
    try {
      const { designSystemFromTemplate, resolveTemplateId } = await import(
        "../template-library"
      );
      const templateId = resolveTemplateId(plan.template, {
        industry: brief.dna?.industry,
        tradeKey: detectedTrade,
        tone: plan.tone,
        websiteStyle: brief.dna?.websiteStyle,
      });
      design = designSystemFromTemplate(templateId);
    } catch (error) {
      console.warn("Template library apply failed, keeping trade baseline:", error);
    }
  } else if (plan?.style) {
    try {
      const { designSystemFromStyle, resolveStyleId } = await import(
        "../style-library"
      );
      const styleId = resolveStyleId(plan.style, {
        industry: brief.dna?.industry,
        tradeKey: detectedTrade,
        tone: plan.tone,
      });
      design = designSystemFromStyle(styleId);
    } catch (error) {
      console.warn("Style library apply failed, keeping trade baseline:", error);
    }
  }

  // Template locks palette — only apply colorDirection when no template
  if (!plan?.template) {
    const directed = resolvePaletteDirection(plan?.colorDirection);
    if (directed) {
      design = { ...design, palette: directed };
    }
  }

  // Skip Visual AI invent when Template Library owns design
  if (useAi && !plan?.template) {
    try {
      const ai = await completeJsonObject<VisualAiJson>({
        stage: "visual_ai",
        userEmail: ctx.options.userEmail,
        temperature: 0.4,
        system: VISUAL_AI_SYSTEM,
        user: visualAiUser({
          businessName: ctx.input.businessName,
          city: brief.city,
          niche: brief.niche,
          tone: plan?.tone || brief.tone,
          tradeKey: detectedTrade,
          brandPosition: brief.dna?.brandPosition,
          brandPersonality: brief.dna?.brandPersonality,
          colorDirection: plan?.colorDirection,
          goal: plan?.goal,
          serviceTitles: content.services.map((s) => s.title),
        }),
      });

      design = applyDesignRecommendations(design, ai);
    } catch (error) {
      console.warn("Visual AI failed, using Crestis baseline:", error);
    }
  }

  const paletteColors = colorsForPalette(design.palette);
  const assets = await attachTradeAssets(hint, undefined, ctx.runId);

  return {
    tradeKey: detectedTrade,
    theme: {
      primary: paletteColors.primary,
      accent: paletteColors.accent,
      style: assets.theme?.style ?? "professional",
    },
    images: assets.images,
    design,
    sectionOrder: plan?.sections,
  };
}

/** Crestis design tokens + trade images — no GPT (fast path). */
export async function runVisualCrestis(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  plan?: WebsitePlan,
): Promise<DesignPlan> {
  return buildVisualPlan({ ctx, brief, content, plan, useAi: false });
}

/**
 * Layer 5 — Visual AI
 * Decides visual configuration JSON only. Crestis maps tokens → CSS.
 * Never HTML.
 */
export async function runVisualAi(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  plan?: WebsitePlan,
): Promise<DesignPlan> {
  return buildVisualPlan({ ctx, brief, content, plan, useAi: true });
}
