/**
 * Step — FAQ Generator (+ Zod retry)
 *
 *   FAQ → Retry → PASS → Continue
 *   FAQ → Retry → FAIL → PipelineError
 */

import { applyFaqDataPatch } from "../../../website-ownership";
import { retryFAQ } from "../../retry/retryFAQ";
import type { PipelineContext, PipelineStep } from "../context";

export class FAQStep implements PipelineStep<PipelineContext> {
  id = "faq";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const result = await retryFAQ(ctx);

    return {
      ...ctx,
      website: applyFaqDataPatch(ctx.website, { items: result.faq }),
      meta: {
        ...ctx.meta,
        content: ctx.meta.content
          ? {
              ...ctx.meta.content,
              faq: result.draftItems,
            }
          : ctx.meta.content,
      },
    };
  }
}

export const faqStep = new FAQStep();
/** @deprecated Use FAQStep */
export { FAQStep as FaqStep };
