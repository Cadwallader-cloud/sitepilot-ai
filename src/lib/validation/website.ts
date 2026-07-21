import { z } from "zod";
import {
  ABOUT_TEMPLATE_IDS,
  FAQ_TEMPLATE_IDS,
  FOOTER_TEMPLATE_IDS,
  HERO_TEMPLATE_IDS,
  NAVBAR_TEMPLATE_IDS,
  SERVICES_TEMPLATE_IDS,
  normalizeTemplateBlocks,
} from "@/lib/template-engine";
import { AboutSchema } from "./about";
import { FAQSectionSchema } from "./faq";
import { HeroSchema } from "./hero";
import { SeoBlockSchema } from "./seo";
import { ServicesSectionSchema } from "./services";

export const metadataSchema = z.object({
  id: z.string().min(1),
  projectId: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  version: z.number().int().min(1),
  language: z.string().min(1),
  status: z.enum(["draft", "published"]),
});

export const businessSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string(),
  location: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  description: z.string(),
  services: z.array(z.string()),
  dna: z.unknown().optional(),
  personality: z.unknown().optional(),
  competitors: z.unknown().optional(),
});

export const brandingSchema = z.object({
  tone: z.string().min(1),
  personality: z.array(z.string()),
  colors: z.array(z.string()).min(1),
  fonts: z.array(z.string()).min(1),
  logo: z.string().optional(),
  style: z.enum(["modern", "premium", "minimal", "classic"]),
});

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const navigationSchema = z.object({
  logo: z.string().min(1),
  links: z.array(navItemSchema),
  cta: z.string().min(1),
});

export const contactSchema = z.object({
  phone: z.string(),
  email: z.string(),
  address: z.string().optional(),
  hours: z.array(z.string()).optional(),
  map: z.string().optional(),
  form: z.boolean(),
});

export const templateBlocksSchema = z.object({
  hero: z.enum(HERO_TEMPLATE_IDS),
  navbar: z.enum(NAVBAR_TEMPLATE_IDS),
  services: z.enum(SERVICES_TEMPLATE_IDS),
  faq: z.enum(FAQ_TEMPLATE_IDS),
  about: z.enum(ABOUT_TEMPLATE_IDS),
  footer: z.enum(FOOTER_TEMPLATE_IDS),
});

export const themeSchema = z
  .object({
    template: z.string().min(1),
    palette: z.string().min(1),
    font: z.string().min(1),
    radius: z.string().min(1),
    spacing: z.string().min(1),
    buttonStyle: z.string().min(1),
    blocks: templateBlocksSchema.optional(),
  })
  .transform((theme) => ({
    ...theme,
    blocks: normalizeTemplateBlocks(theme.blocks),
  }));

export const settingsSchema = z.object({
  analytics: z.boolean(),
  cookies: z.boolean(),
  liveChat: z.boolean(),
  animations: z.boolean(),
  lazyLoad: z.boolean(),
});

/**
 * Section.data stays loosely typed for now (acceptance: temporary any).
 * Typed section payloads are validated when type is known.
 */
export const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  enabled: z.boolean(),
  data: z.unknown(),
});

export const pageSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
});

export const crestisRuntimeSchema = z
  .object({
    stickyCTA: z.boolean().optional(),
    floatingPhone: z.boolean().optional(),
    pageType: z.string().optional(),
    template: z.string().optional(),
    variant: z.enum(["A", "B", "C"]).optional(),
    style: z.string().optional(),
    engine: z.enum(["simple", "deep"]).optional(),
    images: z
      .object({
        hero: z.string(),
        gallery: z.array(z.string()),
      })
      .optional(),
    layout: z.unknown().optional(),
    seoMemory: z.unknown().optional(),
    quality: z.unknown().optional(),
    cro: z.unknown().optional(),
    qa: z.unknown().optional(),
    human: z.unknown().optional(),
    scores: z.unknown().optional(),
  })
  .optional();

/** Full Website Schema v2 — single source of truth for Zod validation */
export const WebsiteSchema = z
  .object({
    metadata: metadataSchema,
    business: businessSchema,
    branding: brandingSchema,
    navigation: navigationSchema,
    pages: z.array(pageSchema).min(1),
    seo: SeoBlockSchema,
    theme: themeSchema,
    settings: settingsSchema,
    crestis: crestisRuntimeSchema,
  })
  .superRefine((site, ctx) => {
    const home =
      site.pages.find((p) => p.id === "home" || p.slug === "/") ?? site.pages[0];
    if (!home) {
      ctx.addIssue({
        code: "custom",
        path: ["pages"],
        message: "missing home page",
      });
      return;
    }

    const byType = new Map(home.sections.map((s) => [s.type, s]));
    const required = ["hero", "about", "services", "faq", "contact"] as const;

    for (const type of required) {
      if (!byType.has(type)) {
        ctx.addIssue({
          code: "custom",
          path: ["pages", 0, "sections"],
          message: `missing required section "${type}"`,
        });
      }
    }

    const hero = byType.get("hero");
    if (hero) {
      const parsed = HeroSchema.safeParse(hero.data);
      if (!parsed.success) {
        for (const err of parsed.error.issues) {
          ctx.addIssue({
            code: "custom",
            path: ["pages", 0, "sections", "hero", "data", ...err.path],
            message: err.message,
          });
        }
      }
    }

    const about = byType.get("about");
    if (about) {
      const parsed = AboutSchema.safeParse(about.data);
      if (!parsed.success) {
        for (const err of parsed.error.issues) {
          ctx.addIssue({
            code: "custom",
            path: ["pages", 0, "sections", "about", "data", ...err.path],
            message: err.message,
          });
        }
      }
    }

    const services = byType.get("services");
    if (services) {
      const parsed = ServicesSectionSchema.safeParse(services.data);
      if (!parsed.success) {
        for (const err of parsed.error.issues) {
          ctx.addIssue({
            code: "custom",
            path: ["pages", 0, "sections", "services", "data", ...err.path],
            message: err.message,
          });
        }
      }
    }

    const faq = byType.get("faq");
    if (faq) {
      const parsed = FAQSectionSchema.safeParse(faq.data);
      if (!parsed.success) {
        for (const err of parsed.error.issues) {
          ctx.addIssue({
            code: "custom",
            path: ["pages", 0, "sections", "faq", "data", ...err.path],
            message: err.message,
          });
        }
      }
    }

    const contact = byType.get("contact");
    if (contact) {
      const parsed = contactSchema.safeParse(contact.data);
      if (!parsed.success) {
        for (const err of parsed.error.issues) {
          ctx.addIssue({
            code: "custom",
            path: ["pages", 0, "sections", "contact", "data", ...err.path],
            message: err.message,
          });
        }
      }
    }
  });

export type WebsiteInput = z.infer<typeof WebsiteSchema>;

/** @deprecated Use WebsiteSchema */
export const websiteSchema = WebsiteSchema;
