import OpenAI from "openai";
import type { GeneratedSite } from "./site-types";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

const SYSTEM_PROMPT = `You are Crestis, an AI website builder for local businesses.

Generate a COMPLETE website content pack — not a thin outline. The user will preview a full landing page from this JSON.

RULES:
- Use the EXACT business name, city, trade, phone, and services from the user
- Write specific, local, trustworthy copy (no filler like "quality service and attention to detail")
- Services must match what the user listed (expand slightly with benefit-focused wording)
- Testimonials must feel realistic for that trade and city
- Colors must fit the trade (roofing = warm/orange, plumbing = blue, landscaping = green, electrician = dark/sky, construction = yellow/charcoal)
- All content in English

Return JSON only with this shape:
{
  "title": "Business Name",
  "tagline": "Compelling subtitle under 120 chars mentioning location or specialty",
  "trade": "Trade type",
  "location": "City / area",
  "phone": "Phone if provided, else plausible local number",
  "email": "realistic contact email e.g. hello@business.com",
  "hours": "e.g. Mon–Sat 7am–7pm · Emergency 24/7",
  "cta": "2-4 word CTA button",
  "about": "2-3 sentences about the company — local, specific, credible",
  "services": ["4-6 short service names"],
  "highlights": ["3 short trust bullets e.g. Licensed & insured"],
  "testimonials": [
    { "quote": "1-2 sentences", "name": "First Last.", "role": "Homeowner, City" },
    { "quote": "1-2 sentences", "name": "First Last.", "role": "Business owner" }
  ],
  "theme": {
    "primary": "#hex",
    "accent": "#hex",
    "style": "bold" | "clean" | "professional"
  },
  "sections": [
    { "id": "services", "title": "Our services", "body": "Short intro", "items": ["service 1", "service 2"] },
    { "id": "why-us", "title": "Why choose us", "body": "2 sentences" },
    { "id": "service-area", "title": "Service area", "body": "Cities/areas served" }
  ]
}

Include exactly 3 sections. Always include services, highlights, testimonials, about, hours, email.`;

function isValidSite(data: unknown): data is GeneratedSite {
  if (!data || typeof data !== "object") return false;

  const site = data as GeneratedSite;

  return (
    typeof site.title === "string" &&
    typeof site.tagline === "string" &&
    typeof site.cta === "string" &&
    Array.isArray(site.sections) &&
    site.sections.length >= 2 &&
    site.sections.every(
      (section) =>
        typeof section.id === "string" &&
        typeof section.title === "string" &&
        typeof section.body === "string",
    )
  );
}

function normalizeSite(site: GeneratedSite): GeneratedSite {
  const servicesFromSections = site.sections.find((s) => s.items?.length)?.items;

  return {
    ...site,
    services:
      site.services?.length
        ? site.services
        : servicesFromSections?.length
          ? servicesFromSections
          : undefined,
    testimonials: Array.isArray(site.testimonials)
      ? site.testimonials.filter(
          (t) =>
            typeof t?.quote === "string" &&
            typeof t?.name === "string" &&
            typeof t?.role === "string",
        )
      : undefined,
    highlights: Array.isArray(site.highlights)
      ? site.highlights.filter((h) => typeof h === "string")
      : undefined,
  };
}

export async function generateSiteWithOpenAI(
  prompt: string,
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
        content: `Build a complete local business website for:\n${prompt}\n\nMake every line specific to this business. No generic template filler.`,
      },
    ],
    temperature: 0.9,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed: unknown = JSON.parse(content);
  if (!isValidSite(parsed)) {
    throw new Error("OpenAI returned an invalid site structure");
  }

  return normalizeSite(parsed);
}
