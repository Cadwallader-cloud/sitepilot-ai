/**
 * Crestis About Generator v1
 * Explain trust and value — never fake company history.
 */

import { CRESTIS_SYSTEM } from "./system";
import { ABOUT_ETALONS } from "./etalons";

export const ABOUT_GENERATOR_BODY = `# Crestis About Generator v1

## Role
You are a senior brand storyteller and UX copywriter.
Your job is to explain why this business deserves trust.
You do NOT write company history.
You explain value.

---

## Mission
The About section should answer:
- Who are these people?
- Why should I trust them?
- Why are they different?
- Why should I contact them?

---

## Length
80–140 words total across paragraphs.
Never exceed 140.

---

## Structure
Paragraph 1 — Explain: what the company does, who they help, what problems they solve.
Paragraph 2 — Explain: their approach, their values, why customers return.

---

## Highlights
Return exactly 3.
Examples: Fast Response, Clear Communication, Attention To Detail, Licensed Professionals, Transparent Pricing
Never invent facts. Prefer Brand Profile trustSignals / advantages when available.

---

## Writing Rules
Write naturally. Use active voice. Prefer short sentences.
Avoid filler, buzzwords, and generic company descriptions.

---

## Good Example
Helping homeowners keep their properties safe starts with dependable roofing work. Every project is approached with careful planning, honest communication and attention to detail, whether it's a small repair or a complete roof replacement.
Customers value straightforward advice, reliable workmanship and a team that respects both their time and their property from the first inspection to the final cleanup.

---

## Bad Example
We are committed to providing the highest quality roofing services with customer satisfaction as our number one priority.

---

## Forbidden Phrases
We are committed to...
Customer satisfaction is our priority
Industry-leading
World-class
Trusted partner
High-quality solutions
Professional services
Decades of experience
Unless provided.

---

## Never Invent
Years, Awards, Employees, Projects Completed, Happy Customers, Certifications, History, Statistics

---

## Emotional Goal
The visitor should think:
"They sound honest."
"They seem experienced."
"I would trust these people."

---

## Self Review
Before returning:
Would this work for any business? If yes, rewrite.
Can this be more specific?
Remove unnecessary adjectives.
Replace vague claims with concrete value.
Return only the final JSON.

---

${ABOUT_ETALONS}

## Output
Return JSON only:
{
  "title": "",
  "paragraphs": ["", ""],
  "highlights": ["", "", ""]
}`;

export const ABOUT_SYSTEM = `${CRESTIS_SYSTEM}

${ABOUT_GENERATOR_BODY}`;

export function aboutUser(params: {
  businessName: string;
  city: string;
  niche: string;
  tone: string;
  audience: string;
  positioning: string;
  trustSignals: string[];
  aboutFocus: string;
  personality?: string;
  ownerNotes?: string;
  services?: string;
  whyChooseUs?: boolean;
  forbiddenOpening?: string;
  brandProfileJson?: string;
  planJson?: string;
  advantages?: string[];
}): string {
  return [
    "Generate the About section for THIS business.",
    "Explain value and trust — do NOT invent history, years, awards, or stats.",
    "Return title, exactly 2 paragraphs (80–140 words total), exactly 3 highlights.",
    "Do NOT copy the etalon examples.",
    "",
    `Business Name: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Tone: ${params.tone}`,
    `Audience: ${params.audience}`,
    `Positioning: ${params.positioning}`,
    `Trust signals (only use if valid): ${(params.trustSignals ?? []).join(", ") || "(none)"}`,
    `Advantages (infer carefully): ${(params.advantages ?? []).join(", ") || "(none)"}`,
    `About focus: ${params.aboutFocus}`,
    `Brand Personality: ${params.personality || "(none)"}`,
    `Services: ${params.services || "(none)"}`,
    `Owner notes: ${params.ownerNotes || "(none)"}`,
    params.whyChooseUs
      ? 'Prefer title "Why Choose Us" or a close equivalent.'
      : "",
    "",
    params.brandProfileJson
      ? ["Brand Profile JSON:", params.brandProfileJson].join("\n")
      : "",
    "",
    params.planJson ? ["Planner Profile JSON:", params.planJson].join("\n") : "",
    "",
    params.forbiddenOpening
      ? `FORBIDDEN about opening: ${params.forbiddenOpening}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Normalize About Generator JSON → Crestis about block */
export function normalizeAboutFromAi(
  raw: {
    title?: unknown;
    text?: unknown;
    paragraphs?: unknown;
    highlights?: unknown;
  },
  fallbackTitle = "About Us",
): {
  title: string;
  text: string;
  paragraphs: string[];
  highlights: string[];
} {
  const paragraphs = Array.isArray(raw.paragraphs)
    ? raw.paragraphs.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  let text = String(raw.text ?? "").trim();
  if (paragraphs.length >= 2) {
    text = paragraphs.join("\n\n");
  } else if (paragraphs.length === 1 && !text) {
    text = paragraphs[0]!;
  }

  // Enforce ~140 words soft cap by truncating at sentence if wildly over
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 160) {
    text = words.slice(0, 140).join(" ") + ".";
  }

  const highlights = Array.isArray(raw.highlights)
    ? raw.highlights.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  while (highlights.length < 3) {
    const fillers = [
      "Clear Communication",
      "Attention To Detail",
      "Local Focus",
    ];
    const next = fillers[highlights.length]!;
    if (!highlights.includes(next)) highlights.push(next);
    else break;
  }

  return {
    title: String(raw.title ?? "").trim() || fallbackTitle,
    text,
    paragraphs: paragraphs.length
      ? paragraphs
      : text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 2),
    highlights: highlights.slice(0, 3),
  };
}
