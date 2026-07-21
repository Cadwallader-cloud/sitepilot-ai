/**
 * Component Engine v1 — slot definitions per hero template shell.
 */

export const HERO_COMPONENT_SLOTS = [
  "Badge",
  "Headline",
  "Subheadline",
  "CTAGroup",
  "TrustBar",
  "Section",
  "Container",
  "Image",
  "Button",
  "Card",
] as const;

export type HeroComponentSlot = (typeof HERO_COMPONENT_SLOTS)[number];

/** Which ui/hero components each template composes. */
export const HERO_TEMPLATE_COMPOSITION: Record<
  string,
  readonly HeroComponentSlot[]
> = {
  "hero-01": ["Section", "Image", "Headline", "Subheadline", "CTAGroup", "Button"],
  "hero-02": ["Section", "Container", "Headline", "Subheadline", "CTAGroup", "Image"],
  "hero-03": ["Section", "Container", "Headline", "Subheadline", "CTAGroup", "Button"],
  "hero-04": ["Section", "Container", "Badge", "Headline", "Subheadline", "CTAGroup", "TrustBar"],
  "hero-05": ["Section", "Image", "Container", "Card", "Headline", "Subheadline", "CTAGroup", "Button"],
};

export function heroComposition(id: string): readonly HeroComponentSlot[] {
  return HERO_TEMPLATE_COMPOSITION[id] ?? [];
}
