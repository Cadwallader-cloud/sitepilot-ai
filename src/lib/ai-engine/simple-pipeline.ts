/**
 * Crestis Simple Engine — thin entry over the orchestrator (Pipeline V2)
 *
 *   User → Business → Brand → Planner → [Hero ∥ About ∥ Services ∥ FAQ] → SEO → QA → Website JSON
 *
 * All AI modules run only through `runPipeline` (single Orchestrator).
 */

import type { BusinessFormInput } from "../business-form";
import type { GeneratedSite } from "../site-types";
import { websiteToGeneratedSite } from "../website";
import type { EngineRunOptions, EngineStageName } from "./types";
import {
  runPipeline,
  type PipelineEventHandler,
  type PipelineProgress,
} from "../ai/orchestrator";

export type SimpleProgress = {
  stage: EngineStageName;
  label: string;
};

/**
 * Crestis Simple Engine entry — product diagram order via orchestrator.
 * Returns GeneratedSite for the renderer (derived from Schema v2 Website).
 */
export async function runSimplePipeline(
  input: BusinessFormInput,
  options: EngineRunOptions = {},
  onProgress?: (p: SimpleProgress) => void,
  onEvent?: PipelineEventHandler,
): Promise<GeneratedSite> {
  const website = await runPipeline(
    input,
    options,
    onProgress as (p: PipelineProgress) => void,
    onEvent,
  );
  return websiteToGeneratedSite(website);
}
