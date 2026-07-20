/**
 * Step — QA → Theme → Website JSON
 */

import { assembleWebsiteJson } from "../../../ai-engine/assemble";
import { commitWebsiteViaOwnership } from "../../../ai-engine/commit-website";
import { computeFinalScoreBaseline } from "../../../ai-engine/final-score";
import { detectHumanCrestis } from "../../../ai-engine/human-crestis";
import { synthesizeQaReport } from "../../../ai-engine/qa-synthesize";
import { selectTheme } from "../../../ai-engine/theme-selector";
import { websiteFromFlat } from "../../../website";
import { runJsonValidatorGate } from "../../../website-validator";
import { applyThemePatch } from "../../../website-ownership";
import type { PipelineContext, PipelineStep } from "../context";

export class QAStep implements PipelineStep<PipelineContext> {
  id = "qa";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const { meta } = ctx;
    const templateId = meta.templateId;
    if (
      !meta.plan ||
      !meta.content ||
      !meta.seo ||
      !templateId ||
      !meta.aboutResult ||
      !meta.personality
    ) {
      throw new Error("ORCHESTRATOR:qa requires content + seo + plan");
    }

    meta.onProgress?.({
      stage: "theme_selector",
      label: "Theme Selector",
    });
    const design = await selectTheme({
      input: meta.input,
      brief: meta.brief,
      plan: meta.plan,
      content: meta.content,
      runId: meta.runId,
      templateId,
    });

    const themePatch = {
      template: design.design.theme || templateId,
      palette: design.design.palette,
      font: design.design.font,
      radius: design.design.borderRadius,
      spacing: design.design.spacing,
      buttonStyle:
        String(design.design.borderRadius ?? "").toLowerCase() === "sharp"
          ? "sharp"
          : String(design.design.borderRadius ?? "").toLowerCase() === "soft"
            ? "pill"
            : "rounded",
    };

    meta.onProgress?.({
      stage: "quality_reviewer",
      label: "QA",
    });
    const cro = {
      willCall: 78,
      willSubmitForm: 74,
      trustEnough: 76,
      overallConversion: 76,
      blockers: [] as string[],
      patched: [] as string[],
      patches: {},
      verdict: `About QA picked ${meta.aboutResult.selectedStyle}: ${meta.aboutResult.reason}`,
    };
    const { qa, quality } = synthesizeQaReport({
      cro,
      seo: meta.seo,
      design: design.design,
    });
    const human = detectHumanCrestis(meta.content);
    const scores = computeFinalScoreBaseline({ qa, cro, human });

    meta.onProgress?.({ stage: "assemble", label: "Website JSON" });
    const websiteJson = assembleWebsiteJson({
      input: meta.input,
      content: meta.content,
      seo: meta.seo,
      design,
      plan: meta.plan,
      dna: meta.liveDna,
      personality: meta.personality,
      quality,
      cro,
      qa,
      human,
      scores,
      previousSeoMemory: meta.options.seoMemory,
    });
    const assembled = websiteFromFlat(websiteJson, {
      engine: "simple",
      id: meta.runId,
      status: "draft",
    });

    let website = {
      ...assembled,
      business: ctx.business,
      branding: ctx.branding,
      metadata: {
        ...assembled.metadata,
        id: meta.runId,
      },
    };
    website = applyThemePatch(website, themePatch);
    website = commitWebsiteViaOwnership(website);

    meta.onProgress?.({ stage: "json_validator", label: "JSON Validator" });
    const gated = runJsonValidatorGate(website, { maxRetries: 1 });
    if (gated.status === "pass_after_retry") {
      meta.onProgress?.({
        stage: "json_validator",
        label: "JSON Validator (retry ok)",
      });
    }

    return {
      ...ctx,
      business: gated.website.business,
      branding: gated.website.branding,
      website: gated.website,
    };
  }
}

export const qaStep = new QAStep();
