import type { WebsiteContent } from "./site-types";

/**
 * OpenAI Structured Outputs schema — content only, no design.
 * Change the React template freely without changing this contract.
 */
export const WEBSITE_JSON_SCHEMA = {
  name: "crestis_website_content",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "hero",
      "about",
      "services",
      "whyChooseUs",
      "testimonials",
      "faq",
      "cta",
      "contact",
      "seo",
    ],
    properties: {
      hero: {
        type: "object",
        additionalProperties: false,
        required: ["title", "subtitle", "cta"],
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          cta: { type: "string" },
        },
      },
      about: {
        type: "object",
        additionalProperties: false,
        required: ["title", "text"],
        properties: {
          title: { type: "string" },
          text: { type: "string" },
        },
      },
      services: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
      },
      whyChooseUs: {
        type: "object",
        additionalProperties: false,
        required: ["title", "items"],
        properties: {
          title: { type: "string" },
          items: {
            type: "array",
            minItems: 3,
            maxItems: 6,
            items: { type: "string" },
          },
        },
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
      cta: {
        type: "object",
        additionalProperties: false,
        required: ["title", "text", "button"],
        properties: {
          title: { type: "string" },
          text: { type: "string" },
          button: { type: "string" },
        },
      },
      contact: {
        type: "object",
        additionalProperties: false,
        required: [
          "businessName",
          "trade",
          "phone",
          "email",
          "location",
          "hours",
          "blurb",
        ],
        properties: {
          businessName: { type: "string" },
          trade: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          location: { type: "string" },
          hours: { type: "string" },
          blurb: { type: "string" },
        },
      },
      seo: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
} as const;

function str(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`INVALID_FIELD:${field}`);
  }
  return value.trim();
}

function obj(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`INVALID_FIELD:${field}`);
  }
  return value as Record<string, unknown>;
}

/** Validate AI JSON into design-agnostic WebsiteContent */
export function parseWebsiteContent(raw: unknown): WebsiteContent {
  if (!raw || typeof raw !== "object") {
    throw new Error("INVALID_JSON_SHAPE");
  }

  const data = raw as Record<string, unknown>;
  const hero = obj(data.hero, "hero");
  const about = obj(data.about, "about");
  const why = obj(data.whyChooseUs, "whyChooseUs");
  const cta = obj(data.cta, "cta");
  const contact = obj(data.contact, "contact");
  const seo = obj(data.seo, "seo");

  if (!Array.isArray(data.services) || data.services.length < 3) {
    throw new Error("INVALID_FIELD:services");
  }
  if (!Array.isArray(data.testimonials) || data.testimonials.length < 2) {
    throw new Error("INVALID_FIELD:testimonials");
  }
  if (!Array.isArray(data.faq) || data.faq.length < 2) {
    throw new Error("INVALID_FIELD:faq");
  }
  if (!Array.isArray(why.items) || why.items.length < 3) {
    throw new Error("INVALID_FIELD:whyChooseUs.items");
  }

  const services = data.services.map((item, index) => {
    const s = obj(item, `services[${index}]`);
    return {
      title: str(s.title, `services[${index}].title`),
      description: str(s.description, `services[${index}].description`),
    };
  });

  const testimonials = data.testimonials.map((item, index) => {
    const t = obj(item, `testimonials[${index}]`);
    return {
      quote: str(t.quote, `testimonials[${index}].quote`),
      name: str(t.name, `testimonials[${index}].name`),
      role: str(t.role, `testimonials[${index}].role`),
    };
  });

  const faq = data.faq.map((item, index) => {
    const f = obj(item, `faq[${index}]`);
    return {
      question: str(f.question, `faq[${index}].question`),
      answer: str(f.answer, `faq[${index}].answer`),
    };
  });

  return {
    hero: {
      title: str(hero.title, "hero.title"),
      subtitle: str(hero.subtitle, "hero.subtitle"),
      cta: str(hero.cta, "hero.cta"),
    },
    about: {
      title: str(about.title, "about.title"),
      text: str(about.text, "about.text"),
    },
    services,
    whyChooseUs: {
      title: str(why.title, "whyChooseUs.title"),
      items: why.items.map((item, i) =>
        str(item, `whyChooseUs.items[${i}]`),
      ),
    },
    testimonials,
    faq,
    cta: {
      title: str(cta.title, "cta.title"),
      text: str(cta.text, "cta.text"),
      button: str(cta.button, "cta.button"),
    },
    contact: {
      businessName: str(contact.businessName, "contact.businessName"),
      trade: str(contact.trade, "contact.trade"),
      phone: str(contact.phone, "contact.phone"),
      email: str(contact.email, "contact.email"),
      location: str(contact.location, "contact.location"),
      hours: str(contact.hours, "contact.hours"),
      blurb: str(contact.blurb, "contact.blurb"),
    },
    seo: {
      title: str(seo.title, "seo.title"),
      description: str(seo.description, "seo.description"),
    },
  };
}
