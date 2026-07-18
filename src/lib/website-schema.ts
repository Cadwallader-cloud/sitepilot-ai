import type { GeneratedSite, SiteFaq, SiteTestimonial } from "./site-types";

/**
 * OpenAI Structured Outputs JSON Schema.
 * Pipeline: Business info → OpenAI → this shape → Website renderer
 */
export const WEBSITE_JSON_SCHEMA = {
  name: "crestis_website",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "tagline",
      "trade",
      "location",
      "phone",
      "email",
      "hours",
      "cta",
      "heroHeadline",
      "heroSubheadline",
      "about",
      "services",
      "whyChooseUs",
      "testimonials",
      "faq",
      "ctaBanner",
      "contactBlurb",
    ],
    properties: {
      title: { type: "string" },
      tagline: { type: "string" },
      trade: { type: "string" },
      location: { type: "string" },
      phone: { type: "string" },
      email: { type: "string" },
      hours: { type: "string" },
      cta: { type: "string" },
      heroHeadline: { type: "string" },
      heroSubheadline: { type: "string" },
      about: { type: "string" },
      services: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 8,
      },
      whyChooseUs: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 6,
      },
      testimonials: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["quote", "name", "role"],
          properties: {
            quote: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
          },
        },
      },
      faq: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "answer"],
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
        },
      },
      ctaBanner: { type: "string" },
      contactBlurb: { type: "string" },
    },
  },
} as const;

export type WebsiteAiJson = {
  title: string;
  tagline: string;
  trade: string;
  location: string;
  phone: string;
  email: string;
  hours: string;
  cta: string;
  heroHeadline: string;
  heroSubheadline: string;
  about: string;
  services: string[];
  whyChooseUs: string[];
  testimonials: SiteTestimonial[];
  faq: SiteFaq[];
  ctaBanner: string;
  contactBlurb: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown, min: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= min &&
    value.every(isNonEmptyString)
  );
}

function isTestimonials(value: unknown): value is SiteTestimonial[] {
  if (!Array.isArray(value) || value.length < 2) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isNonEmptyString((item as SiteTestimonial).quote) &&
      isNonEmptyString((item as SiteTestimonial).name) &&
      isNonEmptyString((item as SiteTestimonial).role),
  );
}

function isFaq(value: unknown): value is SiteFaq[] {
  if (!Array.isArray(value) || value.length < 2) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isNonEmptyString((item as SiteFaq).question) &&
      isNonEmptyString((item as SiteFaq).answer),
  );
}

/** Validate AI JSON before attaching theme/images */
export function parseWebsiteAiJson(raw: unknown): WebsiteAiJson {
  if (!raw || typeof raw !== "object") {
    throw new Error("INVALID_JSON_SHAPE");
  }

  const data = raw as Record<string, unknown>;

  const requiredStrings = [
    "title",
    "tagline",
    "trade",
    "location",
    "phone",
    "email",
    "hours",
    "cta",
    "heroHeadline",
    "heroSubheadline",
    "about",
    "ctaBanner",
    "contactBlurb",
  ] as const;

  for (const key of requiredStrings) {
    if (!isNonEmptyString(data[key])) {
      throw new Error(`INVALID_FIELD:${key}`);
    }
  }

  if (!isStringArray(data.services, 3)) {
    throw new Error("INVALID_FIELD:services");
  }
  if (!isStringArray(data.whyChooseUs, 3)) {
    throw new Error("INVALID_FIELD:whyChooseUs");
  }
  if (!isTestimonials(data.testimonials)) {
    throw new Error("INVALID_FIELD:testimonials");
  }
  if (!isFaq(data.faq)) {
    throw new Error("INVALID_FIELD:faq");
  }

  const services = data.services as string[];
  const whyChooseUs = data.whyChooseUs as string[];
  const testimonials = data.testimonials as SiteTestimonial[];
  const faq = data.faq as SiteFaq[];

  return {
    title: (data.title as string).trim(),
    tagline: (data.tagline as string).trim(),
    trade: (data.trade as string).trim(),
    location: (data.location as string).trim(),
    phone: (data.phone as string).trim(),
    email: (data.email as string).trim(),
    hours: (data.hours as string).trim(),
    cta: (data.cta as string).trim(),
    heroHeadline: (data.heroHeadline as string).trim(),
    heroSubheadline: (data.heroSubheadline as string).trim(),
    about: (data.about as string).trim(),
    services: services.map((s) => s.trim()),
    whyChooseUs: whyChooseUs.map((s) => s.trim()),
    testimonials: testimonials.map((t) => ({
      quote: t.quote.trim(),
      name: t.name.trim(),
      role: t.role.trim(),
    })),
    faq: faq.map((f) => ({
      question: f.question.trim(),
      answer: f.answer.trim(),
    })),
    ctaBanner: (data.ctaBanner as string).trim(),
    contactBlurb: (data.contactBlurb as string).trim(),
  };
}

export function aiJsonToGeneratedSite(
  ai: WebsiteAiJson,
  assets: Pick<GeneratedSite, "theme" | "images">,
): GeneratedSite {
  return {
    ...ai,
    theme: assets.theme,
    images: assets.images,
  };
}
