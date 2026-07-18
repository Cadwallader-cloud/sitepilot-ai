import type { BusinessFormInput } from "./business-form";

export const WEBSITE_SYSTEM_PROMPT = `You generate website CONTENT as STRICT JSON for Crestis.

Return ONLY this shape (no extra keys, no markdown):
{
  "hero": { "title": "", "subtitle": "", "cta": "" },
  "about": { "title": "", "text": "" },
  "services": [{ "title": "", "description": "" }],
  "testimonials": [{ "name": "", "text": "" }],
  "faq": [{ "question": "", "answer": "" }],
  "contact": { "phone": "", "email": "", "address": "" },
  "seo": { "title": "", "description": "" }
}

RULES:
- Use the EXACT business name, location, phone, and email from the user
- contact.phone and contact.email must match user input exactly
- contact.address should be the location / service area from the user
- Real marketing copy only — never placeholders
- services: 4–6 items based on the user's services list
- testimonials: exactly 3 realistic reviews (name + text)
- faq: 3–5 useful Q&As
- seo.title under 60 characters, seo.description under 160
- English only`;

export function buildWebsiteUserPrompt(input: BusinessFormInput): string {
  return [
    "Generate STRICT website JSON for:",
    `businessName: ${input.businessName}`,
    `location: ${input.location}`,
    `services: ${input.services}`,
    `phone: ${input.phone}`,
    `email: ${input.email}`,
  ].join("\n");
}
