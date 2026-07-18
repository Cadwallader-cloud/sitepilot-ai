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
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

async function toGeneratedSite(
  content: WebsiteContent,
  input: BusinessFormInput,
): Promise<GeneratedSite> {
  const hint = [
    input.businessName,
    input.location,
    input.services,
    ...content.services.map((s) => s.title),
  ].join(" ");

  const assets = await attachTradeAssets(hint);

  return {
    ...content,
    contact: {
      phone: input.phone.trim() || content.contact.phone,
      email: input.email.trim() || content.contact.email,
      address: content.contact.address || input.location.trim(),
    },
    businessName: input.businessName.trim(),
    theme: assets.theme,
    images: assets.images,
  };
}

/** Business info → OpenAI STRICT JSON → GeneratedSite */
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

  const content = parseWebsiteContent(parsed);
  // Safety: AI-generated testimonials are always marked as demo examples
  content.testimonials = content.testimonials.map((t) => ({
    ...t,
    demo: true,
  }));
  return await toGeneratedSite(content, input);
}
