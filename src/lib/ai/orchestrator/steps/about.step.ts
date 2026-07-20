/**
 * Step — About Generator (+ Zod retry)
 *
 *   About → Retry → PASS → Continue
 *   About → Retry → FAIL → PipelineError
 */

import { applyAboutDataPatch } from "../../../website-ownership";
import { retryAbout } from "../../retry/retryAbout";
import type { PipelineContext, PipelineStep } from "../context";

export class AboutStep implements PipelineStep<PipelineContext> {
  id = "about";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    ctx.meta.onProgress?.({
      stage: "content_generator",
      label: "About",
    });

    const result = await retryAbout(ctx);

    return {
      ...ctx,
      website: applyAboutDataPatch(ctx.website, result.about),
      meta: {
        ...ctx.meta,
        aboutResult: result.aboutResult,
      },
    };
  }
}

export const aboutStep = new AboutStep();
