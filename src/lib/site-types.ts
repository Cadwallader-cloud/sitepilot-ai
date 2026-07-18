export type SiteTheme = {
  primary: string;
  accent: string;
  style: "bold" | "clean" | "professional";
};

export type SiteTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export type SiteFaq = {
  question: string;
  answer: string;
};

export type SiteImages = {
  hero: string;
  gallery: string[];
};

/** Structured website JSON produced by AI + image picker */
export type GeneratedSite = {
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
  theme: SiteTheme;
  images: SiteImages;
  /** @deprecated kept for older mock generators */
  sections?: { id: string; title: string; body: string; items?: string[] }[];
};

export type GenerateSource = "ai" | "mock";

export type GenerateResult = {
  site: GeneratedSite;
  source: GenerateSource;
};
