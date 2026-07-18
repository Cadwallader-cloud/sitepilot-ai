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

const SYSTEM_PROMPT = `You are Crestis, an AI website builder. Generate UNIQUE website content for a local business.

CRITICAL — every response must be different:
- Use the EXACT business name, city, and trade from the user's prompt
- Write specific services (not generic lists) — mention numbers, years, certifications when plausible
- Section titles must fit the trade (e.g. "Emergency Services" for plumbers, "Our Projects" for builders)
- Never reuse generic phrases like "quality service and attention to detail"
- Phone number should match the city area code if location is given

Return JSON only:
{
  "title": "business name",
  "tagline": "unique subtitle under 120 chars — mention location or specialty",
  "trade": "e.g. Plumber, Electrician, Roofer",
  "location": "city/area from prompt",
  "phone": "realistic phone e.g. (312) 555-0142",
  "cta": "2-4 word button label",
  "theme": {
    "primary": "#hex — main brand color fitting the trade",
    "accent": "#hex — secondary color",
    "style": "bold" | "clean" | "professional"
  },
  "sections": [
    { "id": "kebab-case", "title": "unique section name", "body": "2-3 specific sentences with details" }
  ]
}

Include exactly 3 sections. All content in English.`;

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
        content: `Create a unique contractor website for:\n${prompt}\n\nMake it specific to this business only. Do not use generic template text.`,
      },
    ],
    temperature: 0.95,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed: unknown = JSON.parse(content);
  if (!isValidSite(parsed)) {
    throw new Error("OpenAI returned an invalid site structure");
  }

  return parsed;
}
