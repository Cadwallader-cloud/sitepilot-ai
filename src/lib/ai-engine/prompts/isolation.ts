/**
 * Crestis isolation rule — no agent sees the whole website.
 *
 * Layer 4 Copywriting Engine:
 *   Hero AI → About AI → Service AI → FAQ AI → CTA AI
 * Each agent gets a minimal slice only.
 *
 * Exception: Quality Reviewer sees assembled JSON to score it.
 */

export const ISOLATION_RULE = `Isolation rule: You receive ONLY the fields listed below for your job.
You do not know about other website sections.
Do not invent or reference FAQ, SEO, design tokens, or other blocks unless they are in your input.`;

/** Hero context: business + tone + CTA + audience + uniqueness hooks */
export function heroContext(params: {
  businessName: string;
  city: string;
  niche: string;
  tone: string;
  audience: string;
  ctaStrategy: string;
  phone?: string;
  creativeHook?: string;
  positioning?: string;
  personality?: string;
  services?: string;
  ownerNotes?: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Tone: ${params.tone}`,
    `Audience: ${params.audience}`,
    `CTA strategy: ${params.ctaStrategy}`,
    params.positioning ? `Positioning: ${params.positioning}` : "",
    params.personality ? `Brand personality: ${params.personality}` : "",
    params.services ? `Services offered: ${params.services}` : "",
    params.creativeHook
      ? `Creative hook (MUST shape the headline angle): ${params.creativeHook}`
      : "",
    params.ownerNotes
      ? `Owner notes (weave in real specifics; do not copy verbatim): ${params.ownerNotes}`
      : "",
    params.phone ? `Phone (for secondary CTA only): ${params.phone}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** About: trust-focused slice — no hero/FAQ/SEO copy */
export function aboutContext(params: {
  businessName: string;
  city: string;
  niche: string;
  tone: string;
  audience: string;
  positioning: string;
  trustSignals: string[];
  personality?: string;
  ownerNotes?: string;
  services?: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Tone: ${params.tone}`,
    `Audience: ${params.audience}`,
    `Positioning: ${params.positioning}`,
    params.personality ? `Brand personality: ${params.personality}` : "",
    params.services ? `Services: ${params.services}` : "",
    params.ownerNotes
      ? `Owner notes (use specifics; do not invent history): ${params.ownerNotes}`
      : "",
    `Trust signals: ${params.trustSignals.join("; ") || "local reliability"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Services: offer-focused — no FAQ/SEO/hero */
export function servicesContext(params: {
  businessName: string;
  city: string;
  niche: string;
  tone: string;
  serviceFocus: string[];
  personalityBrief?: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Tone: ${params.tone}`,
    params.serviceFocus.length
      ? `Service focus: ${params.serviceFocus.join("; ")}`
      : "",
    params.personalityBrief || "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** FAQ: industry themes only */
export function faqContext(params: {
  businessName: string;
  city: string;
  niche: string;
  faqThemes: string[];
  personalityBrief?: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Industry FAQ themes: ${params.faqThemes.join(" | ")}`,
    params.personalityBrief || "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Testimonials demo examples — no SEO/FAQ */
export function testimonialsContext(params: {
  businessName: string;
  city: string;
  niche: string;
  audience: string;
  testimonialAngle: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Audience: ${params.audience}`,
    `Example angle (demo only): ${params.testimonialAngle}`,
  ].join("\n");
}

/** Final CTA band — conversion only */
export function ctaContext(params: {
  businessName: string;
  city: string;
  tone: string;
  audience: string;
  ctaStrategy: string;
  phone?: string;
  creativeHook?: string;
  personalityBrief?: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Tone: ${params.tone}`,
    `Audience: ${params.audience}`,
    `CTA strategy: ${params.ctaStrategy}`,
    params.creativeHook ? `Creative hook: ${params.creativeHook}` : "",
    params.phone ? `Phone: ${params.phone}` : "",
    params.personalityBrief || "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** SEO: local search fields only — no FAQ body, no design */
export function seoContext(params: {
  businessName: string;
  city: string;
  niche: string;
  serviceTitles: string[];
  heroHeadline: string;
}): string {
  return [
    ISOLATION_RULE,
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Service titles: ${params.serviceTitles.join(", ")}`,
    `Hero headline (for keyword alignment only): ${params.heroHeadline}`,
  ].join("\n");
}
