import type { GeneratedSite } from "./site-types";

export type { GeneratedSite } from "./site-types";

/**
 * Legacy helper removed — all content must come from OpenAI.
 * Kept as a typed stub so old imports fail clearly at runtime if called.
 */
export function generateSiteFromPrompt(): GeneratedSite {
  throw new Error(
    "generateSiteFromPrompt is disabled. Use /api/generate with OpenAI.",
  );
}
