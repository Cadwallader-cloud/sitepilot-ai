/**
 * About — await retryAbout(ctx) | await retry(generateAbout, validateAbout, …)
 */

import { generateAboutSection } from "../../ai-engine/content-generator";
import { runAboutPipeline } from "../../ai-engine/about-pipeline";
import type { About } from "../../website";
import { validateAbout } from "../../validation/validate";
import type { AboutInput } from "../../validation/about";
import type { PipelineContext } from "../orchestrator/context";
import { prepareAboutRun, type AboutSectionRun } from "../context";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  unwrapRetryResult,
  type RetryResult,
} from "./retry";

/** Map ContentDraft about → AboutSchema shape */
export function aboutForValidation(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const row = raw as Record<string, unknown>;
  return {
    title: row.title,
    paragraphs: row.paragraphs,
    highlights: row.highlights,
  };
}

export type RetryAboutFromContext = {
  about: About;
  aboutInput: AboutInput;
  aboutResult: NonNullable<PipelineContext["meta"]["aboutResult"]>;
};

/** Classic: await retry(generateAbout, validateAbout, { module: "About" }) */
export async function retryAbout(
  generateAbout: () => Promise<unknown>,
  maxAttempts?: number,
): Promise<RetryResult<AboutInput>>;

/** Orchestrator: await retryAbout(run) */
export async function retryAbout(
  run: AboutSectionRun,
): Promise<RetryAboutFromContext>;

/** @deprecated Prefer AboutSectionRun from Context Manager */
export async function retryAbout(
  ctx: PipelineContext,
): Promise<RetryAboutFromContext>;

export async function retryAbout(
  arg: (() => Promise<unknown>) | AboutSectionRun | PipelineContext,
  maxAttempts = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<AboutInput> | RetryAboutFromContext> {
  if (typeof arg === "function") {
    return retry<AboutInput>(
      async () => aboutForValidation(await arg()),
      validateAbout,
      { module: "About", maxAttempts },
    );
  }

  const run = "about" in arg ? arg : prepareAboutRun(arg);
  const ctx = run.pipeline;
  void run.about;
  const { meta } = ctx;
  if (!meta.plan || !meta.selection || !meta.agentCtx) {
    throw new Error("ORCHESTRATOR:about requires plan + agentCtx");
  }

  let aboutResult = await runAboutPipeline({
    businessName: meta.input.businessName,
    location: meta.input.location,
    category: meta.category || meta.industryPack.label || meta.tradeKey,
    services: meta.input.services,
    description: meta.input.description || "",
    dna: meta.liveDna,
    plan: meta.plan,
    templateBrief: meta.selection.copyBrief,
    personalityBrief: meta.personalityBrief,
    industryBrief: meta.copySeedBrief,
    userEmail: meta.options.userEmail,
    regenerate: meta.options.regenerate,
    onProgress: (p) =>
      meta.onProgress?.({
        stage: p.stage,
        label: p.label,
      }),
  });

  let aboutAttempt = 0;
  const generateAbout = async () => {
    aboutAttempt += 1;
    if (aboutAttempt === 1) return aboutForValidation(aboutResult.about);
    meta.onProgress?.({
      stage: "about_retry",
      label: `About retry #${aboutAttempt}`,
    });
    return aboutForValidation(await generateAboutSection(meta.agentCtx!));
  };

  const aboutInput = unwrapRetryResult(
    await retry<AboutInput>(generateAbout, validateAbout, {
      module: "About",
      userEmail: meta.options.userEmail,
      runId: meta.runId,
      maxAttempts,
    }),
  );

  aboutResult = {
    ...aboutResult,
    about: {
      ...aboutResult.about,
      ...aboutInput,
      text: Array.isArray(aboutInput.paragraphs)
        ? aboutInput.paragraphs.join("\n\n")
        : aboutResult.about.text,
    },
  };

  const about: About = {
    title: aboutResult.about.title,
    paragraphs:
      aboutResult.about.paragraphs ??
      (aboutResult.about.text
        ? aboutResult.about.text
            .split(/\n\n+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : []),
    highlights: aboutResult.about.highlights ?? [],
  };

  return {
    about,
    aboutInput,
    aboutResult,
  };
}
