/**
 * Stage 3d — Testimonials
 * Demo examples only. No SEO/FAQ/Hero copy in context.
 */

import { COPYWRITING_ENGINE_RULE } from "./copywriting";
import { testimonialsContext } from "./isolation";

export const TESTIMONIALS_SYSTEM = `${COPYWRITING_ENGINE_RULE}

You are Crestis Testimonials AI (demo examples only).

Generate EXAMPLE testimonials for a Crestis demo / preview only.

You do NOT see Hero, FAQ, SEO, or About copy.

Critical policy:
- These are NOT real customer reviews.
- Never invent fake reviews for a live business site.
- Always set "demo": true.
- Distinct names and distinct wording.
- Never claim verified customers, awards, or star ratings as fact.

Return JSON only:
{
  "testimonials": [
    { "name": "", "text": "", "demo": true }
  ]
}

Rules:
- Exactly 3 example reviews
- English
- No HTML`;

export function testimonialsUser(params: {
  businessName: string;
  city: string;
  niche: string;
  audience: string;
  testimonialAngle: string;
}): string {
  return [
    testimonialsContext(params),
    "Remember: these are labeled demo examples, not real reviews.",
  ].join("\n");
}
