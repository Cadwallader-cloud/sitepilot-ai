/**
 * Step — QA → Theme → Website JSON
 */

import { assembleWebsiteJson } from "../../../ai-engine/assemble";
import { commitWebsiteViaOwnership } from "../../../ai-engine/commit-website";
import { computeFinalScoreBaseline } from "../../../ai-engine/final-score";
import { detectHumanCrestis } from "../../../ai-engine/human-crestis";
import { synthesizeQaReport } from "../../../ai-engine/qa-synthesize";
import {
  runTemplateSelector,
  templateSelectorInputFromPipeline,
} from "../../../ai-engine/template-selector-ai";
import {
  runThemeSelector,
  themeSelectorInputFromPipeline,
} from "../../../ai-engine/theme-selector-ai";
import { selectTheme } from "../../../ai-engine/theme-selector";
import { websiteFromFlat } from "../../../website";
import { runJsonValidatorGate } from "../../../website-validator";
import {
  applyQAResult,
  applyQATheme,
  prepareQARun,
} from "../../context";
import { themeFieldsFromPreset } from "@/theme";
import type { PipelineContext, PipelineStep } from "../context";

export class QAStep implements PipelineStep<PipelineContext> {
  id = "qa";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareQARun(ctx);
    void run.qa; // only QA agent sees full website
    const { meta } = run.pipeline;

    meta.onProgress?.({
      stage: "theme_selector_ai",
      label: "Theme Selector",
    });
    const themeSelectorInput = themeSelectorInputFromPipeline({
      brief: meta.brief,
      brandingTone: ctx.branding.tone,
    });
    const themeSelection = await runThemeSelector(themeSelectorInput, {
      userEmail: meta.options.userEmail,
      fallbackTemplateId: meta.templateId,
    });
    const presetId = themeSelection.theme;

    meta.onProgress?.({
      stage: "theme_selector",
      label: "Theme Engine",
    });
    const design = await selectTheme({
      input: meta.input,
      brief: meta.brief,
      plan: meta.plan!,
      content: meta.content!,
      runId: meta.runId,
      templateId: presetId,
    });

    meta.onProgress?.({
      stage: "template_selector_ai",
      label: "Template Selector",
    });
    const templateInput = templateSelectorInputFromPipeline({
      brief: meta.brief,
      plan: meta.plan!,
      templateId: presetId,
      designTheme: design.design.theme,
      brandingTone: ctx.branding.tone,
    });

    const themePatch = {
      ...themeFieldsFromPreset(presetId),
      blocks: await runTemplateSelector(templateInput, {
        userEmail: meta.options.userEmail,
      }),
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
      verdict: `About QA picked ${meta.aboutResult!.selectedStyle}: ${meta.aboutResult!.reason}`,
    };
    const { qa: qaReport, quality } = synthesizeQaReport({
      cro,
      seo: meta.seo!,
      design: design.design,
    });
    const human = detectHumanCrestis(meta.content!);
    const scores = computeFinalScoreBaseline({ qa: qaReport, cro, human });

    meta.onProgress?.({ stage: "assemble", label: "Website JSON" });
    const websiteJson = assembleWebsiteJson({
      input: meta.input,
      content: meta.content!,
      seo: meta.seo!,
      design,
      plan: meta.plan!,
      dna: meta.liveDna,
      personality: meta.personality!,
      quality,
      cro,
      qa: qaReport,
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
      business: run.pipeline.business,
      branding: run.pipeline.branding,
      metadata: {
        ...assembled.metadata,
        id: meta.runId,
      },
    };
    website = applyQATheme(website, themePatch);
    website = commitWebsiteViaOwnership(website);

    meta.onProgress?.({ stage: "json_validator", label: "JSON Validator" });
    const gated = runJsonValidatorGate(website, { maxRetries: 1 });
    if (gated.status === "pass_after_retry") {
      meta.onProgress?.({
        stage: "json_validator",
        label: "JSON Validator (retry ok)",
      });
    }

    return applyQAResult(run.pipeline, gated.website);
  }
}

export const qaStep = new QAStep();
