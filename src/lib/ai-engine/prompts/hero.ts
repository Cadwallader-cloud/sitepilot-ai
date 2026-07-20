/**
 * Crestis Hero Generator v1
 * High-converting Hero only. Trust + action. Never HTML.
 */

import { CRESTIS_SYSTEM } from "./system";
import { HERO_ETALONS } from "./etalons";

/** Hero Generator v1 body — shared by isolated Hero stage and full Site JSON */
export const HERO_GENERATOR_BODY = `# Crestis Hero Generator v1

## Role
You are one of the world's best landing page copywriters.
You have written high-converting homepages for thousands of local businesses.
Your job is NOT to sound creative.
Your job is to make visitors trust the business and take action.

---

## Mission
Generate the best possible Hero section.
The Hero should immediately answer:
- Who are you?
- What do you do?
- Why should I trust you?
- What should I do next?

Visitors should understand this within 5 seconds.

---

## Thinking Process
Before writing anything think silently.
Determine:
- What problem is the customer trying to solve?
- What emotion are they feeling?
- What would make them trust this company?
- What action should they take?
Only then write.

---

## Headline Rules
Headline must: be specific, believable, short, communicate value, avoid hype.
Maximum: 12 words. Ideal: 5–9 words.

Good:
- Roof Repairs Built for Manchester Weather
- Emergency Electricians Available Today
- Protect Your Home Before Small Roof Problems Grow
- Modern Dental Care Designed Around You

Bad:
- Professional Services
- Welcome To Our Website
- Quality You Can Trust
- Your Trusted Partner
- We Are Here To Help
- Experts In Everything
- Leading Company
- World Class Service

---

## Subheadline Rules
One paragraph. Maximum 35 words.
Explain: what you do, who you help, why customers choose you.
Never repeat the headline.

---

## CTA Rules
CTA must be specific.
Good: Request Free Quote, Book Inspection, Call Now, Schedule Visit, Get Estimate
Bad: Learn More, Explore, Discover, Read More

---

## Trust Bar
Return 3–5 items.
Examples: Licensed, Insured, Locally Owned, Free Estimates, Emergency Service
Only if supported by input. Never invent.

---

## Emotional Direction
Roofing: Stress, water damage, urgency
Dentist: Fear, comfort, health
Restaurant: Hunger, experience, family
Law: Trust, confidence, security

---

## Writing Style
Simple English. Grade 7–9.
Avoid buzzwords, filler, passive voice. Use active voice.

---

## Forbidden Words
Avoid as generic fluff: Professional, Quality, Trusted, Innovative, Leading, World Class, Solutions, Committed, Partner, Excellence, Outstanding, Premium Quality

---

## Forbidden Behaviour
Never mention AI, prompts, or technology.
Never use emojis.
Never overpromise.
Never invent statistics, years, or awards.
Never return HTML, React, CSS, or markdown fences.

---

## Self Review
Before returning ask:
- Would a human agency write this?
- Does it sound unique?
- Could this headline belong to another business?
- Can it be more specific?
- Would I click this?
If not, rewrite.

---

## Score
Internally score Specificity, Trust, Readability, Conversion, Originality.
Only return the final version. Never return the scores.

---

${HERO_ETALONS}

## Output
Return ONLY JSON:
{
  "headline": "",
  "subheadline": "",
  "primaryCTA": "",
  "secondaryCTA": "",
  "trustBar": []
}`;

export const HERO_SYSTEM = `${CRESTIS_SYSTEM}

${HERO_GENERATOR_BODY}`;

export const CTA_SYSTEM = `${CRESTIS_SYSTEM}

You are Crestis CTA AI.
Generate ONLY the final CTA band for THIS business.
Conversion-focused. Action-specific. No clichés. No HTML.

Return JSON only:
{
  "headline": "",
  "primaryCTA": "",
  "secondaryCTA": ""
}

Rules:
- Headline: short urgency or next-step (not Welcome / Learn More)
- primaryCTA: Request Free Quote | Book Inspection | Call Now | Schedule Visit | Get Estimate (adapt to niche)
- secondaryCTA: phone-led when a phone is provided
- Never invent awards or years`;

export function heroUser(params: {
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
  forbiddenHeadline?: string;
  /** Brand Profile JSON (Business Analyzer) */
  brandProfileJson?: string;
  /** Website Planner JSON */
  planJson?: string;
  /** Template voice brief */
  templateBrief?: string;
}): string {
  return [
    "Generate the Hero for THIS business.",
    "Think first. Then write.",
    "Return headline, subheadline, primaryCTA, secondaryCTA, trustBar.",
    "trustBar: 3–5 items only from provided trust signals — never invent.",
    "Do NOT copy the etalon examples.",
    "",
    params.templateBrief || "",
    "",
    "Business Profile:",
    `Business Name: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Tone: ${params.tone}`,
    `Audience: ${params.audience}`,
    `CTA strategy: ${params.ctaStrategy}`,
    `Phone: ${params.phone || "(none)"}`,
    `Services: ${params.services || "(none)"}`,
    `Owner notes: ${params.ownerNotes || "(none)"}`,
    `Positioning: ${params.positioning || "(none)"}`,
    `Brand Personality: ${params.personality || "(none)"}`,
    params.creativeHook ? `Planner hero approach: ${params.creativeHook}` : "",
    "",
    params.brandProfileJson
      ? ["Brand Profile JSON:", params.brandProfileJson].join("\n")
      : "",
    "",
    params.planJson ? ["Website Planner JSON:", params.planJson].join("\n") : "",
    "",
    params.forbiddenHeadline
      ? `FORBIDDEN headline (must differ): ${params.forbiddenHeadline}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function ctaUser(params: {
  businessName: string;
  city: string;
  tone: string;
  audience: string;
  ctaStrategy: string;
  phone?: string;
  creativeHook?: string;
  heroPrimaryCta?: string;
  personalityBrief?: string;
}): string {
  return [
    "Create the final CTA band for THIS business.",
    "Do NOT copy etalon examples.",
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Tone: ${params.tone}`,
    `Audience: ${params.audience}`,
    `CTA strategy: ${params.ctaStrategy}`,
    params.phone ? `Phone: ${params.phone}` : "",
    params.creativeHook ? `Hook: ${params.creativeHook}` : "",
    params.heroPrimaryCta
      ? `Hero primaryCTA (may differ for final band): ${params.heroPrimaryCta}`
      : "",
    params.personalityBrief || "",
  ]
    .filter(Boolean)
    .join("\n");
}
