import type { BusinessFormInput } from "./business-form";

export const WEBSITE_SYSTEM_PROMPT = `You are an expert website copywriter for local businesses.

Your task is to create a premium business website that feels UNIQUE to this exact business and city.

Rules:
- Write naturally. Do not sound like AI.
- Focus on conversion.
- Use simple English for ALL copy (hero, about, services, FAQ, SEO, CTAs, testimonials) — even if the city is Berlin, Paris, etc. Do not switch to German or other languages.
- Mention the city naturally in hero, about, SEO, and FAQ when it fits.
- Create compelling headlines.
- Include clear calls to action.
- Make every section unique to THIS business + city + services.
- Never use placeholders like "Lorem ipsum", "Service 1", or "Coming soon".

ANTI-TEMPLATE RULES (critical — quality testing fails if you ignore these):
- NEVER use generic hero titles like "Professional Roofing Services", "Quality Plumbing Services", "Expert Dental Care", or "Welcome to Our Restaurant".
- Hero title MUST be specific: include city OR weather/locale OR a concrete outcome (examples of GOOD style — invent fresh ones, do not copy):
  - "Protecting Homes Across Manchester"
  - "Dallas Roof Repairs You Can Count On"
  - "Reliable Roofing Built for Texas Weather"
- Hero primaryCTA must vary — avoid defaulting everything to "Contact Us Today". Prefer action CTAs like "Get a Free Roof Inspection", "Book Emergency Plumbing", "Schedule a Smile Consult", "Reserve a Table".
- Always include secondaryCTA (e.g. "Call +1 …" or "View services").
- About text must be a unique paragraph for this city and niche — not a reusable boilerplate reused across cities.
- Service descriptions must differ in wording even when service titles overlap; ground them in local needs.
- FAQ must match the niche:
  - Dentist: emergency patients, whitening, insurance, first visit, kids
  - Roofing: emergency roof repair, storm damage, warranties, materials, timelines
  - Plumbing: burst pipes, same-day, boilers, blocked drains
  - Electrician: consumer units, EV chargers, safety certificates, outages
  - Restaurant: reservations, dietary needs, private dining, opening hours, takeaway
- SEO title, description, and keywords must include the city and niche and must not be identical across businesses.
- Testimonials are DEMO EXAMPLES only (demo:true). Make them distinct in wording; never copy the same review text across sites. Never claim they are verified real customers.

Return ONLY valid JSON in this exact shape (no markdown, no commentary):
{
  "hero": { "headline": "", "subheadline": "", "primaryCTA": "", "secondaryCTA": "" },
  "about": { "title": "", "text": "" },
  "services": [{ "title": "", "description": "" }],
  "testimonials": [{ "name": "", "text": "", "demo": true }],
  "faq": [{ "question": "", "answer": "" }],
  "contact": { "phone": "", "email": "", "address": "" },
  "seo": {
    "title": "",
    "description": "",
    "keywords": ["...", "..."]
  }
}

JSON field rules:
- Use the EXACT business name from the user in the copy where natural
- contact.phone and contact.email must match the user input EXACTLY
- contact.address should reflect the location / service area
- services: 4–6 items based on the user's services (title + short description)
- testimonials: exactly 3 plausible local demo reviews (name + text + demo:true)
- testimonials must NEVER be Lorem Ipsum or filler text
- set every AI-created testimonial to "demo": true (demonstration examples only)
- never invent fake reviews as if they were verified real customers
- only "demo": false is allowed for genuine customer reviews (do not invent those)
- seo.title under 60 characters, seo.description under 160 characters
- seo.keywords: 5–10 local search phrases (include city + services)

FAQ rules (critical):
- Generate 4–6 FAQ items based on the business niche and listed services
- Questions must sound like real customers in that trade (not generic)
- Answers must be specific, helpful, and conversion-focused (1–3 short sentences)
- Mention the city when natural
- Never use generic FAQ like "What are your opening hours?" unless the niche is hospitality and it adds real value`;

export type WebsitePromptOptions = {
  /** When true, force a distinctly different rewrite */
  regenerate?: boolean;
  /** Copy to avoid repeating on regenerate */
  avoid?: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroCta?: string;
    aboutText?: string;
  };
  /** Extra creative direction for this run */
  variationAngle?: string;
};

const VARIATION_ANGLES = [
  "Lead with speed, availability, and fast turnaround.",
  "Lead with craftsmanship, materials, and lasting quality.",
  "Lead with local trust, neighborhood reputation, and reviews.",
  "Lead with problem-solving and emergency / urgent help.",
  "Lead with premium finish, design taste, and modern results.",
  "Lead with clear pricing honesty and no-surprise quotes.",
  "Lead with a concrete local problem this business solves better than generic competitors.",
  "Lead with the owner's practical promise — what happens in the first 24–48 hours.",
  "Lead with a specific outcome customers can picture (before/after, quiet night, dry home, booked table).",
  "Lead with seasonal or city-specific reality (weather, commute, local habits) — not generic industry fluff.",
  "Lead with reassurance for skeptical buyers: proof, process, and what is included.",
  "Lead with a bold, memorable hook — then ground it in this city and these exact services.",
];

export function pickVariationAngle(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return VARIATION_ANGLES[h % VARIATION_ANGLES.length]!;
}

export function buildWebsiteUserPrompt(
  input: BusinessFormInput,
  options: WebsitePromptOptions = {},
): string {
  const city = input.location.trim();
  const nicheHint = input.services.trim();

  const lines = [
    "Business:",
    input.businessName.trim(),
    "",
    "Category:",
    (input.category || "").trim(),
    "",
    "Location:",
    city,
    "",
    "Description:",
    (input.description || "").trim(),
    "",
    "Services:",
    nicheHint,
    "",
    "Phone:",
    input.phone.trim(),
    "",
    "Email:",
    input.email.trim(),
    "",
  ];

  if (options.regenerate) {
    lines.push(
      "REGENERATION REQUEST — the user rejected the previous draft.",
      "Write a CLEARLY DIFFERENT website. Change hero title, subtitle, CTA, about paragraph, service descriptions, FAQ questions, SEO, and testimonial wording.",
      "Do NOT paraphrase the previous copy. Invent a fresh angle.",
    );
    if (options.variationAngle) {
      lines.push(`Creative angle for this version: ${options.variationAngle}`);
    }
    if (options.avoid?.heroTitle) {
      lines.push(`FORBIDDEN hero title (do not reuse or lightly reword): "${options.avoid.heroTitle}"`);
    }
    if (options.avoid?.heroSubtitle) {
      lines.push(`FORBIDDEN hero subtitle: "${options.avoid.heroSubtitle}"`);
    }
    if (options.avoid?.heroCta) {
      lines.push(`FORBIDDEN CTA: "${options.avoid.heroCta}"`);
    }
    if (options.avoid?.aboutText) {
      lines.push(
        `FORBIDDEN about opening (do not reuse): "${options.avoid.aboutText.slice(0, 180)}"`,
      );
    }
    lines.push("");
  }

  lines.push(
    "Create the premium website JSON now.",
    `Write as if this is the only ${city} business of its kind — unique hero, about, FAQ, SEO, and CTAs.`,
    "Write FAQ specifically for this niche and these services — not generic business FAQs.",
    "Do not reuse stock phrases from other cities or businesses.",
  );

  return lines.join("\n");
}
