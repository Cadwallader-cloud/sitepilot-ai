/**
 * Step — SEO Generator (+ Zod retry)
 *
 *   SEO → Retry → PASS → Continue
 *   SEO → Retry → FAIL → PipelineError
 */

import { applySEOResult, prepareSEORun } from "../../context";
import { retrySEO } from "../../retry/retrySEO";
import type { PipelineContext, PipelineStep } from "../context";

export class SEOStep implements PipelineStep<PipelineContext> {
  id = "seo";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareSEORun(ctx);
    const result = await retrySEO(run);
    return applySEOResult(run.pipeline, result);
  }
}

export const seoStep = new SEOStep();
/** @deprecated Use SEOStep */
export { SEOStep as SeoStep };
