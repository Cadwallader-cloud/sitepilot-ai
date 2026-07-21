/**
 * Step — FAQ Generator (+ Zod retry)
 *
 *   FAQ → Retry → PASS → Continue
 *   FAQ → Retry → FAIL → PipelineError
 */

import { applyFAQResult, prepareFAQRun } from "../../context";
import { retryFAQ } from "../../retry/retryFAQ";
import type { PipelineContext, PipelineStep } from "../context";

export class FAQStep implements PipelineStep<PipelineContext> {
  id = "faq";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareFAQRun(ctx);
    const result = await retryFAQ(run);
    return applyFAQResult(run.pipeline, result);
  }
}

export const faqStep = new FAQStep();
/** @deprecated Use FAQStep */
export { FAQStep as FaqStep };
