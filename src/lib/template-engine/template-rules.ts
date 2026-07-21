/**
 * Template Rules — AI may only pick ids from the locked catalog.
 * Invented ids (e.g. hero-92) are rejected and replaced with Crestis defaults.
 */

import { DEFAULT_TEMPLATE_BLOCKS } from "./defaults";
import {
  ABOUT_TEMPLATE_IDS,
  FAQ_TEMPLATE_IDS,
  FOOTER_TEMPLATE_IDS,
  HERO_TEMPLATE_IDS,
  NAVBAR_TEMPLATE_IDS,
  SERVICES_TEMPLATE_IDS,
  TEMPLATE_BLOCK_KINDS,
  type AboutTemplateId,
  type FaqTemplateId,
  type FooterTemplateId,
  type HeroTemplateId,
  type NavbarTemplateId,
  type ServicesTemplateId,
  type TemplateBlockKind,
  type TemplateBlocks,
} from "./ids";

export const TEMPLATE_CATALOG = {
  hero: HERO_TEMPLATE_IDS,
  navbar: NAVBAR_TEMPLATE_IDS,
  about: ABOUT_TEMPLATE_IDS,
  services: SERVICES_TEMPLATE_IDS,
  faq: FAQ_TEMPLATE_IDS,
  footer: FOOTER_TEMPLATE_IDS,
} as const;

export type InvalidTemplatePick = {
  kind: TemplateBlockKind;
  id: string;
};

export const TEMPLATE_RULES_PROMPT = `Template Rules (locked):
- Pick ids ONLY from the catalog below.
- NEVER invent ids (hero-92, services-99, faq-03, etc.).
- If unsure, choose the closest valid id from the list.
- Unknown ids are rejected by Crestis — they never reach the renderer.`;

const CATALOG_BY_KIND: Record<
  TemplateBlockKind,
  readonly string[]
> = TEMPLATE_CATALOG;

export function isValidTemplateBlockId(
  kind: TemplateBlockKind,
  id: unknown,
): boolean {
  if (typeof id !== "string" || !id.trim()) return false;
  return CATALOG_BY_KIND[kind].includes(id);
}

function templateSelectionRow(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (row.template && typeof row.template === "object" && row.template !== null) {
    return row.template as Record<string, unknown>;
  }
  return row;
}

/** Lists invented ids the AI tried to use (e.g. hero-92). */
export function findInvalidTemplatePicks(raw: unknown): InvalidTemplatePick[] {
  const row = templateSelectionRow(raw);
  if (!row) return [];

  const rejected: InvalidTemplatePick[] = [];
  for (const kind of TEMPLATE_BLOCK_KINDS) {
    const id = row[kind];
    if (id === undefined || id === null) continue;
    if (typeof id !== "string") {
      rejected.push({ kind, id: String(id) });
      continue;
    }
    if (!isValidTemplateBlockId(kind, id)) {
      rejected.push({ kind, id });
    }
  }
  return rejected;
}

export function enforceTemplateCatalog(
  raw: unknown,
  fallback: TemplateBlocks = DEFAULT_TEMPLATE_BLOCKS,
): { blocks: TemplateBlocks; rejected: InvalidTemplatePick[] } {
  const row = templateSelectionRow(raw);
  const rejected = findInvalidTemplatePicks(raw);

  if (!row) {
    return { blocks: { ...fallback }, rejected };
  }

  const hero = isValidTemplateBlockId("hero", row.hero)
    ? (row.hero as HeroTemplateId)
    : fallback.hero;
  const navbar = isValidTemplateBlockId("navbar", row.navbar)
    ? (row.navbar as NavbarTemplateId)
    : fallback.navbar;
  const services = isValidTemplateBlockId("services", row.services)
    ? (row.services as ServicesTemplateId)
    : fallback.services;
  const faq = isValidTemplateBlockId("faq", row.faq)
    ? (row.faq as FaqTemplateId)
    : fallback.faq;
  const about = isValidTemplateBlockId("about", row.about)
    ? (row.about as AboutTemplateId)
    : fallback.about;
  const footer = isValidTemplateBlockId("footer", row.footer)
    ? (row.footer as FooterTemplateId)
    : fallback.footer;

  return {
    blocks: { hero, navbar, services, faq, about, footer },
    rejected,
  };
}

export function logRejectedTemplatePicks(rejected: InvalidTemplatePick[]): void {
  if (rejected.length === 0) return;
  console.warn(
    "[template-rules] Rejected invented template ids:",
    rejected.map((r) => `${r.kind}:${r.id}`).join(", "),
  );
}
