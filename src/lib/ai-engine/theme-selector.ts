/**
 * Crestis Theme Selector
 *
 * Runs AFTER Content Generator.
 * Locks DesignSystem + colors + trade images from the chosen template.
 * Never calls OpenAI. Never invents CSS/HTML.
 */

import type { BusinessFormInput } from "../business-form";
import { colorsForPalette } from "../design-system";
import {
  designSystemFromTemplate,
  type TemplateId,
} from "../template-library";
import { attachTradeAssets, detectTrade } from "../trade-images";
import type { BusinessBrief, ContentDraft, DesignPlan, WebsitePlan } from "./types";

/**
 * Select theme tokens exclusively from Template Library.
 */
export async function selectTheme(params: {
  input: BusinessFormInput;
  brief: BusinessBrief;
  plan: WebsitePlan;
  content: ContentDraft;
  runId: string;
  templateId: TemplateId;
}): Promise<DesignPlan> {
  const { brief, plan, content, runId, templateId } = params;

  const hint = [
    brief.tradeHint,
    brief.niche,
    ...content.services.map((s) => s.title),
    runId,
  ].join(" ");
  const detectedTrade = detectTrade(hint);

  const design = designSystemFromTemplate(templateId);
  const paletteColors = colorsForPalette(design.palette);
  const assets = await attachTradeAssets(hint, undefined, runId);
  const themeStyle = assets.theme?.style ?? "professional";

  return {
    tradeKey: detectedTrade,
    theme: {
      primary: paletteColors.primary,
      accent: paletteColors.accent,
      style: themeStyle,
    },
    images: assets.images,
    design,
    sectionOrder: plan.sections,
  };
}
