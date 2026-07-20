import OpenAI from "openai";
import { runCrestisEngine } from "./ai-engine";
import type { BusinessFormInput } from "./business-form";
import type { WebsitePromptOptions } from "./openai-prompt";
import type { SeoMemory } from "./seo-memory";
import type { GeneratedSite } from "./site-types";

let client: OpenAI | null = null;

/** Shared OpenAI client (quality audit + legacy callers) */
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export type GenerateOptions = {
  userEmail?: string | null;
  regenerate?: boolean;
  previous?: WebsitePromptOptions["avoid"];
  /** Prior SEO Memory for this site (regenerate / iterate) */
  seoMemory?: SeoMemory;
  onEvent?: import("./ai/orchestrator/events").PipelineEventHandler;
};

/**
 * Crestis AI Engine v1 entrypoint.
 *
 * OpenAI builds DATA (JSON stages).
 * Crestis Design Planner + Next.js renderer build the website.
 */
export async function generateSiteWithOpenAI(
  input: BusinessFormInput,
  options: GenerateOptions = {},
): Promise<GeneratedSite> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return runCrestisEngine(
    input,
    {
      userEmail: options.userEmail,
      regenerate: options.regenerate,
      previous: options.previous,
      seoMemory: options.seoMemory,
    },
    undefined,
    options.onEvent,
  );
}
