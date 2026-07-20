/**
 * SEO — await retrySEO(ctx) | await retry(generateSEO, validateSEO, …)
 */

import { runFinalSeoReview } from "../../ai-engine/seo-ai";
import type { SeoDraft } from "../../ai-engine/types";
import type { SEO } from "../../website";
import { validateSEO } from "../../validation/validate";
import type { SeoInput } from "../../validation/seo";
import type { PipelineContext } from "../orchestrator/context";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  unwrapRetryResult,
  type RetryResult,
} from "./retry";

/** Keep core SeoSchema fields for validation */
export function seoForValidation(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const row = raw as Record<string, unknown>;
  return {
    title: row.title,
    description: row.description,
    keywords: row.keywords,
    canonical: row.canonical,
  };
}

export type RetrySEOFromContext = {
  seo: SEO;
  seoDraft: SeoDraft;
};

/** Classic: await retry(generateSEO, validateSEO, { module: "SEO" }) */
export async function retrySEO(
  generateSEO: () => Promise<unknown>,
  maxAttempts?: number,
): Promise<RetryResult<SeoInput>>;

/** Orchestrator: await retrySEO(ctx) */
export async function retrySEO(
  ctx: PipelineContext,
): Promise<RetrySEOFromContext>;

export async function retrySEO(
  arg: (() => Promise<unknown>) | PipelineContext,
  maxAttempts = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<SeoInput> | RetrySEOFromContext> {
  if (typeof arg === "function") {
    return retry<SeoInput>(
      async () => seoForValidation(await arg()),
      validateSEO,
      { module: "SEO", maxAttempts },
    );
  }

  const ctx = arg;
  const { meta } = ctx;
  if (!meta.engineCtx || !meta.plan || !meta.content) {
    throw new Error("ORCHESTRATOR:seo requires content + plan");
  }

  meta.onProgress?.({
    stage: "seo_ai",
    label: "SEO Generator",
  });

  let seoDraft = await runFinalSeoReview(
    meta.engineCtx,
    meta.brief,
    meta.content,
    meta.plan,
    meta.seoPlan,
  );

  let seoAttempt = 0;
  const generateSEO = async () => {
    seoAttempt += 1;
    if (seoAttempt === 1) return seoForValidation(seoDraft);
    meta.onProgress?.({
      stage: "seo_retry",
      label: `SEO retry #${seoAttempt}`,
    });
    seoDraft = await runFinalSeoReview(
      meta.engineCtx!,
      meta.brief,
      meta.content!,
      meta.plan!,
      meta.seoPlan,
    );
    return seoForValidation(seoDraft);
  };

  const seoInput = unwrapRetryResult(
    await retry<SeoInput>(generateSEO, validateSEO, {
      module: "SEO",
      userEmail: meta.options.userEmail,
      runId: meta.runId,
      maxAttempts,
    }),
  );

  const seoMerged = { ...seoDraft, ...seoInput };
  const seo: SEO = {
    title: seoMerged.title || "",
    description: seoMerged.description || "",
    keywords: Array.isArray(seoMerged.keywords) ? seoMerged.keywords : [],
    canonical: seoMerged.canonical || seoMerged.slug || "/",
    schema:
      seoMerged.schema && typeof seoMerged.schema === "object"
        ? (seoMerged.schema as Record<string, unknown>)
        : null,
    openGraph: {
      title: seoMerged.ogTitle || seoMerged.title || "",
      description: seoMerged.ogDescription || seoMerged.description || "",
    },
    twitter: {
      title: seoMerged.ogTitle || seoMerged.title || "",
      description: seoMerged.ogDescription || seoMerged.description || "",
    },
  };

  return {
    seo,
    seoDraft: seoMerged,
  };
}
