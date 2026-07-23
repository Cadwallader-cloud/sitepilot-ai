/**
 * Step — QA → Theme → Website JSON
 */

import { assembleWebsiteJson } from "../../../ai-engine/assemble";
import { commitWebsiteViaOwnership } from "../../../ai-engine/commit-website";
import { runContentReviewSelfHealing } from "../../../ai-engine/content-review-self-healing";
import { shouldRunContentReviewSelfHealing } from "@/lib/review/content/self-healing";
import { computeFinalScoreBaseline, runFinalScore } from "../../../ai-engine/final-score";
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
import { reviewContent } from "@/lib/review/content/engine";
import { themeFieldsFromPreset } from "@/theme";
import type { PipelineContext, PipelineStep } from "../context";
import { getGenerationProfile } from "../context";

export class QAStep implements PipelineStep<PipelineContext> {
  id = "qa";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareQARun(ctx);
    void run.qa; // only QA agent sees full website
    const { meta } = run.pipeline;
    const generationProfile = getGenerationProfile(run.pipeline);

    meta.onProgress?.({
      stage: "theme_selector",
      label: "Theme Engine",
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

    const design = await selectTheme({
      input: meta.input,
      brief: meta.brief,
      plan: meta.plan!,
      content: meta.content!,
      runId: meta.runId,
      templateId: presetId,
    });

    meta.onProgress?.({
      stage: "template_selector",
      label: "Template Engine",
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
      stage: "content_review",
      label: "Content Review",
    });
    const reviewInput = {
      location: meta.input.location,
      category: meta.input.category,
      hero: meta.content!.hero,
      about: meta.content!.about,
      services: meta.content!.services,
      faq: meta.content!.faq,
      cta: meta.content!.cta,
      contact: meta.content!.contact,
    };
    let contentReview = reviewContent(reviewInput);

    const engineCtx = {
      input: meta.input,
      options: { ...meta.options, runId: meta.runId },
      runId: meta.runId,
      brief: meta.brief,
      plan: meta.plan!,
    };
    const agentCtx = {
      ctx: engineCtx,
      brief: meta.brief!,
      plan: meta.plan!,
    };

    let healedContent = meta.content!;
    if (
      !generationProfile.skipContentReviewSelfHealing &&
      shouldRunContentReviewSelfHealing(contentReview)
    ) {
      const healed = await runContentReviewSelfHealing({
        agentCtx,
        input: reviewInput,
        content: meta.content!,
        report: contentReview,
        maxTasks: generationProfile.maxContentReviewHealingTasks,
        onProgress: (payload) =>
          meta.onProgress?.({
            stage: payload.stage,
            label: payload.label,
          }),
      });
      healedContent = healed.content;
      contentReview = healed.report;
    }
    meta.content = healedContent;

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
    const scores = generationProfile.runBenchmarkScoring
      ? await runFinalScore({
          ctx: engineCtx,
          brief: meta.brief,
          content: meta.content!,
          seo: meta.seo!,
          design: design.design,
          qa: qaReport,
          cro,
          human,
        })
      : computeFinalScoreBaseline({ qa: qaReport, cro, human });

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
      contentReview,
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
    const gated = runJsonValidatorGate(website, {
      maxRetries: generationProfile.jsonValidatorMaxRetries,
    });
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
