/**
 * Step — Hero Generator (+ Zod retry)
 *
 *   Hero → Retry → PASS → Continue
 *   Hero → Retry → FAIL → PipelineError
 */

import { applyHeroResult, prepareHeroRun } from "../../context";
import { retryHero } from "../../retry/retryHero";
import type { PipelineContext, PipelineStep } from "../context";

export class HeroStep implements PipelineStep<PipelineContext> {
  id = "hero";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareHeroRun(ctx);
    run.pipeline.meta.onProgress?.({
      stage: "content_generator",
      label: "Hero",
    });

    const result = await retryHero(run);
    return applyHeroResult(run.pipeline, result);
  }
}

export const heroStep = new HeroStep();
