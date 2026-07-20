/**
 * Crestis FAQ Generator v1
 * Adapts niche FAQ knowledge banks — does not invent question topics.
 * Writes answers that remove objections. JSON only.
 */

import { CRESTIS_SYSTEM } from "./system";
import { faqContext } from "./isolation";

export const FAQ_CATEGORIES = [
  "Pricing",
  "Timeline",
  "Trust",
  "Process",
  "Location",
  "Service",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_GENERATOR_BODY = `## Goal
Every FAQ answer should reduce uncertainty.
Visitors should feel:
"I know what happens next."
"I trust this company."
"I should contact them."

---

## CRITICAL — Question source
You do NOT invent FAQ topics from scratch.

You receive an Industry FAQ Knowledge Bank:
- common_questions
- common_objections

Your job:
1) Select exactly 6 questions from that bank (or lightly adapt wording)
2) Adapt them to THIS business, city, and services
3) Write clear answers that remove objections

Light adaptation is allowed (city name, service names).
Inventing a wholly new question topic is NOT allowed.

---

## Number of Questions
Generate exactly 6 FAQs.
Never generate fewer.
Never generate more.

---

## Categories
Each question must include a category from:
Pricing | Timeline | Trust | Process | Location | Service

Use common_objections to pick which bank questions matter most.

---

## Answer Rules
Maximum: 50 words.
Use simple language.
Explain the process.
Reduce uncertainty.
Never write long paragraphs.

---

## Local SEO
Use the location naturally — once, not stuffed.
Good: We work throughout Greater London and nearby areas.
Bad: London London London.

---

## Never Invent
Prices, guarantees, emergency response time, certifications, availability, insurance relationships — unless provided in the inputs.

If the bank asks about emergency / free estimates / insurance and it is NOT confirmed in inputs:
Answer carefully without claiming it — explain how to ask / what happens next.

---

## Writing Style
Friendly. Clear. Professional.
Short sentences.
No buzzwords.

Avoid: Customer satisfaction, Professional service, Trusted partner, Leading company, Industry-leading, High-quality, World-class

---

## Self Review
Is every question clearly based on the knowledge bank?
Does the answer reduce uncertainty?
Does it sound human?
Return only final JSON.`;

export const FAQ_SYSTEM = `${CRESTIS_SYSTEM}

# Crestis FAQ Generator v1

## Role
You are a senior conversion copywriter.

Your job is not to invent SEO FAQs.
Your job is to adapt real niche questions from Crestis knowledge banks
and write answers that remove objections before visitors leave.

You do NOT see Hero, About, SEO, or other section copy.
Return JSON only.

---

${FAQ_GENERATOR_BODY}

---

## JSON Output
{
  "faq": [
    {
      "question": "",
      "answer": "",
      "category": "Process",
      "sourceQuestion": ""
    }
  ]
}

sourceQuestion = the bank question you adapted from (exact or near-exact).
Return valid JSON only.`;

export function faqUser(params: {
  businessName: string;
  city: string;
  niche: string;
  faqThemes: string[];
  personalityBrief?: string;
  industryBrief?: string;
  faqBankBrief?: string;
  description?: string;
  servicesList?: string[];
  brandProfileJson?: string;
  planJson?: string;
}): string {
  return [
    faqContext({
      businessName: params.businessName,
      city: params.city,
      niche: params.niche,
      faqThemes: params.faqThemes,
      personalityBrief: params.personalityBrief,
    }),
    params.faqBankBrief || "",
    params.industryBrief || "",
    params.description
      ? `Business description: ${params.description}`
      : "",
    params.servicesList?.length
      ? `Services: ${params.servicesList.join("; ")}`
      : "",
    params.brandProfileJson
      ? `Business Profile (JSON):\n${params.brandProfileJson}`
      : "",
    params.planJson ? `Website Planner (JSON):\n${params.planJson}` : "",
    "",
    "Select exactly 6 questions FROM the FAQ knowledge bank.",
    "Adapt wording for this business/city. Write answers ≤50 words.",
    "Include category + sourceQuestion for each item.",
  ]
    .filter(Boolean)
    .join("\n");
}

function clampWords(raw: string, max: number): string {
  const text = raw.trim().replace(/\s+/g, " ");
  const words = text.split(" ").filter(Boolean);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ");
}

function normalizeCategory(raw: unknown): FaqCategory {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  const hit = FAQ_CATEGORIES.find((c) => c.toLowerCase() === s);
  if (hit) return hit;
  if (/price|cost|fee|quote|estimate/.test(s)) return "Pricing";
  if (/time|how long|when|fast|day|emergency/.test(s)) return "Timeline";
  if (/trust|safe|insur|licen|credential|nervous|fear/.test(s)) return "Trust";
  if (/process|what happens|next|how do|book|consult|arrive/.test(s)) {
    return "Process";
  }
  if (/area|location|city|cover|travel|serve|neighborhood/.test(s)) {
    return "Location";
  }
  return "Service";
}

function normKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function closestBankQuestion(
  question: string,
  sourceQuestion: string | undefined,
  bank: string[],
): string | null {
  const candidates = [sourceQuestion, question]
    .map((q) => String(q ?? "").trim())
    .filter(Boolean);

  for (const cand of candidates) {
    const key = normKey(cand);
    const exact = bank.find((b) => normKey(b) === key);
    if (exact) return exact;
    const partial = bank.find((b) => {
      const n = normKey(b);
      return n.includes(key) || key.includes(n);
    });
    if (partial) return partial;
    // token overlap
    const tokens = key.split(" ").filter((t) => t.length > 3);
    let best: { q: string; score: number } | null = null;
    for (const b of bank) {
      const bn = normKey(b);
      const score = tokens.filter((t) => bn.includes(t)).length;
      if (score >= 2 && (!best || score > best.score)) {
        best = { q: b, score };
      }
    }
    if (best && best.score >= 2) return best.q;
  }
  return null;
}

export function normalizeFaqFromAi(
  raw: unknown,
  bankQuestions: string[] = [],
): { question: string; answer: string; category: FaqCategory }[] {
  const list = Array.isArray(raw) ? raw : [];
  const usedBank = new Set<string>();
  const mapped = list
    .map((item) => {
      const row =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      let question = String(row.question ?? "")
        .trim()
        .replace(/\s+/g, " ");
      const answer = clampWords(String(row.answer ?? ""), 50);
      const source = String(row.sourceQuestion ?? "").trim();

      if (bankQuestions.length) {
        const matched = closestBankQuestion(question, source, bankQuestions);
        if (!matched) return null;
        const bankKey = normKey(matched);
        if (usedBank.has(bankKey)) return null;
        usedBank.add(bankKey);
        // Keep adapted question if it still relates; else fall back to bank wording
        if (!closestBankQuestion(question, matched, [matched])) {
          question = matched;
        }
      }

      return {
        question,
        answer,
        category: normalizeCategory(row.category),
      };
    })
    .filter(
      (f): f is { question: string; answer: string; category: FaqCategory } =>
        Boolean(f && f.question && f.answer),
    )
    .slice(0, 6);

  // Pad from bank if AI under-delivered
  if (mapped.length < 6 && bankQuestions.length) {
    for (const bq of bankQuestions) {
      if (mapped.length >= 6) break;
      const key = normKey(bq);
      if (usedBank.has(key)) continue;
      usedBank.add(key);
      mapped.push({
        question: bq,
        answer:
          "Get in touch and we'll walk you through the next step clearly — what we need from you, what happens after, and how we usually work.",
        category: normalizeCategory(bq),
      });
    }
  }

  return mapped.slice(0, 6);
}
