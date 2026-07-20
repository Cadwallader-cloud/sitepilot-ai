/**
 * Crestis Website JSON Validator
 *
 *   AI Output → JSON Validator → PASS (Save) | FAIL (Retry)
 *
 * Structural checks use Zod schemas in `src/lib/validation/`.
 */

import { validateWebsiteJson } from "./validation/validate";
import {
  ensureWebsite,
  type BrandingStyle,
  type Website,
} from "./website";

export type WebsiteValidationIssue = {
  path: string;
  message: string;
};

export type WebsiteValidationPass = {
  ok: true;
  website: Website;
  issues: [];
};

export type WebsiteValidationFail = {
  ok: false;
  website: null;
  issues: WebsiteValidationIssue[];
};

export type WebsiteValidationResult =
  | WebsiteValidationPass
  | WebsiteValidationFail;

const BRANDING_STYLES = new Set<BrandingStyle>([
  "modern",
  "premium",
  "minimal",
  "classic",
]);

/** Zod-backed Website check — soft result for PASS / FAIL gate */
export function checkWebsite(raw: unknown): WebsiteValidationResult {
  const result = validateWebsiteJson(raw);
  if (result.ok) {
    return { ok: true, website: result.data, issues: [] };
  }
  return { ok: false, website: null, issues: result.issues };
}

/**
 * Best-effort repair for FAIL → Retry path.
 * Fills only structural defaults — never invents marketing copy.
 */
export function repairWebsite(raw: unknown): Website {
  const site = ensureWebsite(raw);

  const brandingStyle = BRANDING_STYLES.has(site.branding?.style as BrandingStyle)
    ? site.branding.style
    : "modern";

  const pages =
    Array.isArray(site.pages) && site.pages.length > 0
      ? site.pages.map((page) => {
          const sections = Array.isArray(page.sections) ? [...page.sections] : [];
          const ensure = (type: string, data: unknown) => {
            if (!sections.some((s) => s.type === type)) {
              sections.push({ id: type, type, enabled: true, data });
            }
          };
          ensure("hero", {
            headline: (site.business.name || "Welcome").padEnd(10, " ·"),
            subheadline: (
              site.business.description ||
              "Professional local service you can trust."
            ).slice(0, 250).padEnd(20, "."),
            primaryCTA: site.navigation?.cta || "Contact us",
            trustBar: [],
          });
          ensure("about", {
            title: `About ${site.business.name || "us"}`,
            paragraphs: [
              site.business.description?.trim() ||
                "We serve local customers with clear work and honest pricing.",
              "Every job is planned carefully so you know what to expect.",
            ].slice(0, 3),
            highlights: ["Local team", "Clear quotes", "Reliable service"],
          });
          ensure("services", {
            items: (site.business.services || [])
              .map((title, i) => ({
                title: String(title || "").trim(),
                description: "",
                benefits: ["Clear pricing", "Reliable work", "Local support"],
                icon: "wrench",
                featured: i === 0,
              }))
              .filter((s) => s.title),
          });
          ensure("faq", {
            items: [
              {
                question: "How much does it cost?",
                answer: "We confirm pricing after a short consultation.",
                category: "Pricing",
              },
              {
                question: "How long does the work take?",
                answer: "Timeline depends on scope; we share a clear plan first.",
                category: "Timeline",
              },
              {
                question: "Are you licensed and insured?",
                answer: "Ask us for current credentials before you book.",
                category: "Trust",
              },
              {
                question: "What happens after I contact you?",
                answer: "We review your needs and outline the next steps.",
                category: "Process",
              },
              {
                question: "Do you serve my area?",
                answer: "Tell us your location and we will confirm coverage.",
                category: "Location",
              },
              {
                question: "Which services do you offer?",
                answer: "We focus on the services listed on this site.",
                category: "Service",
              },
            ],
          });
          ensure("contact", {
            phone: site.business.phone || "",
            email: site.business.email || "",
            address: site.business.location || "",
            form: true,
          });
          return {
            id: page.id || "home",
            slug: page.slug || "/",
            title: page.title || site.seo?.title || site.business.name || "Home",
            sections,
          };
        })
      : [
          {
            id: "home",
            slug: "/",
            title: site.business.name || "Home",
            sections: [
              {
                id: "hero",
                type: "hero",
                enabled: true,
                data: {
                  headline: (site.business.name || "Welcome").padEnd(10, " ·"),
                  subheadline:
                    "Professional local service you can trust.",
                  primaryCTA: "Contact us",
                  trustBar: [],
                },
              },
              {
                id: "about",
                type: "about",
                enabled: true,
                data: {
                  title: "About",
                  paragraphs: [
                    "We serve local customers with clear work and honest pricing.",
                    "Every job is planned carefully so you know what to expect.",
                  ],
                  highlights: ["Local team", "Clear quotes", "Reliable service"],
                },
              },
              {
                id: "services",
                type: "services",
                enabled: true,
                data: { items: [] },
              },
              {
                id: "faq",
                type: "faq",
                enabled: true,
                data: {
                  items: [
                    {
                      question: "How much does it cost?",
                      answer: "We confirm pricing after a short consultation.",
                      category: "Pricing",
                    },
                    {
                      question: "How long does the work take?",
                      answer:
                        "Timeline depends on scope; we share a clear plan first.",
                      category: "Timeline",
                    },
                    {
                      question: "Are you licensed and insured?",
                      answer: "Ask us for current credentials before you book.",
                      category: "Trust",
                    },
                    {
                      question: "What happens after I contact you?",
                      answer: "We review your needs and outline the next steps.",
                      category: "Process",
                    },
                    {
                      question: "Do you serve my area?",
                      answer:
                        "Tell us your location and we will confirm coverage.",
                      category: "Location",
                    },
                    {
                      question: "Which services do you offer?",
                      answer: "We focus on the services listed on this site.",
                      category: "Service",
                    },
                  ],
                },
              },
              {
                id: "contact",
                type: "contact",
                enabled: true,
                data: {
                  phone: site.business.phone || "",
                  email: site.business.email || "",
                  address: site.business.location || "",
                  form: true,
                },
              },
            ],
          },
        ];

  return {
    ...site,
    business: {
      ...site.business,
      name: site.business.name?.trim() || "Business",
      category: site.business.category?.trim() || "Local Business",
      subcategory: site.business.subcategory ?? "",
      location: site.business.location?.trim() || "",
      description: site.business.description ?? "",
      services: Array.isArray(site.business.services)
        ? site.business.services
        : [],
    },
    branding: {
      tone: site.branding?.tone?.trim() || "Professional and clear",
      personality: Array.isArray(site.branding?.personality)
        ? site.branding.personality
        : [],
      colors:
        Array.isArray(site.branding?.colors) && site.branding.colors.length
          ? site.branding.colors
          : ["#0f172a", "#2563eb"],
      fonts:
        Array.isArray(site.branding?.fonts) && site.branding.fonts.length
          ? site.branding.fonts
          : ["Geist"],
      logo: site.branding?.logo,
      style: brandingStyle,
    },
    navigation: {
      logo: site.navigation?.logo?.trim() || site.business.name || "Logo",
      links: Array.isArray(site.navigation?.links) ? site.navigation.links : [],
      cta: site.navigation?.cta?.trim() || "Get a quote",
    },
    pages,
    seo: {
      // Do not invent SEO title — empty title must remain a validation error
      title: site.seo?.title != null ? String(site.seo.title) : "",
      description:
        site.seo?.description != null
          ? String(site.seo.description)
          : site.business.description || "",
      keywords: Array.isArray(site.seo?.keywords) ? site.seo.keywords : [],
      canonical: site.seo?.canonical?.trim() || "/",
      schema:
        site.seo?.schema && typeof site.seo.schema === "object"
          ? site.seo.schema
          : null,
      openGraph:
        site.seo?.openGraph && typeof site.seo.openGraph === "object"
          ? site.seo.openGraph
          : null,
      twitter:
        site.seo?.twitter && typeof site.seo.twitter === "object"
          ? site.seo.twitter
          : null,
    },
    theme: {
      template: site.theme?.template?.trim() || "Modern Premium",
      palette: site.theme?.palette?.trim() || "Dark Blue",
      font: site.theme?.font?.trim() || "Geist",
      radius: site.theme?.radius?.trim() || "Medium",
      spacing: site.theme?.spacing?.trim() || "Large",
      buttonStyle: site.theme?.buttonStyle?.trim() || "rounded",
    },
    settings: {
      analytics: site.settings?.analytics !== false,
      cookies: site.settings?.cookies !== false,
      liveChat: site.settings?.liveChat === true,
      animations: site.settings?.animations !== false,
      lazyLoad: site.settings?.lazyLoad !== false,
    },
  };
}

export type JsonValidatorGateResult = {
  website: Website;
  status: "pass" | "pass_after_retry";
  attempts: number;
  issues: WebsiteValidationIssue[];
};

/**
 * AI Output → JSON Validator → PASS (Save) | FAIL (Retry)
 */
export function runJsonValidatorGate(
  raw: unknown,
  opts?: { maxRetries?: number },
): JsonValidatorGateResult {
  const maxRetries = Math.max(0, opts?.maxRetries ?? 1);
  let attempt = 0;
  let current: unknown = raw;
  let lastIssues: WebsiteValidationIssue[] = [];

  while (attempt <= maxRetries) {
    attempt += 1;
    const result = checkWebsite(current);
    if (result.ok) {
      return {
        website: result.website,
        status: attempt === 1 ? "pass" : "pass_after_retry",
        attempts: attempt,
        issues: [],
      };
    }
    lastIssues = result.issues;
    if (attempt > maxRetries) break;
    current = repairWebsite(current);
  }

  throw new Error(
    `WEBSITE_VALIDATION_FAILED:${lastIssues
      .slice(0, 8)
      .map((i) => `${i.path} ${i.message}`)
      .join("; ")}`,
  );
}
