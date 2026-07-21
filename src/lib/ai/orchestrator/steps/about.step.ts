/**
 * Step — About Generator (+ Zod retry)
 *
 *   About → Retry → PASS → Continue
 *   About → Retry → FAIL → PipelineError
 */

import { applyAboutResult, prepareAboutRun } from "../../context";
import { retryAbout } from "../../retry/retryAbout";
import type { PipelineContext, PipelineStep } from "../context";

export class AboutStep implements PipelineStep<PipelineContext> {
  id = "about";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareAboutRun(ctx);
    run.pipeline.meta.onProgress?.({
      stage: "content_generator",
      label: "About",
    });

    const result = await retryAbout(run);
    return applyAboutResult(run.pipeline, result);
  }
}

export const aboutStep = new AboutStep();
