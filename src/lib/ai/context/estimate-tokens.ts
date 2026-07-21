/**
 * Token optimization — rough prompt-size estimates per section context.
 *
 * Uses JSON byte length ÷ 4 (common GPT heuristic). Logs human-readable lines:
 *
 *   Hero Context
 *   ≈ 1 250 tokens
 */

import type { PipelineContext } from "../orchestrator/context";
import { createContextCache, type ContextCache } from "./context-cache";
import {
  buildAboutContext,
  buildFAQContext,
  buildHeroContext,
  buildQAContext,
  buildSEOContext,
  buildServicesContext,
} from "./builder";

const SECTION_LABELS = {
  hero: "Hero Context",
  about: "About Context",
  services: "Services Context",
  faq: "FAQ Context",
  seo: "SEO Context",
  qa: "QA Context",
} as const;

export type ContextTokenEstimates = {
  hero: number;
  about: number;
  services: number;
  faq: number;
  seo: number;
  /** null when QA prerequisites are not ready yet */
  qa: number | null;
  total: number;
};

/** Rough GPT-style prompt token estimate from serialized JSON (~4 chars/token). */
export function estimateJsonTokens(value: unknown): number {
  let json: string;
  try {
    json = JSON.stringify(value);
  } catch {
    return 0;
  }
  if (!json || json === "undefined") return 0;
  return Math.ceil(json.length / 4);
}

/** Space-separated thousands — e.g. 1250 → "1 250". */
export function formatTokenEstimate(tokens: number): string {
  return Math.max(0, Math.round(tokens))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function logSectionEstimate(label: string, tokens: number): void {
  console.info(`${label}\n\n≈ ${formatTokenEstimate(tokens)} tokens`);
}

/** Log approximate token count for one typed section context. */
export function logSectionTokenEstimate(label: string, context: unknown): number {
  const tokens = estimateJsonTokens(context);
  logSectionEstimate(label, tokens);
  return tokens;
}

/**
 * Estimate prompt tokens for each typed section context and log the breakdown.
 * Returns numeric estimates for programmatic use (budgeting, trimming).
 */
export function estimateTokens(
  ctx: PipelineContext,
  cache?: ContextCache,
): ContextTokenEstimates {
  const c = cache ?? createContextCache(ctx);
  const hero = estimateJsonTokens(buildHeroContext(ctx, c));
  const about = estimateJsonTokens(buildAboutContext(ctx, c));
  const services = estimateJsonTokens(buildServicesContext(ctx, c));
  const faq = estimateJsonTokens(buildFAQContext(ctx, c));
  const seo = estimateJsonTokens(buildSEOContext(ctx, c));

  let qa: number | null = null;
  try {
    qa = estimateJsonTokens(buildQAContext(ctx, c));
  } catch {
    qa = null;
  }

  logSectionEstimate(SECTION_LABELS.hero, hero);
  logSectionEstimate(SECTION_LABELS.about, about);
  logSectionEstimate(SECTION_LABELS.services, services);
  logSectionEstimate(SECTION_LABELS.faq, faq);
  logSectionEstimate(SECTION_LABELS.seo, seo);
  if (qa !== null) {
    logSectionEstimate(SECTION_LABELS.qa, qa);
  }

  const total = hero + about + services + faq + seo + (qa ?? 0);

  console.info(
    "[context-tokens]",
    JSON.stringify({
      hero,
      about,
      services,
      faq,
      seo,
      qa,
      total,
    }),
  );

  return { hero, about, services, faq, seo, qa, total };
}
