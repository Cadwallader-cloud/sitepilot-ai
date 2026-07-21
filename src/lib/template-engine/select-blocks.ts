import type { TemplateVariant } from "../template-library";
import { enforceTemplateCatalog } from "./template-rules";
import {
  ABOUT_TEMPLATE_IDS,
  FAQ_TEMPLATE_IDS,
  FOOTER_TEMPLATE_IDS,
  HERO_TEMPLATE_IDS,
  NAVBAR_TEMPLATE_IDS,
  SERVICES_TEMPLATE_IDS,
  type AboutTemplateId,
  type FaqTemplateId,
  type FooterTemplateId,
  type HeroTemplateId,
  type NavbarTemplateId,
  type ServicesTemplateId,
  type TemplateBlocks,
} from "./ids";

function pick<T extends string>(allowed: readonly T[], index: number): T {
  return allowed[Math.abs(index) % allowed.length]!;
}

function variantIndex(variant?: string): number {
  const v = String(variant ?? "A").toUpperCase();
  if (v === "B") return 1;
  if (v === "C") return 2;
  return 0;
}

function templateSeed(templateId: string): number {
  return templateId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

/**
 * Theme Engine — select React block components for this site.
 * Deterministic from template + variant (no HTML generation).
 */
export function selectTemplateBlocks(params: {
  templateId: string;
  variant?: TemplateVariant | string;
}): TemplateBlocks {
  const vi = variantIndex(params.variant);
  const seed = templateSeed(params.templateId || "local-service-standard");

  const heroByVariant: HeroTemplateId[] = [
    "hero-01",
    "hero-02",
    "hero-03",
  ];
  const hero =
    vi < heroByVariant.length
      ? heroByVariant[vi]!
      : pick(HERO_TEMPLATE_IDS, seed);

  return {
    hero,
    navbar: pick(NAVBAR_TEMPLATE_IDS, vi + seed),
    services: pick(SERVICES_TEMPLATE_IDS, seed + vi),
    faq: pick(FAQ_TEMPLATE_IDS, seed),
    about: pick(ABOUT_TEMPLATE_IDS, vi + 1),
    footer: pick(FOOTER_TEMPLATE_IDS, seed + 2),
  };
}

export function normalizeTemplateBlocks(raw: unknown): TemplateBlocks {
  return enforceTemplateCatalog(raw).blocks;
}

export { isValidTemplateBlockId } from "./template-rules";
