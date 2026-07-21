/**
 * Locked React block catalog — for Template Selector AI prompts.
 */

import {
  ABOUT_TEMPLATE_IDS,
  FAQ_TEMPLATE_IDS,
  FOOTER_TEMPLATE_IDS,
  HERO_TEMPLATE_IDS,
  NAVBAR_TEMPLATE_IDS,
  SERVICES_TEMPLATE_IDS,
} from "@/lib/template-engine";
import { templateMetadataCatalogForPrompt } from "@/lib/template-engine/metadata";

/** Template metadata catalog — AI selects by style, industry, layout. */
export function templateBlockCatalogForPrompt(): string {
  return templateMetadataCatalogForPrompt();
}

/** Id-only catalog (legacy / debugging). */
export function templateBlockIdsForPrompt(): string {
  return JSON.stringify(
    {
      hero: HERO_TEMPLATE_IDS,
      navbar: NAVBAR_TEMPLATE_IDS,
      about: ABOUT_TEMPLATE_IDS,
      services: SERVICES_TEMPLATE_IDS,
      faq: FAQ_TEMPLATE_IDS,
      footer: FOOTER_TEMPLATE_IDS,
    },
    null,
    2,
  );
}
