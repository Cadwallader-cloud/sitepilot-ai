import OpenAI from "openai";
import { attachTradeAssets } from "./trade-images";
import type { GeneratedSite, SiteFaq, SiteTestimonial } from "./site-types";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

const SYSTEM_PROMPT = `You are Crestis, an expert AI website copywriter for local service businesses (roofers, plumbers, electricians, landscapers, builders).

Generate COMPLETE, sellable website copy as JSON. Every field must be real marketing copy — never placeholders like "Lorem ipsum", "Service 1", or "Coming soon".

Use the EXACT business name, location, phone, email, and services from the user.

Return ONLY valid JSON with this exact shape:
{
  "title": "Exact business name",
  "tagline": "Short brand line under 90 chars",
  "trade": "e.g. Roofing Company",
  "location": "City from user",
  "phone": "Exact phone from user",
  "email": "Exact email from user",
  "hours": "e.g. Mon–Sat 7am–7pm · Emergency 24/7",
  "cta": "Button label 2-4 words",
  "heroHeadline": "Powerful headline under 70 chars — mention location or specialty",
  "heroSubheadline": "1-2 sentences that sell the offer",
  "about": "2-3 specific paragraphs worth of sentences about the company (local, credible, concrete)",
  "services": ["4-6 service names based on user services, benefit-focused"],
  "whyChooseUs": ["4 short trust reasons — specific, not generic fluff"],
  "testimonials": [
    { "quote": "2 sentences sounding like a real customer", "name": "First L.", "role": "Homeowner, City" },
    { "quote": "…", "name": "First L.", "role": "…" },
    { "quote": "…", "name": "First L.", "role": "…" }
  ],
  "faq": [
    { "question": "Real FAQ customers ask", "answer": "Helpful 1-2 sentence answer" },
    { "question": "…", "answer": "…" },
    { "question": "…", "answer": "…" },
    { "question": "…", "answer": "…" }
  ],
  "ctaBanner": "Strong closing CTA sentence",
  "contactBlurb": "1 sentence inviting them to call/email"
}

Rules:
- English only
- Mention the city naturally in hero, about, reviews, FAQ
- Services must reflect the user's list (you may polish wording)
- Phone and email must match the user input exactly
- No markdown, no commentary — JSON only`;

type RawSite = Partial<GeneratedSite> & {
  title?: string;
  tagline?: string;
  cta?: string;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, min = 1): string[] {
  if (!Array.isArray(value)) return [];
  const items = value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
  return items.length >= min ? items : items;
}

function asTestimonials(value: unknown): SiteTestimonial[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const t = item as Record<string, unknown>;
      const quote = asString(t.quote);
      const name = asString(t.name);
      const role = asString(t.role);
      if (!quote || !name) return null;
      return { quote, name, role: role || "Customer" };
    })
    .filter((t): t is SiteTestimonial => Boolean(t));
}

function asFaq(value: unknown): SiteFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const f = item as Record<string, unknown>;
      const question = asString(f.question);
      const answer = asString(f.answer);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((f): f is SiteFaq => Boolean(f));
}

export function normalizeGeneratedSite(
  raw: RawSite,
  fallback: {
    businessName: string;
    location: string;
    services: string;
    phone: string;
    email: string;
  },
): GeneratedSite {
  const title = asString(raw.title, fallback.businessName);
  const location = asString(raw.location, fallback.location);
  const phone = asString(raw.phone, fallback.phone);
  const email = asString(raw.email, fallback.email);
  const servicesFromInput = fallback.services
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const services = asStringArray(raw.services, 1);
  const whyChooseUs = asStringArray(raw.whyChooseUs, 1);
  const testimonials = asTestimonials(raw.testimonials);
  const faq = asFaq(raw.faq);

  const tradeHint = `${title} ${asString(raw.trade)} ${fallback.services} ${location}`;
  const assets = attachTradeAssets(tradeHint);

  return {
    title,
    tagline: asString(
      raw.tagline,
      `Professional ${asString(raw.trade, "services")} in ${location}`,
    ),
    trade: asString(raw.trade, "Local business"),
    location,
    phone,
    email,
    hours: asString(raw.hours, "Mon–Sat 7am–7pm · Emergency call-outs available"),
    cta: asString(raw.cta, "Get a free quote"),
    heroHeadline: asString(
      raw.heroHeadline,
      `${title} — trusted ${location} specialists`,
    ),
    heroSubheadline: asString(
      raw.heroSubheadline,
      `Quality workmanship for homeowners and businesses across ${location}.`,
    ),
    about: asString(
      raw.about,
      `${title} is a trusted local team serving ${location}. We deliver clear pricing, reliable scheduling, and workmanship built to last.`,
    ),
    services: services.length ? services : servicesFromInput,
    whyChooseUs: whyChooseUs.length
      ? whyChooseUs
      : [
          "Licensed & insured",
          "Clear upfront pricing",
          "Local team you can trust",
          "Workmanship guaranteed",
        ],
    testimonials: testimonials.length
      ? testimonials
      : [
          {
            quote: `Called ${title} for a job in ${location}. Professional, on time, and the finish was excellent.`,
            name: "Alex M.",
            role: `Homeowner, ${location}`,
          },
          {
            quote: "Fair quote and they cleaned up perfectly. Would hire again without hesitation.",
            name: "Jordan P.",
            role: "Property manager",
          },
          {
            quote: "Clear communication from start to finish. Highly recommend.",
            name: "Sam R.",
            role: `Customer, ${location}`,
          },
        ],
    faq: faq.length
      ? faq
      : [
          {
            question: "Do you offer free estimates?",
            answer: "Yes — we provide clear written estimates before any work begins.",
          },
          {
            question: "Are you licensed and insured?",
            answer: "Yes. We are fully licensed and insured for your peace of mind.",
          },
          {
            question: `Which areas do you cover?`,
            answer: `We proudly serve ${location} and surrounding neighborhoods.`,
          },
          {
            question: "How quickly can you start?",
            answer: "Many jobs can be scheduled within days — ask about emergency availability.",
          },
        ],
    ctaBanner: asString(
      raw.ctaBanner,
      `Ready for a free quote from ${title}? Call or email today.`,
    ),
    contactBlurb: asString(
      raw.contactBlurb,
      `Contact ${title} — we're happy to help.`,
    ),
    theme: assets.theme,
    images: assets.images,
  };
}

export async function generateSiteWithOpenAI(
  prompt: string,
  fallback: {
    businessName: string;
    location: string;
    services: string;
    phone: string;
    email: string;
  },
): Promise<GeneratedSite> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Create a complete sellable website for this business:\n\n${prompt}`,
      },
    ],
    temperature: 0.85,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed = JSON.parse(content) as RawSite;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("OpenAI returned invalid JSON");
  }

  return normalizeGeneratedSite(parsed, fallback);
}
