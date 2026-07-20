/**
 * Crestis Style Library
 *
 * AI picks exactly ONE style. Copy + visual tokens follow that style.
 */

import type {
  DesignAnimation,
  DesignBorderRadius,
  DesignFont,
  DesignImageStyle,
  DesignPaletteName,
  DesignSectionStyle,
  DesignSpacing,
  DesignSystem,
  DesignThemeName,
} from "./design-system";

export const STYLE_IDS = [
  "Luxury",
  "Modern",
  "Corporate",
  "Friendly",
  "Minimal",
  "Construction",
  "Medical",
] as const;

export type StyleId = (typeof STYLE_IDS)[number];

export type StyleDefinition = {
  id: StyleId;
  /** When AI should pick this */
  bestFor: string;
  /** How copy must sound */
  voice: string;
  /** Headline / CTA flavor */
  copyRules: string;
  visual: {
    theme: DesignThemeName;
    palette: DesignPaletteName;
    font: DesignFont;
    borderRadius: DesignBorderRadius;
    spacing: DesignSpacing;
    animation: DesignAnimation;
    imageStyle: DesignImageStyle;
    sectionStyle: DesignSectionStyle;
  };
};

export const STYLE_LIBRARY: Record<StyleId, StyleDefinition> = {
  Luxury: {
    id: "Luxury",
    bestFor:
      "premium spas, fine dining, high-end law, boutique hotels, luxury real estate",
    voice:
      "Refined, calm, selective. Short elegant sentences. Never shouty or salesy.",
    copyRules:
      "Headline: understated aspiration. CTA: invitation, not urgency hype. Avoid slang.",
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
  },
  Modern: {
    id: "Modern",
    bestFor:
      "tech-forward locals, design studios, EV / solar, modern clinics, startups with a local face",
    voice:
      "Clean, sharp, contemporary. Confident without corporate stiffness.",
    copyRules:
      "Headline: crisp outcome. CTA: clear next step. Prefer concrete verbs over buzzwords.",
    visual: {
      theme: "Modern Premium",
      palette: "Dark Blue",
      font: "Manrope",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Lifestyle",
      sectionStyle: "Alternating",
    },
  },
  Corporate: {
    id: "Corporate",
    bestFor:
      "B2B services, accounting, consulting, insurance, established professional firms",
    voice:
      "Polished, credible, measured. Authority without arrogance.",
    copyRules:
      "Headline: competence + clarity. CTA: request a consult / get a proposal. No casual slang.",
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
  },
  Friendly: {
    id: "Friendly",
    bestFor:
      "family dentists, neighborhood cafes, pet care, tutoring, warm home services",
    voice:
      "Warm, human, approachable. Sounds like a helpful neighbor who knows their craft.",
    copyRules:
      "Headline: welcome + relief. CTA: easy booking language. Light humor only if natural.",
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
  },
  Minimal: {
    id: "Minimal",
    bestFor:
      "architects, clean beauty, photography, product studios, quiet premium brands",
    voice:
      "Sparse and precise. Every word earns its place. No filler adjectives.",
    copyRules:
      "Headline: short and memorable. Subhead: one clear idea. CTA: simple verb.",
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
  },
  Construction: {
    id: "Construction",
    bestFor:
      "roofing, plumbing, electrician, general contractors, landscaping, trade crews",
    voice:
      "Direct, practical, no-nonsense. Built for homeowners who want straight answers.",
    copyRules:
      "Headline: problem → fix. CTA: inspect / quote / call today. Prefer concrete job language.",
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
  },
  Medical: {
    id: "Medical",
    bestFor:
      "dentists, clinics, physio, veterinary, optometry, healthcare practices",
    voice:
      "Calm, reassuring, clear. Clinical trust without cold hospital tone.",
    copyRules:
      "Headline: care + ease. CTA: schedule / book visit. Never invent credentials or scare patients.",
    visual: {
      theme: "Clean Clinical",
      palette: "Clinical Mint",
      font: "DM Sans",
      borderRadius: "Soft",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Professional",
      sectionStyle: "Alternating",
    },
  },
};

/** Prompt block listing the style library for AI selection */
export function styleLibraryPromptBlock(): string {
  const lines = STYLE_IDS.map((id) => {
    const s = STYLE_LIBRARY[id];
    return `- ${id}: ${s.bestFor}. Voice: ${s.voice}`;
  });
  return [
    "STYLE LIBRARY — pick exactly ONE:",
    ...lines,
    "",
    'Return field "style" as one of: Luxury | Modern | Corporate | Friendly | Minimal | Construction | Medical',
    "All copy and visual direction must follow the chosen style.",
  ].join("\n");
}

/** Brief injected into stage-3 copy generation */
export function styleCopyBrief(style: StyleId): string {
  const s = STYLE_LIBRARY[style];
  return [
    `CHOSEN STYLE: ${s.id}`,
    `Voice: ${s.voice}`,
    `Copy rules: ${s.copyRules}`,
    `Visual intent: ${s.visual.theme}, ${s.visual.palette}, ${s.visual.font}`,
    "Write EVERY section in this style. Do not drift into another style.",
  ].join("\n");
}

export function isStyleId(value: unknown): value is StyleId {
  return (
    typeof value === "string" &&
    (STYLE_IDS as readonly string[]).includes(value)
  );
}

export function resolveStyleId(
  raw: unknown,
  fallbackHints?: { industry?: string; tradeKey?: string; tone?: string },
): StyleId {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const exact = STYLE_IDS.find(
      (id) => id.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exact) return exact;

    // Business Analyzer websiteStyle aliases → Style Library
    const aliases: Record<string, StyleId> = {
      creative: "Modern",
      classic: "Corporate",
      premium: "Luxury",
      warm: "Friendly",
      clean: "Minimal",
      trade: "Construction",
      dental: "Medical",
      clinic: "Medical",
    };
    const alias = aliases[trimmed.toLowerCase()];
    if (alias) return alias;
  }
  return suggestStyleFromHints(fallbackHints);
}

export function suggestStyleFromHints(hints?: {
  industry?: string;
  tradeKey?: string;
  tone?: string;
}): StyleId {
  const blob = [
    hints?.industry,
    hints?.tradeKey,
    hints?.tone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /dentist|dental|clinic|medical|health|physio|vet|optom/.test(blob)
  ) {
    return "Medical";
  }
  if (
    /roof|plumb|electric|construct|landscap|contractor|hvac|trade/.test(blob)
  ) {
    return "Construction";
  }
  if (/luxury|premium|boutique|fine dining|spa|estate/.test(blob)) {
    return "Luxury";
  }
  if (/law|account|consult|insur|corporate|b2b|firm/.test(blob)) {
    return "Corporate";
  }
  if (/minimal|architect|studio|photo|design/.test(blob)) {
    return "Minimal";
  }
  if (/cafe|family|friendly|pet|tutor|neighbor/.test(blob)) {
    return "Friendly";
  }
  if (/bold|modern|tech|solar|ev/.test(blob)) {
    return "Modern";
  }
  return "Modern";
}

/** Apply library visual tokens (Crestis owns CSS mapping). */
export function designSystemFromStyle(style: StyleId): DesignSystem {
  const v = STYLE_LIBRARY[style].visual;
  return {
    theme: v.theme,
    palette: v.palette,
    font: v.font,
    borderRadius: v.borderRadius,
    spacing: v.spacing,
    animation: v.animation,
    imageStyle: v.imageStyle,
    sectionStyle: v.sectionStyle,
  };
}
