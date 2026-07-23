/**
 * Crestis About Generator v1
 * Explain trust and value — never fake company history.
 */

import { splitLongSentencesInParagraphs } from "../text/sentence-length";
import { mentionsCity, parseLocationParts } from "@/lib/review/content/types";
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
Paragraph 1 MUST include the city name once, naturally (e.g. "Based in {city}, we..." or "We proudly serve homeowners across {city}...").
Paragraph 2 — Explain: their approach, their values, why customers return.

---

## Highlights
Return exactly 3.
Examples: Fast Response, Clear Communication, Attention To Detail, Licensed Professionals, Transparent Pricing
Never invent facts. Prefer Brand Profile trustSignals / advantages when available.

---

## Writing Rules
Write naturally. Use active voice. Prefer short sentences.
Average sentence length: 12–18 words.
Maximum sentence length: 25 words.
Never write a sentence longer than 25 words.
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
    "Average sentence length: 12–18 words. Maximum 25 words per sentence.",
    "Paragraph 1 MUST mention the city by name once.",
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

function formatCityLabel(place: string): string {
  return place
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cityLabelFromLocation(location: string): string {
  const segments = location
    .split(/[,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const parts = parseLocationParts(location);
  const provinceLike = (value: string) => /^[a-z]{2}$/i.test(value.trim());

  if (segments.length >= 3 && provinceLike(segments[1] ?? "")) {
    return formatCityLabel(segments[0]!);
  }

  if (parts.city && parts.city.length >= 3 && !provinceLike(parts.city)) {
    return formatCityLabel(parts.city);
  }

  if (parts.district && parts.district.length >= 3 && !provinceLike(parts.district)) {
    return formatCityLabel(parts.district);
  }

  return formatCityLabel(segments[0] ?? location.trim());
}

function injectCityIntoFirstParagraph(first: string, cityLabel: string): string {
  const trimmed = first.trim();
  if (!trimmed) {
    return `We proudly serve homeowners across ${cityLabel} with dependable local service.`;
  }
  if (/^we\b/i.test(trimmed)) {
    return `Based in ${cityLabel}, ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
  }
  return `We proudly serve homeowners across ${cityLabel}. ${trimmed}`;
}

/** Guarantee about body text mentions the city (QA + local SEO). */
export function ensureAboutMentionsCity<T extends {
  title: string;
  text: string;
  paragraphs: string[];
  highlights: string[];
}>(about: T, location: string): T {
  const trimmedLocation = location.trim();
  if (!trimmedLocation || mentionsCity(about.text, trimmedLocation)) {
    return about;
  }

  const cityLabel = cityLabelFromLocation(trimmedLocation);
  const paragraphs = about.paragraphs.length
    ? [...about.paragraphs]
    : about.text
        .split(/\n\n+/)
        .map((part) => part.trim())
        .filter(Boolean);

  if (!paragraphs.length) {
    paragraphs.push(
      `We proudly serve homeowners across ${cityLabel} with clear communication and dependable local service.`,
    );
  } else {
    paragraphs[0] = injectCityIntoFirstParagraph(paragraphs[0]!, cityLabel);
  }

  const text = paragraphs.join("\n\n");
  return { ...about, paragraphs, text };
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
  options?: { location?: string },
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

  return finalizeAboutCopy(
    {
      title: String(raw.title ?? "").trim() || fallbackTitle,
      text,
      paragraphs: paragraphs.length
        ? paragraphs
        : text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 2),
      highlights: highlights.slice(0, 3),
    },
    options?.location ?? "",
  );
}

function enforceAboutSentenceLength<T extends {
  title: string;
  text: string;
  paragraphs: string[];
  highlights: string[];
}>(about: T): T {
  const paragraphs = splitLongSentencesInParagraphs(about.paragraphs, 25);
  const text = paragraphs.join("\n\n");
  return { ...about, paragraphs, text };
}

/** Post-process About copy: sentence length + city mention guarantee. */
export function finalizeAboutCopy<T extends {
  title: string;
  text: string;
  paragraphs: string[];
  highlights: string[];
}>(about: T, location: string): T {
  return ensureAboutMentionsCity(enforceAboutSentenceLength(about), location);
}
