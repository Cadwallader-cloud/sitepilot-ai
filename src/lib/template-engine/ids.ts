/**
 * Template Engine v1 — block IDs (AI picks these, React renders components).
 * AI never generates HTML — only selects from this catalog.
 */

export const HERO_TEMPLATE_IDS = [
  "hero-01",
  "hero-02",
  "hero-03",
  "hero-04",
  "hero-05",
] as const;

export const NAVBAR_TEMPLATE_IDS = ["navbar-01", "navbar-02"] as const;

export const SERVICES_TEMPLATE_IDS = [
  "services-01",
  "services-02",
  "services-03",
] as const;

export const FAQ_TEMPLATE_IDS = ["faq-01", "faq-02"] as const;

export const ABOUT_TEMPLATE_IDS = ["about-01", "about-02"] as const;

export const FOOTER_TEMPLATE_IDS = ["footer-01", "footer-02"] as const;

export type HeroTemplateId = (typeof HERO_TEMPLATE_IDS)[number];
export type NavbarTemplateId = (typeof NAVBAR_TEMPLATE_IDS)[number];
export type ServicesTemplateId = (typeof SERVICES_TEMPLATE_IDS)[number];
export type FaqTemplateId = (typeof FAQ_TEMPLATE_IDS)[number];
export type AboutTemplateId = (typeof ABOUT_TEMPLATE_IDS)[number];
export type FooterTemplateId = (typeof FOOTER_TEMPLATE_IDS)[number];

/** Locked block picks stored on Website.theme.blocks */
export type TemplateBlocks = {
  hero: HeroTemplateId;
  navbar: NavbarTemplateId;
  services: ServicesTemplateId;
  faq: FaqTemplateId;
  about: AboutTemplateId;
  footer: FooterTemplateId;
};

export type TemplateBlockKind = keyof TemplateBlocks;

export const TEMPLATE_BLOCK_KINDS = [
  "hero",
  "navbar",
  "services",
  "faq",
  "about",
  "footer",
] as const satisfies readonly TemplateBlockKind[];
