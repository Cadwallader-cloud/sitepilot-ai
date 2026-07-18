export type SiteTheme = {
  primary: string;
  accent: string;
  style: "bold" | "clean" | "professional";
};

export type SiteImages = {
  hero: string;
  gallery: string[];
};

/** STRICT content schema from OpenAI — design-agnostic */
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
  testimonials: {
    name: string;
    text: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
};

/** Renderer model = AI content + businessName + design assets */
export type GeneratedSite = WebsiteContent & {
  businessName: string;
  theme: SiteTheme;
  images: SiteImages;
};

export type GenerateSource = "ai";

export type GenerateResult = {
  site: GeneratedSite;
  source: GenerateSource;
};

export function getBusinessName(site: GeneratedSite): string {
  return site.businessName || site.seo.title || site.hero.title || "Your Business";
}
