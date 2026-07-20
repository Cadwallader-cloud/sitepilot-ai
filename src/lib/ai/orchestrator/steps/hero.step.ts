/**
 * Step — Hero Generator (+ Zod retry)
 *
 *   Hero → Retry → PASS → Continue
 *   Hero → Retry → FAIL → PipelineError
 */

import { applyHeroDataPatch } from "../../../website-ownership";
import { retryHero } from "../../retry/retryHero";
import type { PipelineContext, PipelineStep } from "../context";

export class HeroStep implements PipelineStep<PipelineContext> {
  id = "hero";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    ctx.meta.onProgress?.({
      stage: "content_generator",
      label: "Hero",
    });

    const result = await retryHero(ctx);

    return {
      ...ctx,
      website: applyHeroDataPatch(ctx.website, result.hero),
      meta: {
        ...ctx.meta,
        engineCtx: result.engineCtx,
        agentCtx: result.agentCtx,
        heroResult: result.heroResult,
      },
    };
  }
}

export const heroStep = new HeroStep();
