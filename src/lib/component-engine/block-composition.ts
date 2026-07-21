/**
 * Block composition catalogs — each section template composes ui kit slots.
 */

export const ABOUT_COMPONENT_SLOTS = [
  "Section",
  "Container",
  "Grid",
  "Stack",
  "Heading",
  "Text",
  "Button",
  "ThemeBar",
  "ThemeGradient",
  "Card",
] as const;

export type AboutComponentSlot = (typeof ABOUT_COMPONENT_SLOTS)[number];

export const ABOUT_TEMPLATE_COMPOSITION: Record<
  string,
  readonly AboutComponentSlot[]
> = {
  "about-01": [
    "Section",
    "Container",
    "Grid",
    "Heading",
    "Text",
    "Card",
    "ThemeGradient",
  ],
  "about-02": [
    "Section",
    "Container",
    "ThemeBar",
    "Heading",
    "Stack",
    "Text",
    "Button",
  ],
};

export const SERVICES_COMPONENT_SLOTS = [
  "Section",
  "Container",
  "Grid",
  "Heading",
  "Text",
  "Stack",
  "ServiceCard",
  "Card",
] as const;

export type ServicesComponentSlot = (typeof SERVICES_COMPONENT_SLOTS)[number];

export const SERVICES_TEMPLATE_COMPOSITION: Record<
  string,
  readonly ServicesComponentSlot[]
> = {
  "services-01": ["Section", "Container", "Heading", "Text", "Grid", "ServiceCard", "Card"],
  "services-02": ["Section", "Container", "Heading", "Grid", "ServiceCard", "Card"],
  "services-03": ["Section", "Container", "Heading", "ServiceCard", "Stack", "Card"],
};

export const FAQ_COMPONENT_SLOTS = [
  "Section",
  "Container",
  "Heading",
  "Grid",
  "Text",
  "Accordion",
  "AccordionItem",
  "Card",
  "ThemeBar",
] as const;

export type FaqComponentSlot = (typeof FAQ_COMPONENT_SLOTS)[number];

export const FAQ_TEMPLATE_COMPOSITION: Record<
  string,
  readonly FaqComponentSlot[]
> = {
  "faq-01": ["Section", "Container", "Heading", "Accordion", "AccordionItem"],
  "faq-02": ["Section", "Container", "Heading", "Grid", "Card", "Text", "ThemeBar"],
};

export function aboutComposition(id: string): readonly AboutComponentSlot[] {
  return ABOUT_TEMPLATE_COMPOSITION[id] ?? [];
}

export function servicesComposition(id: string): readonly ServicesComponentSlot[] {
  return SERVICES_TEMPLATE_COMPOSITION[id] ?? [];
}

export function faqComposition(id: string): readonly FaqComponentSlot[] {
  return FAQ_TEMPLATE_COMPOSITION[id] ?? [];
}
