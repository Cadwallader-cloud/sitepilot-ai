/**
 * Validation-safe fallbacks when section retries exhaust attempts.
 * Keeps the pipeline running with usable copy.
 */

import type { AboutInput } from "../../validation/about";
import type { FaqSectionInput } from "../../validation/faq";
import type { HeroInput } from "../../validation/hero";
import type { SeoInput } from "../../validation/seo";
import type { ServicesSectionInput } from "../../validation/services";

type BusinessHints = {
  businessName: string;
  category: string;
  location: string;
  services: string;
  description?: string;
};

export function heroInputFallback(
  hints: BusinessHints,
  raw?: Partial<HeroInput>,
): HeroInput {
  const name = hints.businessName.trim() || "Your Business";
  const loc = hints.location.trim() || "your area";
  const cat = hints.category.trim() || "local services";

  const headline =
    raw?.headline && raw.headline.length >= 10
      ? raw.headline.slice(0, 80)
      : `${name} — trusted ${cat.toLowerCase()} in ${loc}`.slice(0, 80);

  const subheadline =
    raw?.subheadline && raw.subheadline.length >= 20
      ? raw.subheadline.slice(0, 250)
      : `Professional ${cat.toLowerCase()} for ${loc}. Clear pricing, reliable work, and fast response when you need help.`.slice(
          0,
          250,
        );

  return {
    headline,
    subheadline,
    primaryCTA: raw?.primaryCTA?.trim() || "Get a Free Quote",
    secondaryCTA: raw?.secondaryCTA,
    trustBar: Array.isArray(raw?.trustBar) ? raw.trustBar.slice(0, 5) : [],
  };
}

export function aboutInputFallback(
  hints: BusinessHints,
  raw?: Partial<AboutInput>,
): AboutInput {
  const name = hints.businessName.trim() || "Our team";
  const loc = hints.location.trim() || "the local area";
  const desc =
    hints.description?.trim() ||
    `We help homeowners and businesses in ${loc} with dependable service.`;

  const paragraphs =
    Array.isArray(raw?.paragraphs) && raw.paragraphs.length >= 2
      ? raw.paragraphs.slice(0, 3)
      : [
          `${name} has built a reputation in ${loc} by showing up on time and doing the job right.`,
          desc,
        ];

  const highlights =
    Array.isArray(raw?.highlights) && raw.highlights.length === 3
      ? raw.highlights
      : ["Licensed & insured", "Local team", "Free estimates"];

  return {
    title: raw?.title?.trim() || `About ${name}`,
    paragraphs,
    highlights,
  };
}

export function servicesInputFallback(
  hints: BusinessHints,
  raw?: Partial<ServicesSectionInput>,
): ServicesSectionInput {
  if (Array.isArray(raw?.items) && raw.items.length > 0) {
    return { items: raw.items };
  }

  const names = hints.services
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const items =
    names.length > 0
      ? names.map((title, i) => ({
          title,
          description: `Professional ${title.toLowerCase()} for ${hints.location.trim() || "your area"}.`,
          benefits: ["Clear pricing", "Reliable work", "Local support"],
          icon: "wrench",
          featured: i === 0,
        }))
      : [
          {
            title: hints.category.trim() || "Core Service",
            description: `Trusted ${(hints.category || "service").toLowerCase()} with upfront pricing.`,
            benefits: ["Clear pricing", "Reliable work", "Local support"],
            icon: "wrench",
            featured: true,
          },
        ];

  return { items };
}

export function faqInputFallback(hints: BusinessHints): FaqSectionInput {
  const name = hints.businessName.trim() || "your provider";
  const loc = hints.location.trim() || "your area";
  const cat = hints.category.trim() || "services";

  const templates = [
    {
      question: `What areas do you serve near ${loc}?`,
      answer: `${name} serves ${loc} and nearby neighborhoods. Contact us to confirm availability for your address.`,
      category: "Service area",
    },
    {
      question: "How quickly can you schedule a visit?",
      answer:
        "Most projects can be scheduled within a few business days. Emergency requests are prioritized when possible.",
      category: "Scheduling",
    },
    {
      question: "Do you offer free estimates?",
      answer:
        "Yes. We provide free estimates after learning about your project scope and timeline.",
      category: "Pricing",
    },
    {
      question: `Are you licensed and insured for ${cat.toLowerCase()}?`,
      answer:
        "Yes. We carry appropriate licensing and insurance for the work we perform.",
      category: "Trust",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept common payment methods including cards and bank transfer. Details are confirmed on your estimate.",
      category: "Billing",
    },
    {
      question: "How do I get started?",
      answer: `Call or email ${name} with your project details. We will confirm next steps and schedule a visit if needed.`,
      category: "Getting started",
    },
  ];

  return { items: templates };
}

export function seoInputFallback(
  hints: BusinessHints,
  raw?: Partial<SeoInput>,
): SeoInput {
  const name = hints.businessName.trim() || "Local Business";
  const loc = hints.location.trim() || "";
  const cat = hints.category.trim() || "Services";

  const title =
    raw?.title?.trim() ||
    `${name}${loc ? ` | ${cat} in ${loc}` : ` | ${cat}`}`.slice(0, 60);

  const description =
    raw?.description?.trim() ||
    `${name} provides ${cat.toLowerCase()}${loc ? ` in ${loc}` : ""}. Request a free estimate today.`.slice(
      0,
      160,
    );

  return {
    title,
    description,
    keywords: Array.isArray(raw?.keywords) ? raw.keywords : [cat, loc, name].filter(Boolean),
    canonical: raw?.canonical || "/",
  };
}
