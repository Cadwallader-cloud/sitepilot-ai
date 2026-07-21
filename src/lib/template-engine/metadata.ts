/**
 * Template Metadata — AI picks blocks by description, not by inventing ids.
 *
 * {
 *   "id": "hero-03",
 *   "style": "bold",
 *   "industries": ["construction", "electrician"],
 *   "layout": "centered",
 *   "image": "none",
 *   "complexity": "low"
 * }
 */

import type {
  AboutTemplateId,
  FaqTemplateId,
  FooterTemplateId,
  HeroTemplateId,
  NavbarTemplateId,
  ServicesTemplateId,
  TemplateBlockKind,
} from "./ids";

export type TemplateStyle =
  | "modern"
  | "classic"
  | "bold"
  | "premium"
  | "minimal";

export type TemplateLayout =
  | "split"
  | "centered"
  | "full-bleed"
  | "grid"
  | "list"
  | "overlay"
  | "stacked"
  | "featured-grid";

export type TemplateImagePosition = "left" | "right" | "background" | "none";

export type TemplateComplexity = "low" | "medium" | "high";

export type TemplateMetadata = {
  id: string;
  kind: TemplateBlockKind;
  style: TemplateStyle;
  industries: string[];
  layout: TemplateLayout;
  image: TemplateImagePosition;
  complexity: TemplateComplexity;
  /** Short selector hint for AI */
  description: string;
};

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: "hero-01",
    kind: "hero",
    style: "classic",
    industries: ["roofing", "plumbing", "landscaping", "construction"],
    layout: "full-bleed",
    image: "background",
    complexity: "medium",
    description: "Full-bleed trade photo with gradient overlay and bottom copy.",
  },
  {
    id: "hero-02",
    kind: "hero",
    style: "modern",
    industries: ["dental", "legal", "home services", "hvac"],
    layout: "split",
    image: "right",
    complexity: "medium",
    description: "Split hero — copy left, photo right. Clean local service feel.",
  },
  {
    id: "hero-03",
    kind: "hero",
    style: "bold",
    industries: ["construction", "electrician", "roofing", "plumbing"],
    layout: "centered",
    image: "none",
    complexity: "low",
    description: "High-contrast brand band, centered headline, no photo required.",
  },
  {
    id: "hero-04",
    kind: "hero",
    style: "minimal",
    industries: ["professional services", "consulting", "cleaning"],
    layout: "centered",
    image: "none",
    complexity: "low",
    description: "Light minimal hero with trust bar and strong headline.",
  },
  {
    id: "hero-05",
    kind: "hero",
    style: "premium",
    industries: ["premium trades", "luxury home", "high-end construction"],
    layout: "overlay",
    image: "background",
    complexity: "high",
    description: "Premium card overlay on full-bleed image — upscale positioning.",
  },
  {
    id: "navbar-01",
    kind: "navbar",
    style: "classic",
    industries: ["general", "local service", "trades"],
    layout: "stacked",
    image: "none",
    complexity: "low",
    description: "Light header with logo, links, and phone CTA.",
  },
  {
    id: "navbar-02",
    kind: "navbar",
    style: "bold",
    industries: ["construction", "emergency trades", "premium"],
    layout: "stacked",
    image: "none",
    complexity: "low",
    description: "Dark sticky bar with high-contrast call CTA.",
  },
  {
    id: "services-01",
    kind: "services",
    style: "modern",
    industries: ["roofing", "plumbing", "hvac", "landscaping"],
    layout: "featured-grid",
    image: "none",
    complexity: "medium",
    description: "Featured primary service card plus secondary grid.",
  },
  {
    id: "services-02",
    kind: "services",
    style: "modern",
    industries: ["dental", "salon", "professional services"],
    layout: "grid",
    image: "none",
    complexity: "medium",
    description: "Equal three-column service cards — balanced catalog.",
  },
  {
    id: "services-03",
    kind: "services",
    style: "bold",
    industries: ["construction", "electrician", "industrial"],
    layout: "list",
    image: "none",
    complexity: "low",
    description: "Dark compact list with accent icons — trade-forward.",
  },
  {
    id: "faq-01",
    kind: "faq",
    style: "classic",
    industries: ["general", "local service", "trades"],
    layout: "stacked",
    image: "none",
    complexity: "low",
    description: "Single-column accordion FAQ — space-efficient.",
  },
  {
    id: "faq-02",
    kind: "faq",
    style: "modern",
    industries: ["professional services", "premium", "consulting"],
    layout: "grid",
    image: "none",
    complexity: "medium",
    description: "Two-column FAQ cards with all answers visible.",
  },
  {
    id: "about-01",
    kind: "about",
    style: "modern",
    industries: ["roofing", "plumbing", "landscaping", "home services"],
    layout: "split",
    image: "right",
    complexity: "medium",
    description: "Split about — story left, team or project photo right.",
  },
  {
    id: "about-02",
    kind: "about",
    style: "premium",
    industries: ["premium trades", "consulting", "professional services"],
    layout: "stacked",
    image: "none",
    complexity: "medium",
    description: "Editorial about with accent rule and highlight chips.",
  },
  {
    id: "footer-01",
    kind: "footer",
    style: "minimal",
    industries: ["general", "local service"],
    layout: "centered",
    image: "none",
    complexity: "low",
    description: "Simple centered footer with contact links.",
  },
  {
    id: "footer-02",
    kind: "footer",
    style: "modern",
    industries: ["trades", "professional services", "premium"],
    layout: "split",
    image: "none",
    complexity: "medium",
    description: "Multi-column footer with brand and contact columns.",
  },
];

const METADATA_BY_ID = new Map(
  TEMPLATE_METADATA.map((entry) => [entry.id, entry]),
);

export function getTemplateMetadata(id: string): TemplateMetadata | undefined {
  return METADATA_BY_ID.get(id);
}

export function templateMetadataForKind(
  kind: TemplateBlockKind,
): TemplateMetadata[] {
  return TEMPLATE_METADATA.filter((entry) => entry.kind === kind);
}

/** Public metadata shape sent to Template Selector AI (no internal kind field). */
export type TemplateMetadataPromptEntry = Omit<TemplateMetadata, "kind">;

export function templateMetadataPromptEntry(
  entry: TemplateMetadata,
): TemplateMetadataPromptEntry {
  const { kind: _kind, ...rest } = entry;
  return rest;
}

export function templateMetadataCatalogForPrompt(): string {
  const byKind = Object.fromEntries(
    (["hero", "navbar", "about", "services", "faq", "footer"] as const).map(
      (kind) => [
        kind,
        templateMetadataForKind(kind).map(templateMetadataPromptEntry),
      ],
    ),
  );

  return JSON.stringify(byKind, null, 2);
}

export function isKnownTemplateMetadataId(id: string): boolean {
  return METADATA_BY_ID.has(id);
}

export type TemplateBlockMetadataId =
  | HeroTemplateId
  | NavbarTemplateId
  | AboutTemplateId
  | ServicesTemplateId
  | FaqTemplateId
  | FooterTemplateId;
