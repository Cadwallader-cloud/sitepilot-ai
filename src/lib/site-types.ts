export type SiteTheme = {
  primary: string;
  accent: string;
  style: "bold" | "clean" | "professional";
};

export type SiteImages = {
  hero: string;
  gallery: string[];
};

/** Pure content from AI — design-agnostic (no colors, no image URLs) */
export type WebsiteContent = {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  about: {
    title: string;
    text: string;
  };
  services: {
    title: string;
    description: string;
  }[];
  whyChooseUs: {
    title: string;
    items: string[];
  };
  testimonials: {
    quote: string;
    name: string;
    role: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  cta: {
    title: string;
    text: string;
    button: string;
  };
  contact: {
    businessName: string;
    trade: string;
    phone: string;
    email: string;
    location: string;
    hours: string;
    blurb: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

/**
 * Final site object for the renderer:
 * AI content + design assets (theme/images) attached by our code
 */
export type GeneratedSite = WebsiteContent & {
  theme: SiteTheme;
  images: SiteImages;
};

export type GenerateSource = "ai" | "mock";

export type GenerateResult = {
  site: GeneratedSite;
  source: GenerateSource;
};

export function getBusinessName(site: GeneratedSite): string {
  return site.contact.businessName || site.hero.title || "Your Business";
}
