/**
 * Crestis Template Library v1
 *
 * AI picks template + variant + section subset only.
 * Crestis owns design tokens and React hero shells — never invent CSS/HTML.
 */

import type { DesignSystem } from "./design-system";
import type { SiteLayoutSection } from "./site-types";
import type { StyleId } from "./style-library";

export const TEMPLATE_VARIANTS = ["A", "B", "C"] as const;
export type TemplateVariant = (typeof TEMPLATE_VARIANTS)[number];

/** Hero layout shell — React renders these; AI never invents them */
export type HeroShell = "fullBleed" | "split" | "darkBand";

export const VARIANT_TO_SHELL: Record<TemplateVariant, HeroShell> = {
  A: "fullBleed",
  B: "split",
  C: "darkBand",
};

export const TEMPLATE_IDS = [
  "construction-premium",
  "construction-modern",
  "electrician-modern",
  "plumber-local",
  "hvac-trust",
  "dentist-premium",
  "dentist-family",
  "medical-clean",
  "restaurant-luxury",
  "restaurant-modern",
  "cafe-warm",
  "law-minimal",
  "law-corporate",
  "agency-dark",
  "agency-light",
  "saas-clean",
  "saas-bold",
  "cleaning-local",
  "landscaping-outdoor",
  "salon-soft",
  "local-service-standard",
  "local-service-bold",
  "b2b-corporate",
  "home-services-trust",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateSectionLabel =
  | "Hero"
  | "Trust"
  | "Services"
  | "Featured Services"
  | "Projects"
  | "Gallery"
  | "Menu"
  | "About"
  | "Process"
  | "Testimonials"
  | "FAQ"
  | "Contact";

export type TemplateDefinition = {
  id: TemplateId;
  niche: string;
  bestFor: string;
  voice: string;
  copyRules: string;
  /** Ordered defaults; AI may subset/reorder within this list only */
  allowedSections: TemplateSectionLabel[];
  /** Locked visual tokens */
  visual: DesignSystem;
  /** Maps to Style Library voice bucket for copy briefs */
  styleBucket: StyleId;
  /** Default variant when AI omits one */
  defaultVariant: TemplateVariant;
};

const TRADE_SECTIONS: TemplateSectionLabel[] = [
  "Hero",
  "Trust",
  "Services",
  "Projects",
  "Process",
  "Testimonials",
  "FAQ",
  "Contact",
];

const MEDICAL_SECTIONS: TemplateSectionLabel[] = [
  "Hero",
  "Trust",
  "Services",
  "About",
  "Testimonials",
  "FAQ",
  "Contact",
];

const FOOD_SECTIONS: TemplateSectionLabel[] = [
  "Hero",
  "Menu",
  "Gallery",
  "About",
  "Testimonials",
  "FAQ",
  "Contact",
];

const PRO_SECTIONS: TemplateSectionLabel[] = [
  "Hero",
  "Trust",
  "Services",
  "Process",
  "About",
  "Testimonials",
  "FAQ",
  "Contact",
];

const LOCAL_SECTIONS: TemplateSectionLabel[] = [
  "Hero",
  "Trust",
  "Services",
  "About",
  "Testimonials",
  "FAQ",
  "Contact",
];

export const TEMPLATE_LIBRARY: Record<TemplateId, TemplateDefinition> = {
  "construction-premium": {
    id: "construction-premium",
    niche: "construction",
    bestFor: "premium roofing, high-end contractors, custom builds",
    voice: "Direct, capable, premium without flash. Straight answers for homeowners.",
    copyRules: "Headline: protect the home. CTA: inspection / estimate. Show craft, not hype.",
    allowedSections: TRADE_SECTIONS,
    visual: {
      theme: "Bold Trade",
      palette: "Slate",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Documentary",
      sectionStyle: "Banded",
    },
    styleBucket: "Construction",
    defaultVariant: "A",
  },
  "construction-modern": {
    id: "construction-modern",
    niche: "construction",
    bestFor: "modern trade crews, storm repair, residential contractors",
    voice: "Practical and fast. Built for people who need the job done right.",
    copyRules: "Headline: problem → fix. CTA: quote / call today.",
    allowedSections: TRADE_SECTIONS,
    visual: {
      theme: "Bold Trade",
      palette: "Amber Trade",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Bold",
      imageStyle: "Documentary",
      sectionStyle: "Banded",
    },
    styleBucket: "Construction",
    defaultVariant: "B",
  },
  "electrician-modern": {
    id: "electrician-modern",
    niche: "electrician",
    bestFor: "residential electricians, EV chargers, panel upgrades",
    voice: "Clear safety language. Confident without scare tactics.",
    copyRules: "Headline: safe power, clear next step. CTA: book / call.",
    allowedSections: TRADE_SECTIONS,
    visual: {
      theme: "Modern Premium",
      palette: "Electric Orange",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Soft",
      imageStyle: "Documentary",
      sectionStyle: "Alternating",
    },
    styleBucket: "Construction",
    defaultVariant: "B",
  },
  "plumber-local": {
    id: "plumber-local",
    niche: "plumbing",
    bestFor: "local plumbers, emergency callouts, drain & boiler work",
    voice: "Neighborly and urgent when needed. Plain English.",
    copyRules: "Headline: stop the leak / restore water. CTA: call now / book.",
    allowedSections: [
      "Hero",
      "Trust",
      "Services",
      "Process",
      "Testimonials",
      "FAQ",
      "Contact",
    ],
    visual: {
      theme: "Bold Trade",
      palette: "Dark Blue",
      font: "DM Sans",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Bold",
      imageStyle: "Documentary",
      sectionStyle: "Banded",
    },
    styleBucket: "Construction",
    defaultVariant: "A",
  },
  "hvac-trust": {
    id: "hvac-trust",
    niche: "hvac",
    bestFor: "HVAC, heating, cooling, comfort checks",
    voice: "Steady and trustworthy. Comfort without jargon overload.",
    copyRules: "Headline: comfort restored. CTA: schedule service / free check.",
    allowedSections: TRADE_SECTIONS,
    visual: {
      theme: "Classic Professional",
      palette: "Teal",
      font: "DM Sans",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Professional",
      sectionStyle: "Alternating",
    },
    styleBucket: "Construction",
    defaultVariant: "B",
  },
  "dentist-premium": {
    id: "dentist-premium",
    niche: "dentist",
    bestFor: "cosmetic / premium dental practices",
    voice: "Calm, refined, reassuring. Never clinical scare copy.",
    copyRules: "Headline: easier visits, clearer plans. CTA: schedule visit.",
    allowedSections: MEDICAL_SECTIONS,
    visual: {
      theme: "Clean Clinical",
      palette: "Slate",
      font: "Source Serif",
      borderRadius: "Soft",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Editorial",
      sectionStyle: "Stacked",
    },
    styleBucket: "Medical",
    defaultVariant: "B",
  },
  "dentist-family": {
    id: "dentist-family",
    niche: "dentist",
    bestFor: "family dentistry, kids + parents, neighborhood practices",
    voice: "Warm, gentle, human. Sounds like a caring front desk.",
    copyRules: "Headline: welcome + relief. CTA: book appointment.",
    allowedSections: MEDICAL_SECTIONS,
    visual: {
      theme: "Clean Clinical",
      palette: "Clinical Mint",
      font: "DM Sans",
      borderRadius: "Soft",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Alternating",
    },
    styleBucket: "Medical",
    defaultVariant: "A",
  },
  "medical-clean": {
    id: "medical-clean",
    niche: "medical",
    bestFor: "clinics, physio, optometry, general healthcare",
    voice: "Clear clinical trust without hospital coldness.",
    copyRules: "Headline: care + ease. CTA: book / call. Never invent credentials.",
    allowedSections: MEDICAL_SECTIONS,
    visual: {
      theme: "Clean Clinical",
      palette: "Clinical Mint",
      font: "DM Sans",
      borderRadius: "Soft",
      spacing: "Large",
      animation: "None",
      imageStyle: "Professional",
      sectionStyle: "Stacked",
    },
    styleBucket: "Medical",
    defaultVariant: "B",
  },
  "restaurant-luxury": {
    id: "restaurant-luxury",
    niche: "restaurant",
    bestFor: "fine dining, tasting menus, upscale rooms",
    voice: "Refined, selective, appetite-first. Never shouty.",
    copyRules: "Headline: understated invitation. CTA: reserve a table.",
    allowedSections: FOOD_SECTIONS,
    visual: {
      theme: "Classic Professional",
      palette: "Warm Burgundy",
      font: "Source Serif",
      borderRadius: "Sharp",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Editorial",
      sectionStyle: "Stacked",
    },
    styleBucket: "Luxury",
    defaultVariant: "A",
  },
  "restaurant-modern": {
    id: "restaurant-modern",
    niche: "restaurant",
    bestFor: "modern neighborhood restaurants, seasonal kitchens",
    voice: "Appetite-led and local. Unfussy point of view.",
    copyRules: "Headline: plate + place. CTA: reserve / see menu.",
    allowedSections: FOOD_SECTIONS,
    visual: {
      theme: "Warm Hospitality",
      palette: "Warm Burgundy",
      font: "DM Sans",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Alternating",
    },
    styleBucket: "Friendly",
    defaultVariant: "B",
  },
  "cafe-warm": {
    id: "cafe-warm",
    niche: "cafe",
    bestFor: "cafes, coffee shops, bakeries, casual brunch",
    voice: "Warm, inviting, neighborhood energy.",
    copyRules: "Headline: come in / today's favorites. CTA: visit / order.",
    allowedSections: [
      "Hero",
      "Menu",
      "Gallery",
      "About",
      "Testimonials",
      "Contact",
    ],
    visual: {
      theme: "Warm Hospitality",
      palette: "Teal",
      font: "DM Sans",
      borderRadius: "Soft",
      spacing: "Medium",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Alternating",
    },
    styleBucket: "Friendly",
    defaultVariant: "A",
  },
  "law-minimal": {
    id: "law-minimal",
    niche: "law",
    bestFor: "boutique law firms, quiet premium counsel",
    voice: "Sparse, precise, authoritative without arrogance.",
    copyRules: "Headline: clarity under pressure. CTA: request consultation.",
    allowedSections: PRO_SECTIONS,
    visual: {
      theme: "Modern Premium",
      palette: "Slate",
      font: "Geist",
      borderRadius: "Sharp",
      spacing: "Large",
      animation: "None",
      imageStyle: "Editorial",
      sectionStyle: "Stacked",
    },
    styleBucket: "Minimal",
    defaultVariant: "B",
  },
  "law-corporate": {
    id: "law-corporate",
    niche: "law",
    bestFor: "established law firms, corporate counsel, litigation",
    voice: "Polished, measured, credible.",
    copyRules: "Headline: competence + clarity. CTA: schedule a consult.",
    allowedSections: PRO_SECTIONS,
    visual: {
      theme: "Classic Professional",
      palette: "Dark Blue",
      font: "Source Serif",
      borderRadius: "Sharp",
      spacing: "Large",
      animation: "None",
      imageStyle: "Professional",
      sectionStyle: "Stacked",
    },
    styleBucket: "Corporate",
    defaultVariant: "A",
  },
  "agency-dark": {
    id: "agency-dark",
    niche: "agency",
    bestFor: "creative agencies, studios, brand shops with bold identity",
    voice: "Sharp, confident, contemporary.",
    copyRules: "Headline: crisp outcome. CTA: start a project.",
    allowedSections: [
      "Hero",
      "Services",
      "Projects",
      "Process",
      "About",
      "Testimonials",
      "FAQ",
      "Contact",
    ],
    visual: {
      theme: "Modern Premium",
      palette: "Slate",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Bold",
      imageStyle: "Editorial",
      sectionStyle: "Banded",
    },
    styleBucket: "Modern",
    defaultVariant: "C",
  },
  "agency-light": {
    id: "agency-light",
    niche: "agency",
    bestFor: "marketing agencies, consultants, light professional studios",
    voice: "Clean and capable. Friendly professionalism.",
    copyRules: "Headline: results without fluff. CTA: book a call.",
    allowedSections: PRO_SECTIONS,
    visual: {
      theme: "Modern Premium",
      palette: "Dark Blue",
      font: "DM Sans",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Alternating",
    },
    styleBucket: "Modern",
    defaultVariant: "B",
  },
  "saas-clean": {
    id: "saas-clean",
    niche: "saas",
    bestFor: "SaaS, software tools, clean product landing pages",
    voice: "Clear product language. Benefit over buzzwords.",
    copyRules: "Headline: outcome in one line. CTA: start free / book demo.",
    allowedSections: [
      "Hero",
      "Services",
      "Process",
      "Testimonials",
      "FAQ",
      "Contact",
    ],
    visual: {
      theme: "Modern Premium",
      palette: "Dark Blue",
      font: "Geist",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Stacked",
    },
    styleBucket: "Minimal",
    defaultVariant: "B",
  },
  "saas-bold": {
    id: "saas-bold",
    niche: "saas",
    bestFor: "growth SaaS, bold product launches, tech startups",
    voice: "Confident and fast. Product energy without nonsense.",
    copyRules: "Headline: sharp claim. CTA: get started / see demo.",
    allowedSections: [
      "Hero",
      "Services",
      "Process",
      "Projects",
      "Testimonials",
      "FAQ",
      "Contact",
    ],
    visual: {
      theme: "Modern Premium",
      palette: "Electric Orange",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Bold",
      imageStyle: "Lifestyle",
      sectionStyle: "Banded",
    },
    styleBucket: "Modern",
    defaultVariant: "C",
  },
  "cleaning-local": {
    id: "cleaning-local",
    niche: "cleaning",
    bestFor: "home cleaning, commercial cleaning, janitorial",
    voice: "Reliable and clear. Trust through process.",
    copyRules: "Headline: clean space, clear price path. CTA: get quote.",
    allowedSections: LOCAL_SECTIONS,
    visual: {
      theme: "Warm Hospitality",
      palette: "Teal",
      font: "DM Sans",
      borderRadius: "Soft",
      spacing: "Medium",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Alternating",
    },
    styleBucket: "Friendly",
    defaultVariant: "A",
  },
  "landscaping-outdoor": {
    id: "landscaping-outdoor",
    niche: "landscaping",
    bestFor: "landscaping, lawn care, outdoor living",
    voice: "Outdoor and capable. Seasonal and local.",
    copyRules: "Headline: yard / outdoor outcome. CTA: site visit / quote.",
    allowedSections: [
      "Hero",
      "Trust",
      "Services",
      "Gallery",
      "Projects",
      "Testimonials",
      "FAQ",
      "Contact",
    ],
    visual: {
      theme: "Warm Hospitality",
      palette: "Forest",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Documentary",
      sectionStyle: "Alternating",
    },
    styleBucket: "Construction",
    defaultVariant: "A",
  },
  "salon-soft": {
    id: "salon-soft",
    niche: "salon",
    bestFor: "salons, spas, beauty studios",
    voice: "Soft, inviting, premium-calm.",
    copyRules: "Headline: look / feel outcome. CTA: book appointment.",
    allowedSections: [
      "Hero",
      "Services",
      "Gallery",
      "About",
      "Testimonials",
      "FAQ",
      "Contact",
    ],
    visual: {
      theme: "Warm Hospitality",
      palette: "Warm Burgundy",
      font: "Source Serif",
      borderRadius: "Soft",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Editorial",
      sectionStyle: "Stacked",
    },
    styleBucket: "Luxury",
    defaultVariant: "B",
  },
  "local-service-standard": {
    id: "local-service-standard",
    niche: "local",
    bestFor: "general local service businesses without a strong niche match",
    voice: "Clear, local, trustworthy.",
    copyRules: "Headline: city + outcome. CTA: request quote / call.",
    allowedSections: LOCAL_SECTIONS,
    visual: {
      theme: "Classic Professional",
      palette: "Dark Blue",
      font: "DM Sans",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Professional",
      sectionStyle: "Alternating",
    },
    styleBucket: "Corporate",
    defaultVariant: "B",
  },
  "local-service-bold": {
    id: "local-service-bold",
    niche: "local",
    bestFor: "bold local services that need urgency and phone leads",
    voice: "Urgent when needed, still human.",
    copyRules: "Headline: act now without hype spam. CTA: call / get estimate.",
    allowedSections: LOCAL_SECTIONS,
    visual: {
      theme: "Bold Trade",
      palette: "Electric Orange",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Bold",
      imageStyle: "Documentary",
      sectionStyle: "Banded",
    },
    styleBucket: "Construction",
    defaultVariant: "A",
  },
  "b2b-corporate": {
    id: "b2b-corporate",
    niche: "b2b",
    bestFor: "B2B services, consulting, insurance, accounting",
    voice: "Polished and measured. Authority without arrogance.",
    copyRules: "Headline: competence + clarity. CTA: request proposal.",
    allowedSections: PRO_SECTIONS,
    visual: {
      theme: "Classic Professional",
      palette: "Slate",
      font: "DM Sans",
      borderRadius: "Sharp",
      spacing: "Large",
      animation: "None",
      imageStyle: "Professional",
      sectionStyle: "Stacked",
    },
    styleBucket: "Corporate",
    defaultVariant: "B",
  },
  "home-services-trust": {
    id: "home-services-trust",
    niche: "home-services",
    bestFor: "general home services, handymen, multi-trade locals",
    voice: "Reliable neighbor energy. Clear process.",
    copyRules: "Headline: home fixed / protected. CTA: book / free estimate.",
    allowedSections: TRADE_SECTIONS,
    visual: {
      theme: "Bold Trade",
      palette: "Amber Trade",
      font: "DM Sans",
      borderRadius: "Medium",
      spacing: "Medium",
      animation: "Soft",
      imageStyle: "Documentary",
      sectionStyle: "Banded",
    },
    styleBucket: "Construction",
    defaultVariant: "A",
  },
};

/** Map template section labels → Crestis renderable section ids */
const SECTION_LABEL_TO_ID: Record<
  TemplateSectionLabel,
  SiteLayoutSection["id"]
> = {
  Hero: "hero",
  Trust: "trust",
  Services: "services",
  "Featured Services": "services",
  Projects: "projects",
  Gallery: "gallery",
  Menu: "menu",
  About: "about",
  Process: "why_us",
  Testimonials: "testimonials",
  FAQ: "faq",
  Contact: "contact",
};

export function isTemplateId(value: unknown): value is TemplateId {
  return (
    typeof value === "string" &&
    (TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

export function isTemplateVariant(value: unknown): value is TemplateVariant {
  return (
    typeof value === "string" &&
    (TEMPLATE_VARIANTS as readonly string[]).includes(value)
  );
}

export function resolveVariant(
  raw: unknown,
  template: TemplateDefinition,
): TemplateVariant {
  if (isTemplateVariant(raw)) return raw;
  if (typeof raw === "string") {
    const upper = raw.trim().toUpperCase();
    if (isTemplateVariant(upper)) return upper;
  }
  return template.defaultVariant;
}

export function heroShellForVariant(variant: TemplateVariant): HeroShell {
  return VARIANT_TO_SHELL[variant];
}

export function designSystemFromTemplate(templateId: TemplateId): DesignSystem {
  return { ...TEMPLATE_LIBRARY[templateId].visual };
}

export function templateCopyBrief(
  templateId: TemplateId,
  variant: TemplateVariant,
): string {
  const t = TEMPLATE_LIBRARY[templateId];
  const shell = heroShellForVariant(variant);
  return [
    `CHOSEN TEMPLATE: ${t.id}`,
    `Variant: ${variant} (Hero shell: ${shell})`,
    `Voice: ${t.voice}`,
    `Copy rules: ${t.copyRules}`,
    `Visual is LOCKED by Crestis (${t.visual.theme}, ${t.visual.palette}, ${t.visual.font}).`,
    "Do NOT invent colors, fonts, or layout. Write copy only.",
    "Write EVERY section in this template voice.",
  ].join("\n");
}

/** Compact prompt block for Website Planner */
export function templateLibraryPromptBlock(): string {
  const lines = TEMPLATE_IDS.map((id) => {
    const t = TEMPLATE_LIBRARY[id];
    return `- ${id}: ${t.bestFor}`;
  });
  return [
    "TEMPLATE LIBRARY — pick exactly ONE template id:",
    ...lines,
    "",
    'Return "template" as one of the ids above.',
    'Return "variant" as A | B | C (A=fullBleed hero, B=split hero, C=darkBand hero).',
    "sections: ordered labels chosen ONLY from that template's allowed list (max 12).",
    "Never invent CSS, colors, fonts, or HTML.",
  ].join("\n");
}

export function suggestTemplateFromHints(hints?: {
  industry?: string;
  tradeKey?: string;
  subcategory?: string;
  brandPosition?: string;
  tone?: string;
  websiteStyle?: string;
}): TemplateId {
  const blob = [
    hints?.industry,
    hints?.tradeKey,
    hints?.subcategory,
    hints?.brandPosition,
    hints?.tone,
    hints?.websiteStyle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const premium = /premium|luxury|boutique|high-end|high end/.test(blob);

  if (/dentist|dental/.test(blob)) {
    return premium ? "dentist-premium" : "dentist-family";
  }
  if (/clinic|medical|physio|optom|health|vet/.test(blob)) {
    return "medical-clean";
  }
  if (/restaurant|dining|fine dining/.test(blob)) {
    return premium ? "restaurant-luxury" : "restaurant-modern";
  }
  if (/cafe|coffee|bakery|brunch/.test(blob)) return "cafe-warm";
  if (/law|attorney|legal|solicitor/.test(blob)) {
    return premium || /minimal/.test(blob) ? "law-minimal" : "law-corporate";
  }
  if (/agency|studio|marketing|brand|creative/.test(blob)) {
    return /dark|bold/.test(blob) ? "agency-dark" : "agency-light";
  }
  if (/saas|software|app|platform|startup/.test(blob)) {
    return /bold|growth/.test(blob) ? "saas-bold" : "saas-clean";
  }
  if (/electric/.test(blob)) return "electrician-modern";
  if (/plumb/.test(blob)) return "plumber-local";
  if (/hvac|heating|cooling|air con|furnace/.test(blob)) return "hvac-trust";
  if (/landscap|lawn|garden|outdoor/.test(blob)) return "landscaping-outdoor";
  if (/clean|janitor|maid/.test(blob)) return "cleaning-local";
  if (/solar|photovoltaic|\bpv\b/.test(blob)) return "home-services-trust";
  if (/real.?estate|realtor|estate agent|broker/.test(blob)) {
    return "b2b-corporate";
  }
  if (/gym|fitness|crossfit|personal train/.test(blob)) {
    return "local-service-bold";
  }
  if (/salon|spa|beauty|barber/.test(blob)) return "salon-soft";
  if (/roof|construct|contractor|builder|remodel|renovat/.test(blob)) {
    return premium ? "construction-premium" : "construction-modern";
  }
  if (/b2b|consult|account|insur|corporate/.test(blob)) return "b2b-corporate";
  if (/handyman|home service|multi-trade/.test(blob)) {
    return "home-services-trust";
  }
  if (/bold|urgent|emergency/.test(blob)) return "local-service-bold";
  return "local-service-standard";
}

/**
 * Resolve AI/raw template id with niche fallbacks.
 * Also accepts legacy Style Library ids → nearest template.
 */
export function resolveTemplateId(
  raw: unknown,
  hints?: {
    industry?: string;
    tradeKey?: string;
    subcategory?: string;
    brandPosition?: string;
    tone?: string;
    websiteStyle?: string;
  },
): TemplateId {
  if (typeof raw === "string") {
    const trimmed = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (isTemplateId(trimmed)) return trimmed;

    const legacyStyle: Record<string, TemplateId> = {
      luxury: "restaurant-luxury",
      modern: "local-service-standard",
      corporate: "b2b-corporate",
      friendly: "dentist-family",
      minimal: "law-minimal",
      construction: "construction-modern",
      medical: "dentist-family",
    };
    if (legacyStyle[trimmed]) return legacyStyle[trimmed]!;

    // Partial match: "construction" in "construction-premium-foo"
    const partial = TEMPLATE_IDS.find(
      (id) => trimmed.includes(id) || id.includes(trimmed),
    );
    if (partial) return partial;
  }
  return suggestTemplateFromHints(hints);
}

export function sectionsFromTemplateLabels(
  labels: unknown,
  template: TemplateDefinition,
): SiteLayoutSection[] {
  const allowed = new Set(template.allowedSections);
  const allowOrder = template.allowedSections;

  const requested: string[] = [];
  if (Array.isArray(labels)) {
    for (const item of labels) {
      if (typeof item === "string") {
        requested.push(item.trim());
      } else if (item && typeof item === "object") {
        const row = item as { id?: string; label?: string };
        const label = String(row.label ?? row.id ?? "").trim();
        if (label) requested.push(label);
      }
    }
  }

  const normalizeLabel = (raw: string): TemplateSectionLabel | null => {
    const key = raw.trim().toLowerCase().replace(/[_-]+/g, " ");
    const aliases: Record<string, TemplateSectionLabel> = {
      hero: "Hero",
      trust: "Trust",
      "trust bar": "Trust",
      services: "Services",
      "featured services": "Featured Services",
      treatments: "Services",
      projects: "Projects",
      "case studies": "Projects",
      "before after": "Projects",
      gallery: "Gallery",
      menu: "Menu",
      "menu highlights": "Menu",
      about: "About",
      team: "About",
      process: "Process",
      "our process": "Process",
      "how it works": "Process",
      why: "Process",
      "why us": "Process",
      testimonials: "Testimonials",
      reviews: "Testimonials",
      faq: "FAQ",
      contact: "Contact",
      booking: "Contact",
      "lead form": "Contact",
      cta: "Contact",
      map: "Contact",
    };
    const mapped = aliases[key];
    if (mapped && allowed.has(mapped)) return mapped;
    // Exact allowed match
    const exact = allowOrder.find((s) => s.toLowerCase() === key);
    return exact ?? null;
  };

  const seen = new Set<SiteLayoutSection["id"]>();
  const out: SiteLayoutSection[] = [];

  const pushLabel = (label: TemplateSectionLabel) => {
    const id = SECTION_LABEL_TO_ID[label];
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, label });
  };

  if (requested.length) {
    for (const raw of requested) {
      const label = normalizeLabel(raw);
      if (label) pushLabel(label);
      if (out.length >= 12) break;
    }
  }

  // Fallback to template defaults if too thin
  if (out.length < 4) {
    out.length = 0;
    seen.clear();
    for (const label of allowOrder) {
      pushLabel(label);
      if (out.length >= 10) break;
    }
  }

  // Enforce Hero first + Contact last
  const withoutEnds = out.filter((s) => s.id !== "hero" && s.id !== "contact");
  const hero = out.find((s) => s.id === "hero") ?? {
    id: "hero" as const,
    label: "Hero",
  };
  const contact = out.find((s) => s.id === "contact") ?? {
    id: "contact" as const,
    label: "Contact",
  };

  return [hero, ...withoutEnds, contact].slice(0, 12);
}

export function getTemplate(id: TemplateId): TemplateDefinition {
  return TEMPLATE_LIBRARY[id];
}
