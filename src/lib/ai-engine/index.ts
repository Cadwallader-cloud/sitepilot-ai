/**
 * CRESTIS AI ENGINE
 *
 * Single entry → Orchestrator (`runPipeline`):
 *   Business → Brand → Planner → Hero → About → Services → FAQ → SEO → QA → Website
 */

import type { BusinessFormInput } from "../business-form";
import type { GeneratedSite } from "../site-types";
import { runSimplePipeline } from "./simple-pipeline";
import type { EngineRunOptions, EngineStageName } from "./types";

export type { EngineRunOptions } from "./types";
export type { WebsiteJson } from "../website-json";
export type { Metadata, Website } from "../website";
export {
  ensureWebsite,
  flatFromWebsite,
  isWebsite,
  normalizeMetadata,
  serializeWebsite,
  deserializeWebsite,
  stampWebsiteMetadata,
  websiteFromFlat,
  websiteToGeneratedSite,
} from "../website";
export {
  AI_WEBSITE_AGENT_LABELS,
  AI_WEBSITE_OWNERSHIP,
  CRESTIS_OWNED_PATHS,
  agentOwnershipBrief,
  agentOwns,
  applyAboutDataPatch,
  applyBrandingPatch,
  applyBusinessPatch,
  applyFaqDataPatch,
  applyHeroDataPatch,
  applyPagesPatch,
  applySeoPatch,
  applyServicesDataPatch,
  applyThemePatch,
  assertAgentMayWrite,
  ownershipTableMarkdown,
  type AiWebsiteAgent,
} from "../website-ownership";
export {
  checkWebsite,
  repairWebsite,
  runJsonValidatorGate,
  type JsonValidatorGateResult,
  type WebsiteValidationIssue,
  type WebsiteValidationResult,
} from "../website-validator";
export { validateWebsite, WebsiteSchema } from "../validation/validate";
export type { AiQualityScores } from "./ai-quality-scorer";
export type { CompetitorIntelligence } from "../competitor-intelligence";
export type { UxPlan } from "../ux-plan";
export type { CroReport } from "../cro";
export type { QaReport } from "../qa";
export type { HumanDetectorReport } from "../human-detector";
export type { FinalScore } from "../final-score";
export {
  getModelRoutingSnapshot,
  resolveModelForStage,
  resolveEngineModel,
  STAGE_MODEL_TIERS,
} from "./model-router";
export { runSimplePipeline } from "./simple-pipeline";
export { selectTemplate, applyTemplateSelection } from "./template-selector";
export {
  runTemplateSelector,
  selectTemplateBlocksWithAi,
  templateSelectorInputFromPipeline,
  type TemplateSelectorInput,
  type TemplateSelectorOutput,
} from "./template-selector-ai";
export {
  layoutFromSelectorOutput,
  runLayoutSelector,
  layoutSelectorInputFromPipeline,
  resolveLayoutSelectorOutput,
  type LayoutSelectorInput,
  type LayoutSelectorOutput,
} from "./layout-selector-ai";
export { selectTheme } from "./theme-selector";
export {
  runThemeSelector,
  selectThemePresetWithAi,
  themeSelectorInputFromPipeline,
  resolveThemeSelectorOutput,
  type ThemeSelectorInput,
  type ThemeSelectorOutput,
} from "./theme-selector-ai";
export { runHeroPipeline } from "./hero-pipeline";
export { runAboutPipeline } from "./about-pipeline";
export { runBrandPersonalityEngine } from "./brand-personality-engine";
export { runServicePrioritizer } from "./service-prioritizer";
export { runSeoPlanner } from "./seo-planner";
export { runFinalSeoReview, runSeoAi } from "./seo-ai";

export type EngineProgress = {
  stage: EngineStageName;
  label: string;
};

function isDeepEngine(): boolean {
  const flag = process.env.CRESTIS_ENGINE_DEEP?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "on" || flag === "yes";
}

/**
 * Public generate entry — always Orchestrator (Acceptance Criteria).
 */
export async function runCrestisEngine(
  input: BusinessFormInput,
  options: EngineRunOptions = {},
  onProgress?: (p: EngineProgress) => void,
  onEvent?: import("../ai/orchestrator/events").PipelineEventHandler,
): Promise<GeneratedSite> {
  if (isDeepEngine()) {
    console.warn(
      "[crestis] CRESTIS_ENGINE_DEEP is ignored — generation always uses Orchestrator",
    );
  }
  return runSimplePipeline(input, options, onProgress, onEvent);
}
