import OpenAI from "openai";
import type { BusinessFormInput } from "./business-form";
import {
  buildWebsiteUserPrompt,
  WEBSITE_SYSTEM_PROMPT,
} from "./openai-prompt";
import { attachTradeAssets } from "./trade-images";
import type { GeneratedSite } from "./site-types";
import {
  aiJsonToGeneratedSite,
  parseWebsiteAiJson,
  WEBSITE_JSON_SCHEMA,
  type WebsiteAiJson,
} from "./website-schema";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

function withTradeAssets(ai: WebsiteAiJson): GeneratedSite {
  const hint = `${ai.title} ${ai.trade} ${ai.services.join(" ")} ${ai.location}`;
  const assets = attachTradeAssets(hint);
  return aiJsonToGeneratedSite(ai, {
    theme: assets.theme,
    images: assets.images,
  });
}

/**
 * Business info → OpenAI (structured JSON schema) → GeneratedSite
 */
export async function generateSiteWithOpenAI(
  input: BusinessFormInput,
): Promise<GeneratedSite> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  let content: string | null = null;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.8,
      response_format: {
        type: "json_schema",
        json_schema: WEBSITE_JSON_SCHEMA,
      },
      messages: [
        { role: "system", content: WEBSITE_SYSTEM_PROMPT },
        { role: "user", content: buildWebsiteUserPrompt(input) },
      ],
    });
    content = response.choices[0]?.message?.content ?? null;
  } catch (schemaError) {
    // Fallback if model/account doesn't support json_schema yet
    console.warn("json_schema failed, falling back to json_object:", schemaError);
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${WEBSITE_SYSTEM_PROMPT}\n\nReturn ONLY valid JSON with keys: title, tagline, trade, location, phone, email, hours, cta, heroHeadline, heroSubheadline, about, services, whyChooseUs, testimonials, faq, ctaBanner, contactBlurb.`,
        },
        { role: "user", content: buildWebsiteUserPrompt(input) },
      ],
    });
    content = response.choices[0]?.message?.content ?? null;
  }

  if (!content) {
    throw new Error("OPENAI_EMPTY");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OPENAI_INVALID_JSON");
  }

  // Force exact contact fields from user input (never invent phone/email)
  const ai = parseWebsiteAiJson(parsed);
  ai.title = input.businessName.trim() || ai.title;
  ai.location = input.location.trim() || ai.location;
  ai.phone = input.phone.trim() || ai.phone;
  ai.email = input.email.trim() || ai.email;

  return withTradeAssets(ai);
}

/** Used by template fallback — same final shape as AI */
export function normalizeGeneratedSite(
  raw: Partial<WebsiteAiJson>,
  fallback: BusinessFormInput,
): GeneratedSite {
  const services = Array.isArray(raw.services)
    ? raw.services
    : fallback.services
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const ai = parseWebsiteAiJson({
    title: raw.title || fallback.businessName,
    tagline: raw.tagline || `Trusted specialists in ${fallback.location}`,
    trade: raw.trade || "Local business",
    location: raw.location || fallback.location,
    phone: raw.phone || fallback.phone,
    email: raw.email || fallback.email,
    hours: raw.hours || "Mon–Sat 7am–7pm · Emergency call-outs available",
    cta: raw.cta || "Get a free quote",
    heroHeadline:
      raw.heroHeadline ||
      `${fallback.businessName} — quality work in ${fallback.location}`,
    heroSubheadline:
      raw.heroSubheadline ||
      `Professional services for homes and businesses across ${fallback.location}.`,
    about:
      raw.about ||
      `${fallback.businessName} is a trusted local team serving ${fallback.location}. Clear pricing, reliable scheduling, workmanship built to last.`,
    services: services.length >= 3 ? services : [...services, "Free estimates", "Emergency call-outs"].slice(0, 3),
    whyChooseUs:
      Array.isArray(raw.whyChooseUs) && raw.whyChooseUs.length >= 3
        ? raw.whyChooseUs
        : [
            "Licensed & insured",
            "Clear upfront pricing",
            "Local team you can trust",
            "Workmanship guaranteed",
          ],
    testimonials:
      Array.isArray(raw.testimonials) && raw.testimonials.length >= 2
        ? raw.testimonials
        : [
            {
              quote: `Hired ${fallback.businessName} in ${fallback.location}. Professional and on time.`,
              name: "Alex M.",
              role: `Homeowner, ${fallback.location}`,
            },
            {
              quote: "Fair quote and excellent finish. Would hire again.",
              name: "Jordan P.",
              role: "Property manager",
            },
            {
              quote: "Clear communication from start to finish.",
              name: "Sam R.",
              role: `Customer, ${fallback.location}`,
            },
          ],
    faq:
      Array.isArray(raw.faq) && raw.faq.length >= 2
        ? raw.faq
        : [
            {
              question: "Do you offer free estimates?",
              answer: "Yes — clear written estimates before work begins.",
            },
            {
              question: "Are you licensed and insured?",
              answer: "Yes. Fully licensed and insured.",
            },
            {
              question: "Which areas do you cover?",
              answer: `We serve ${fallback.location} and nearby areas.`,
            },
            {
              question: "How soon can you start?",
              answer: "Many jobs within days — ask about emergencies.",
            },
          ],
    ctaBanner:
      raw.ctaBanner ||
      `Ready for a free quote from ${fallback.businessName}? Get in touch today.`,
    contactBlurb:
      raw.contactBlurb ||
      `Contact ${fallback.businessName} — we're happy to help.`,
  });

  return withTradeAssets(ai);
}
