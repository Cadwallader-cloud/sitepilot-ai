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
        required: ["headline", "subheadline", "primaryCTA", "secondaryCTA"],
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          primaryCTA: { type: "string" },
          secondaryCTA: { type: "string" },
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
          required: ["name", "text", "demo"],
          properties: {
            name: { type: "string" },
            text: { type: "string" },
            demo: { type: "boolean" },
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
          ogTitle: { type: "string" },
          ogDescription: { type: "string" },
          localSeoPhrase: { type: "string" },
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
  // Testimonials optional — live sites may omit until real reviews exist
  if (data.testimonials != null && !Array.isArray(data.testimonials)) {
    throw new Error("INVALID_FIELD:testimonials");
  }
  if (!Array.isArray(data.faq) || data.faq.length < 4) {
    throw new Error("INVALID_FIELD:faq");
  }
  if (!Array.isArray(seo.keywords) || seo.keywords.length < 3) {
    throw new Error("INVALID_FIELD:seo.keywords");
  }

  const headline =
    (typeof hero.headline === "string" && hero.headline.trim()) ||
    (typeof hero.title === "string" && hero.title.trim()) ||
    "";
  const subheadline =
    (typeof hero.subheadline === "string" && hero.subheadline.trim()) ||
    (typeof hero.subtitle === "string" && hero.subtitle.trim()) ||
    "";
  const primaryCTA =
    (typeof hero.primaryCTA === "string" && hero.primaryCTA.trim()) ||
    (typeof hero.cta === "string" && hero.cta.trim()) ||
    "";
  const secondaryCTA =
    (typeof hero.secondaryCTA === "string" && hero.secondaryCTA.trim()) ||
    "";
  const trustBar = Array.isArray(hero.trustBar)
    ? hero.trustBar
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter(Boolean)
        .slice(0, 5)
    : [];

  if (!headline) throw new Error("INVALID_FIELD:hero.headline");
  if (!subheadline) throw new Error("INVALID_FIELD:hero.subheadline");
  if (!primaryCTA) throw new Error("INVALID_FIELD:hero.primaryCTA");

  return {
    hero: {
      headline,
      subheadline,
      primaryCTA,
      secondaryCTA:
        secondaryCTA ||
        (typeof contact.phone === "string" && contact.phone.trim()
          ? `Call ${contact.phone.trim()}`
          : "Get in touch"),
      ...(trustBar.length ? { trustBar } : {}),
    },
    about: {
      title: str(about.title, "about.title"),
      text: (() => {
        const paragraphs = Array.isArray(about.paragraphs)
          ? about.paragraphs
              .map((p) => (typeof p === "string" ? p.trim() : ""))
              .filter(Boolean)
          : [];
        if (paragraphs.length >= 1) return paragraphs.join("\n\n");
        return str(about.text, "about.text");
      })(),
      ...(Array.isArray(about.paragraphs)
        ? {
            paragraphs: about.paragraphs
              .map((p) => (typeof p === "string" ? p.trim() : ""))
              .filter(Boolean)
              .slice(0, 3),
          }
        : {}),
      ...(Array.isArray(about.highlights)
        ? {
            highlights: about.highlights
              .map((h) => (typeof h === "string" ? h.trim() : ""))
              .filter(Boolean)
              .slice(0, 3),
          }
        : {}),
    },
    services: data.services.map((item, i) => {
      const s = obj(item, `services[${i}]`);
      const benefits = Array.isArray(s.benefits)
        ? s.benefits
            .map((b) => (typeof b === "string" ? b.trim() : ""))
            .filter(Boolean)
            .slice(0, 3)
        : undefined;
      const rawDescription =
        typeof s.shortDescription === "string" && s.shortDescription.trim()
          ? s.shortDescription
          : s.description;
      const description = str(rawDescription, `services[${i}].description`);
      const icon =
        typeof s.icon === "string" && s.icon.trim()
          ? s.icon.trim().toLowerCase()
          : undefined;
      return {
        title: str(s.title, `services[${i}].title`),
        description,
        ...(benefits && benefits.length ? { benefits } : {}),
        ...(icon ? { icon } : {}),
        ...(s.featured === true ? { featured: true } : {}),
        ...(s.priority === "featured" ||
        s.priority === "secondary" ||
        s.priority === "optional"
          ? { priority: s.priority }
          : {}),
      };
    }),
    testimonials: (Array.isArray(data.testimonials) ? data.testimonials : []).map(
      (item, i) => {
        const t = obj(item, `testimonials[${i}]`);
        if (typeof t.demo !== "boolean") {
          throw new Error(`INVALID_FIELD:testimonials[${i}].demo`);
        }
        return {
          name: str(t.name, `testimonials[${i}].name`),
          text: str(t.text, `testimonials[${i}].text`),
          // AI examples must be demo:true; only explicit false = real review
          demo: t.demo === false ? false : true,
        };
      },
    ),
    faq: data.faq.map((item, i) => {
      const f = obj(item, `faq[${i}]`);
      const category =
        typeof f.category === "string" && f.category.trim()
          ? f.category.trim()
          : undefined;
      return {
        question: str(f.question, `faq[${i}].question`),
        answer: str(f.answer, `faq[${i}].answer`),
        ...(category ? { category } : {}),
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
      ogTitle:
        typeof seo.ogTitle === "string" && seo.ogTitle.trim()
          ? seo.ogTitle.trim()
          : undefined,
      ogDescription:
        typeof seo.ogDescription === "string" && seo.ogDescription.trim()
          ? seo.ogDescription.trim()
          : undefined,
      localSeoPhrase:
        typeof seo.localSeoPhrase === "string" && seo.localSeoPhrase.trim()
          ? seo.localSeoPhrase.trim()
          : undefined,
      slug:
        typeof seo.slug === "string" && seo.slug.trim()
          ? seo.slug.trim()
          : undefined,
      canonical:
        typeof seo.canonical === "string" && seo.canonical.trim()
          ? seo.canonical.trim()
          : undefined,
      entities: Array.isArray(seo.entities)
        ? seo.entities
            .map((e) => (typeof e === "string" ? e.trim() : ""))
            .filter(Boolean)
            .slice(0, 16)
        : undefined,
      seoScore:
        typeof seo.seoScore === "number" && Number.isFinite(seo.seoScore)
          ? Math.min(100, Math.max(0, Math.round(seo.seoScore)))
          : undefined,
      openGraph:
        seo.openGraph && typeof seo.openGraph === "object"
          ? (seo.openGraph as WebsiteContent["seo"]["openGraph"])
          : undefined,
      twitter:
        seo.twitter && typeof seo.twitter === "object"
          ? (seo.twitter as WebsiteContent["seo"]["twitter"])
          : undefined,
      imageSeo:
        seo.imageSeo && typeof seo.imageSeo === "object"
          ? (seo.imageSeo as WebsiteContent["seo"]["imageSeo"])
          : undefined,
    },
  };
}
