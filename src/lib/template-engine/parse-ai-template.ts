/**
 * AI Template Selection — JSON contract (no HTML).
 *
 * Nested shape:
 * {
 *   "template": { "hero": "hero-03", "services": "services-01", "faq": "faq-02" }
 * }
 *
 * Flat shape (Template Selector AI):
 * {
 *   "hero": "hero-03",
 *   "services": "services-01",
 *   "faq": "faq-02"
 * }
 */

import { DEFAULT_TEMPLATE_BLOCKS } from "./defaults";
import type { TemplateBlocks } from "./ids";
import {
  enforceTemplateCatalog,
  logRejectedTemplatePicks,
} from "./template-rules";

/** Partial picks returned by AI — navbar optional (Crestis fallback). */
export type AiTemplateBlockSelection = {
  hero?: string;
  navbar?: string;
  about?: string;
  services?: string;
  faq?: string;
  footer?: string;
};

export type AiTemplateSelectionResponse =
  | AiTemplateBlockSelection
  | { template: AiTemplateBlockSelection };

export function parseAiTemplateSelection(
  raw: unknown,
  fallback: TemplateBlocks = DEFAULT_TEMPLATE_BLOCKS,
): TemplateBlocks {
  const { blocks, rejected } = enforceTemplateCatalog(raw, fallback);
  logRejectedTemplatePicks(rejected);
  return blocks;
}
