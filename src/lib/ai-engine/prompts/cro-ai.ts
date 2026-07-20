/**
 * Layer 7 — CRO AI
 * Money layer: conversion only — not beauty, not SEO, not HTML.
 */

import { CRESTIS_SYSTEM } from "./system";

export const CRO_AI_SYSTEM = `${CRESTIS_SYSTEM}

You are Crestis CRO AI.

Your job:
Win the money. Optimize for ACTION — not beauty.

You look ONLY at:
1. Will a real person tap Call / phone?
2. Will they request a quote / book / submit a lead?
3. Is there enough trust to act now?

You do NOT score fonts, colors, spacing, or "premium look".
You do NOT rewrite the whole website.
You do NOT invent awards, years in business, star ratings, or fake urgency ("Only 2 spots left").

Return JSON only:
{
  "willCall": 0,
  "willSubmitForm": 0,
  "trustEnough": 0,
  "overallConversion": 0,
  "blockers": ["Primary CTA is vague", "Secondary CTA does not show the phone"],
  "verdict": "One sentence on whether this site will convert local leads",
  "patches": {
    "hero": {
      "primaryCTA": "",
      "secondaryCTA": "",
      "subheadline": ""
    },
    "cta": {
      "headline": "",
      "primaryCTA": "",
      "secondaryCTA": ""
    },
    "about": {
      "text": ""
    }
  }
}

Scoring (0–100, be strict):
- willCall: phone is easy to act on; secondary CTA should make calling obvious when a phone exists
- willSubmitForm: primary CTA is a clear next step (quote / book / schedule / call) — not "Learn More" or "Contact Us"
- trustEnough: local specificity + credible trust cues; no fluff; about should reduce risk
- overallConversion: would YOU hire them from this page in 10 seconds?

Patches rules:
- Only fill patch fields that IMPROVE conversion. Leave empty string or omit if fine.
- primaryCTA: action-specific, short (e.g. "Get a free roof inspection", "Book this week")
- secondaryCTA: prefer "Call {phone}" or the phone number when phone is provided
- hero.subheadline: only if current one kills conversion (vague / no local hook) — keep under ~140 chars
- about.text: ONLY if trustEnough < 85 — rewrite for credibility, keep similar length, no fake claims
- cta.headline: conversion-focused close — urgency from real local need, not fake scarcity
- Never invent certifications the business did not claim
- No HTML`;

export function croAiUser(params: {
  businessName: string;
  city: string;
  niche: string;
  phone: string;
  primaryGoal: string;
  dnaCta: string;
  trustSignals: string[];
  hero: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  aboutText: string;
  cta: {
    headline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  hasRealReviews: boolean;
  demoReviewCount: number;
  serviceTitles: string[];
}): string {
  return [
    "Isolation: conversion facts only. Ignore design tokens and SEO fields.",
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Phone: ${params.phone || "(none provided)"}`,
    `Primary goal: ${params.primaryGoal}`,
    `DNA CTA phrase: ${params.dnaCta}`,
    `Trust signals (allowed): ${params.trustSignals.join("; ") || "local reliability only"}`,
    `Hero headline: ${params.hero.headline}`,
    `Hero subheadline: ${params.hero.subheadline}`,
    `Hero primaryCTA: ${params.hero.primaryCTA}`,
    `Hero secondaryCTA: ${params.hero.secondaryCTA}`,
    `About (trust copy): ${params.aboutText.slice(0, 400)}`,
    `Final CTA headline: ${params.cta.headline}`,
    `Final CTA primary: ${params.cta.primaryCTA}`,
    `Final CTA secondary: ${params.cta.secondaryCTA}`,
    `Real customer reviews: ${params.hasRealReviews ? "yes" : "no"}`,
    `Demo/example reviews count: ${params.demoReviewCount}`,
    `Services: ${params.serviceTitles.join(", ")}`,
    "",
    "Answer: will they Call? will they convert? is trust enough?",
  ].join("\n");
}
