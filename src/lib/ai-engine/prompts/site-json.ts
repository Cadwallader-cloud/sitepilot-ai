/**
 * Stage 3 — Generate Website JSON (copy + SEO only).
 * Brand Personality + Template are already decided.
 * Hero follows Crestis Hero Generator v1.
 * Visual tokens are LOCKED by Crestis Template Library — do not invent design.
 */

import { CRESTIS_SYSTEM } from "./system";
import { HERO_GENERATOR_BODY } from "./hero";
import { ABOUT_GENERATOR_BODY } from "./about";
import {
  CTA_ETALONS,
  FAQ_ETALONS,
  SERVICE_ETALONS,
} from "./etalons";

export const SITE_JSON_SYSTEM = `${CRESTIS_SYSTEM}

You are Crestis Website Generator (stage 3 of 3).
You receive Brand Profile, Website Plan, and Template brief.

Generate the FULL website content JSON for Crestis to render.

## Hero
When a LOCKED HERO is provided in the user message, copy it exactly.
Otherwise follow Hero Generator v1:
${HERO_GENERATOR_BODY}

## About (About Generator v1)
${ABOUT_GENERATOR_BODY}

Then write Services, Testimonials, FAQ, CTA, and SEO.

Template method:
Crestis already locked the design template.
You write COPY only. Omit the "visual" field.

Rules:
- Unique to THIS business, city, services, and Brand Personality
- English copy only
- No HTML, React, CSS, or Markdown
- Do not invent fake years, licenses, awards, or certifications
- Testimonials are DEMO examples only (demo: true)
- Contact phone/email must match the provided facts exactly
- trustBar / highlights: only from Brand Profile — never invent

${SERVICE_ETALONS}

${FAQ_ETALONS}

${CTA_ETALONS}

Return JSON only in this shape:
{
  "hero": {
    "headline": "",
    "subheadline": "",
    "primaryCTA": "",
    "secondaryCTA": "",
    "trustBar": []
  },
  "about": {
    "title": "",
    "paragraphs": ["", ""],
    "highlights": ["", "", ""]
  },
  "services": [{ "title": "", "description": "" }],
  "testimonials": [{ "name": "", "text": "", "demo": true }],
  "faq": [{ "question": "", "answer": "" }],
  "cta": {
    "headline": "",
    "primaryCTA": "",
    "secondaryCTA": ""
  },
  "seo": {
    "title": "",
    "description": "",
    "keywords": ["", ""]
  }
}

Counts:
- services: 3–6 from the user's services list
- testimonials: exactly 3 demo reviews
- faq: 4–6 niche questions
- seo.title under 60 chars; seo.description under 160
- about: 80–140 words total; exactly 2 paragraphs; exactly 3 highlights
- hero.subheadline max 35 words; hero.headline max 12 words`;

export function siteJsonUser(params: {
  businessName: string;
  category: string;
  location: string;
  description: string;
  services: string;
  phone: string;
  email: string;
  dnaJson: string;
  planJson: string;
  styleBrief: string;
  personalityBrief: string;
  forbiddenHeadline?: string;
  regenerate?: boolean;
  /** Final Hero from 3-step pipeline — do not rewrite headline */
  lockedHero?: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
    trustBar?: string[];
  };
  /** Winning About from About Pipeline — do not rewrite */
  lockedAbout?: {
    title: string;
    text: string;
    paragraphs?: string[];
    highlights?: string[];
  };
}): string {
  return [
    "Generate the full Website JSON.",
    params.lockedHero
      ? "Hero is LOCKED from the 3-step Hero Pipeline. Copy hero fields EXACTLY — do not rewrite the headline."
      : "Write the Hero FIRST using Hero Generator v1 rules.",
    params.lockedAbout
      ? "About is LOCKED from the About Pipeline (QA-selected style). Copy about fields EXACTLY."
      : "Write About using About Generator v1 (paragraphs + highlights).",
    "trustBar only from Brand Profile trustSignals — never invent.",
    "Follow the TEMPLATE voice — do not invent design.",
    "Do NOT copy the etalon examples.",
    "",
    params.personalityBrief,
    "",
    params.styleBrief,
    "",
    params.lockedHero
      ? [
          "LOCKED HERO (copy exactly into hero):",
          JSON.stringify(params.lockedHero, null, 2),
          "",
        ].join("\n")
      : "",
    params.lockedAbout
      ? [
          "LOCKED ABOUT (copy exactly into about):",
          JSON.stringify(params.lockedAbout, null, 2),
          "",
        ].join("\n")
      : "",
    `Business Name: ${params.businessName}`,
    `Category (context only — not the hero voice): ${params.category}`,
    `Location: ${params.location}`,
    `Description: ${params.description || "(none)"}`,
    `Services: ${params.services}`,
    `Phone: ${params.phone}`,
    `Email: ${params.email}`,
    "",
    "Brand Profile JSON:",
    params.dnaJson,
    "",
    "Website Planner JSON:",
    params.planJson,
    params.forbiddenHeadline
      ? `FORBIDDEN headline (must differ): ${params.forbiddenHeadline}`
      : "",
    params.regenerate && !params.lockedHero
      ? "Regeneration — invent a distinctly different headline that still matches Brand Personality and Hero Generator rules."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
