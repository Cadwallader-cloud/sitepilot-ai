/**
 * Shared section inputs — every selector exposes this core bag.
 *
 *   { business, planner, branding }
 */

import type { Branding, Business } from "../../website";
import type { WebsitePlan } from "../../ai-engine/types";
import type { PipelineContext } from "../orchestrator/context";

export type SharedContext = {
  business: Business;
  /** Website Planner output (undefined before planner step). */
  planner: WebsitePlan | undefined;
  branding: Branding;
};

export function selectShared(ctx: PipelineContext): SharedContext {
  return {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
}
