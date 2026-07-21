/**
 * FAQ — await retryFAQ(ctx) | await retry(generateFAQ, validateFAQ, …)
 */

import { generateFaqSection } from "../../ai-engine/content-generator";
import type { FAQ } from "../../website";
import { validateFAQ } from "../../validation/validate";
import type { FaqSectionInput } from "../../validation/faq";
import type { PipelineContext } from "../orchestrator/context";
import { prepareFAQRun, type FAQSectionRun } from "../context";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  softRetryResult,
  type RetryResult,
} from "./retry";
import { faqInputFallback } from "./section-fallbacks";

/** Generators return FAQ[]; section schema expects { items } */
export function faqForValidation(raw: unknown): unknown {
  if (Array.isArray(raw)) return { items: raw };
  return raw;
}

export type RetryFAQFromContext = {
  faq: FAQ[];
  draftItems: FaqSectionInput["items"];
};

/** Classic: await retry(generateFAQ, validateFAQ, { module: "FAQ" }) */
export async function retryFAQ(
  generateFAQ: () => Promise<unknown>,
  maxAttempts?: number,
): Promise<RetryResult<FaqSectionInput>>;

/** Orchestrator: await retryFAQ(run) */
export async function retryFAQ(
  run: FAQSectionRun,
): Promise<RetryFAQFromContext>;

/** @deprecated Prefer FAQSectionRun from Context Manager */
export async function retryFAQ(
  ctx: PipelineContext,
): Promise<RetryFAQFromContext>;

export async function retryFAQ(
  arg: (() => Promise<unknown>) | FAQSectionRun | PipelineContext,
  maxAttempts = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<FaqSectionInput> | RetryFAQFromContext> {
  if (typeof arg === "function") {
    return retry<FaqSectionInput>(
      async () => faqForValidation(await arg()),
      validateFAQ,
      { module: "FAQ", maxAttempts },
    );
  }

  const run = "faq" in arg ? arg : prepareFAQRun(arg);
  const ctx = run.pipeline;
  void run.faq;
  const { meta } = ctx;
  if (!meta.agentCtx || !meta.content) {
    throw new Error("ORCHESTRATOR:faq requires content");
  }

  meta.onProgress?.({
    stage: "faq_generator",
    label: "FAQ",
  });

  let faqAttempt = 0;
  const generateFAQ = async () => {
    faqAttempt += 1;
    if (faqAttempt > 1) {
      meta.onProgress?.({
        stage: "faq_retry",
        label: `FAQ retry #${faqAttempt}`,
      });
    }
    return faqForValidation(await generateFaqSection(meta.agentCtx!));
  };

  const faqRetry = await retry<FaqSectionInput>(generateFAQ, validateFAQ, {
    module: "FAQ",
    userEmail: meta.options.userEmail,
    runId: meta.runId,
    maxAttempts,
  });
  const validated = softRetryResult(
    faqRetry,
    faqInputFallback({
      businessName: meta.input.businessName,
      category: meta.category || meta.industryPack.label || meta.tradeKey,
      location: meta.input.location,
      services: meta.input.services,
      description: meta.input.description,
    }),
  ).data;

  const draftItems = Array.isArray(validated.items) ? validated.items : [];
  const faq: FAQ[] = draftItems.map((f) => ({
    question: f.question,
    answer: f.answer,
    category: f.category || "General",
  }));

  return {
    faq,
    draftItems,
  };
}
