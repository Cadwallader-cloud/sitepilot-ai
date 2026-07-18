import OpenAI from "openai";
import type { BusinessFormInput } from "./business-form";
import {
  buildWebsiteUserPrompt,
  WEBSITE_SYSTEM_PROMPT,
} from "./openai-prompt";
import { attachTradeAssets } from "./trade-images";
import type { GeneratedSite, WebsiteContent } from "./site-types";
import { parseWebsiteContent, WEBSITE_JSON_SCHEMA } from "./website-schema";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

function withDesign(content: WebsiteContent): GeneratedSite {
  const hint = [
    content.contact.businessName,
    content.contact.trade,
    content.contact.location,
    ...content.services.map((s) => s.title),
  ].join(" ");

  const assets = attachTradeAssets(hint);

  return {
    ...content,
    theme: assets.theme,
    images: assets.images,
  };
}

function enforceContact(
  content: WebsiteContent,
  input: BusinessFormInput,
): WebsiteContent {
  return {
    ...content,
    contact: {
      ...content.contact,
      businessName: input.businessName.trim() || content.contact.businessName,
      location: input.location.trim() || content.contact.location,
      phone: input.phone.trim() || content.contact.phone,
      email: input.email.trim() || content.contact.email,
    },
  };
}

/**
 * Business info → OpenAI structured content JSON → + theme/images → site
 */
export async function generateSiteWithOpenAI(
  input: BusinessFormInput,
): Promise<GeneratedSite> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  let rawText: string | null = null;

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
    rawText = response.choices[0]?.message?.content ?? null;
  } catch (schemaError) {
    console.warn("json_schema failed, falling back to json_object:", schemaError);
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: WEBSITE_SYSTEM_PROMPT },
        { role: "user", content: buildWebsiteUserPrompt(input) },
      ],
    });
    rawText = response.choices[0]?.message?.content ?? null;
  }

  if (!rawText) throw new Error("OPENAI_EMPTY");

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("OPENAI_INVALID_JSON");
  }

  const content = enforceContact(parseWebsiteContent(parsed), input);
  return withDesign(content);
}

/** Template / fallback content in the same nested schema */
export function buildContentFromInput(input: BusinessFormInput): WebsiteContent {
  const name = input.businessName.trim();
  const location = input.location.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  const serviceTitles = input.services
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const services = (
    serviceTitles.length
      ? serviceTitles
      : ["General services", "Free estimates", "Emergency call-outs"]
  ).map((title) => ({
    title,
    description: `Professional ${title.toLowerCase()} for homes and businesses in ${location}.`,
  }));

  while (services.length < 3) {
    services.push({
      title: "Free estimates",
      description: `Clear written quotes before work begins in ${location}.`,
    });
  }

  return {
    hero: {
      title: `${name} — quality work in ${location}`,
      subtitle: `Trusted local specialists for ${serviceTitles.slice(0, 2).join(" & ") || "professional services"} across ${location}.`,
      cta: "Get a free quote",
    },
    about: {
      title: "About us",
      text: `${name} is a local team serving ${location}. We focus on clear pricing, reliable scheduling, and workmanship you can trust — from first call to final clean-up.`,
    },
    services,
    whyChooseUs: {
      title: "Why choose us",
      items: [
        "Licensed & insured",
        "Clear upfront pricing",
        "Local team, fast response",
        "Workmanship guaranteed",
      ],
    },
    testimonials: [
      {
        quote: `Hired ${name} in ${location}. On time, professional, and the finish was excellent.`,
        name: "Alex M.",
        role: `Homeowner, ${location}`,
      },
      {
        quote: "Fair quote and they cleaned up perfectly. Would book again.",
        name: "Jordan P.",
        role: "Property manager",
      },
      {
        quote: "Clear communication from start to finish. Highly recommend.",
        name: "Sam R.",
        role: `Customer, ${location}`,
      },
    ],
    faq: [
      {
        question: "Do you offer free estimates?",
        answer: "Yes — we provide clear written estimates before work begins.",
      },
      {
        question: "Are you licensed and insured?",
        answer: "Yes. Fully licensed and insured for your peace of mind.",
      },
      {
        question: "Which areas do you cover?",
        answer: `We serve ${location} and nearby neighborhoods.`,
      },
      {
        question: "How soon can you start?",
        answer: "Many jobs can be booked within days — ask about emergencies.",
      },
    ],
    cta: {
      title: `Ready for a free quote from ${name}?`,
      text: "Tell us about your project — we respond quickly.",
      button: "Get a free quote",
    },
    contact: {
      businessName: name,
      trade: "Local service business",
      phone,
      email,
      location,
      hours: "Mon–Sat 7am–7pm · Emergency call-outs available",
      blurb: `Call or email ${name} — we're happy to help.`,
    },
    seo: {
      title: `${name} | ${location}`,
      description: `${name} provides ${serviceTitles.slice(0, 3).join(", ") || "professional services"} in ${location}. Call ${phone}.`,
    },
  };
}

export function normalizeGeneratedSite(
  content: WebsiteContent,
  input: BusinessFormInput,
): GeneratedSite {
  return withDesign(enforceContact(content, input));
}
