import { normalizeSeoAiPackage } from "../seo-package";
import type { SeoPlan } from "./seo-planner";
import type { ContentDraft, SeoDraft, WebsitePlan } from "./types";

export type FinalizeSeoInputs = {
  businessName: string;
  city: string;
  niche: string;
  heroSubheadline: string;
  aboutText: string;
  phone: string;
  email: string;
  address: string;
  serviceTitles: string[];
};

function clampMetaDescription(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  if (t.length <= 160) return t;
  return t.slice(0, 160).trim();
}

function applyTitlePattern(
  pattern: string,
  vars: { primary: string; city: string; brand: string },
): string {
  const title = pattern
    .replace(/\{Primary\}/gi, vars.primary)
    .replace(/\{City\}/gi, vars.city)
    .replace(/\{Brand\}/gi, vars.brand)
    .trim();
  if (title.length >= 45) return title.slice(0, 60).trim();
  return `${vars.primary} in ${vars.city} | ${vars.brand}`.slice(0, 60).trim();
}

function metaDescriptionFromPlan(
  plan: SeoPlan,
  content: ContentDraft,
  inputs: FinalizeSeoInputs,
): string {
  const hero = content.hero.subheadline?.trim();
  const about = content.about.text?.trim();
  let description =
    hero ||
    about?.slice(0, 160) ||
    `${inputs.businessName} offers ${plan.primaryKeyword} in ${inputs.city}. Contact us today.`;

  const cityNeedle = inputs.city.toLowerCase();
  if (
    plan.localSeoAngle &&
    cityNeedle &&
    !description.toLowerCase().includes(cityNeedle.split(" ")[0] ?? cityNeedle)
  ) {
    description = `${description} Serving ${inputs.city}.`.trim();
  }

  return clampMetaDescription(description);
}

const LINK_LABELS: Record<string, string> = {
  hero: "Home",
  services: "Services",
  about: "About",
  faq: "FAQ",
  contact: "Contact",
  testimonials: "Testimonials",
  why_us: "Why Us",
  trust: "Trust",
  projects: "Projects",
  gallery: "Gallery",
  menu: "Menu",
};

/**
 * Apply planner SEO strategy + finished content — no LLM (Sprint D.1 dedupe).
 */
export function finalizeSeoFromPlan(
  plan: SeoPlan,
  inputs: FinalizeSeoInputs,
  content: ContentDraft,
  websitePlan?: WebsitePlan,
): SeoDraft {
  const title = applyTitlePattern(plan.titlePattern, {
    primary: plan.primaryKeyword,
    city: inputs.city,
    brand: inputs.businessName,
  });

  const description = metaDescriptionFromPlan(plan, content, inputs);

  const keywords = [
    plan.primaryKeyword,
    ...plan.secondaryKeywords,
    ...plan.entities,
    ...inputs.serviceTitles.slice(0, 4).map((s) => `${s} ${inputs.city}`),
  ].filter(Boolean);

  const internalLinks = plan.internalLinkTargets.map((target) => ({
    anchor: LINK_LABELS[target] ?? target.replace(/_/g, " "),
    href: `#${target}`,
  }));

  return normalizeSeoAiPackage(
    {
      title,
      metaDescription: description,
      keywords,
      entities: plan.entities,
      slug: plan.slug,
      canonical: plan.slug,
      schema: {
        "@type": plan.schemaType,
        name: inputs.businessName,
        description,
        telephone: inputs.phone,
        email: inputs.email,
        areaServed: inputs.city,
        address: {
          "@type": "PostalAddress",
          addressLocality: inputs.city,
        },
      },
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        title,
        description,
      },
      internalLinks,
    },
    inputs,
  );
}

export function canFinalizeSeoFromPlan(plan: SeoPlan | undefined): plan is SeoPlan {
  return Boolean(plan?.primaryKeyword?.trim());
}
