/**
 * Step — SEO Generator (+ Zod retry)
 *
 *   SEO → Retry → PASS → Continue
 *   SEO → Retry → FAIL → PipelineError
 */

import { applySeoPatch } from "../../../website-ownership";
import { retrySEO } from "../../retry/retrySEO";
import type { PipelineContext, PipelineStep } from "../context";

export class SEOStep implements PipelineStep<PipelineContext> {
  id = "seo";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const result = await retrySEO(ctx);

    return {
      ...ctx,
      website: applySeoPatch(ctx.website, result.seo),
      meta: {
        ...ctx.meta,
        seo: result.seoDraft,
      },
    };
  }
}

export const seoStep = new SEOStep();
/** @deprecated Use SEOStep */
export { SEOStep as SeoStep };
