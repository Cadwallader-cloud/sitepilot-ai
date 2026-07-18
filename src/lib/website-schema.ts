import type { WebsiteContent } from "./site-types";

/** OpenAI Structured Outputs — exact Crestis content contract */
export const WEBSITE_JSON_SCHEMA = {
  name: "crestis_website",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "hero",
      "about",
      "services",
      "testimonials",
      "faq",
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
      testimonials: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "text"],
          properties: {
            name: { type: "string" },
            text: { type: "string" },
          },
        },
      },
      faq: {
        type: "array",
        minItems: 4,
        maxItems: 6,
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
      contact: {
        type: "object",
        additionalProperties: false,
        required: ["phone", "email", "address"],
        properties: {
          phone: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
        },
      },
      seo: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "keywords"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          keywords: {
            type: "array",
            minItems: 3,
            maxItems: 12,
            items: { type: "string" },
          },
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

export function parseWebsiteContent(raw: unknown): WebsiteContent {
  if (!raw || typeof raw !== "object") {
    throw new Error("INVALID_JSON_SHAPE");
  }

  const data = raw as Record<string, unknown>;
  const hero = obj(data.hero, "hero");
  const about = obj(data.about, "about");
  const contact = obj(data.contact, "contact");
  const seo = obj(data.seo, "seo");

  if (!Array.isArray(data.services) || data.services.length < 3) {
    throw new Error("INVALID_FIELD:services");
  }
  if (!Array.isArray(data.testimonials) || data.testimonials.length < 2) {
    throw new Error("INVALID_FIELD:testimonials");
  }
  if (!Array.isArray(data.faq) || data.faq.length < 4) {
    throw new Error("INVALID_FIELD:faq");
  }
  if (!Array.isArray(seo.keywords) || seo.keywords.length < 3) {
    throw new Error("INVALID_FIELD:seo.keywords");
  }

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
    services: data.services.map((item, i) => {
      const s = obj(item, `services[${i}]`);
      return {
        title: str(s.title, `services[${i}].title`),
        description: str(s.description, `services[${i}].description`),
      };
    }),
    testimonials: data.testimonials.map((item, i) => {
      const t = obj(item, `testimonials[${i}]`);
      return {
        name: str(t.name, `testimonials[${i}].name`),
        text: str(t.text, `testimonials[${i}].text`),
      };
    }),
    faq: data.faq.map((item, i) => {
      const f = obj(item, `faq[${i}]`);
      return {
        question: str(f.question, `faq[${i}].question`),
        answer: str(f.answer, `faq[${i}].answer`),
      };
    }),
    contact: {
      phone: str(contact.phone, "contact.phone"),
      email: str(contact.email, "contact.email"),
      address: str(contact.address, "contact.address"),
    },
    seo: {
      title: str(seo.title, "seo.title"),
      description: str(seo.description, "seo.description"),
      keywords: seo.keywords.map((item, i) =>
        str(item, `seo.keywords[${i}]`),
      ),
    },
  };
}
