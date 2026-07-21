/**
 * Step — Services Generator (+ prioritizer + Zod retry)
 *
 *   Services → Retry → PASS → Continue
 *   Services → Retry → FAIL → PipelineError
 */

import { applyServicesResult, prepareServicesRun } from "../../context";
import { retryServices } from "../../retry/retryServices";
import type { PipelineContext, PipelineStep } from "../context";

export class ServicesStep implements PipelineStep<PipelineContext> {
  id = "services";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const run = prepareServicesRun(ctx);
    const result = await retryServices(run);
    return applyServicesResult(run.pipeline, result);
  }
}

export const servicesStep = new ServicesStep();
