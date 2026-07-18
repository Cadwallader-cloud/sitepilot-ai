export type SiteSection = {
  id: string;
  title: string;
  body: string;
  items?: string[];
};

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

export type GeneratedSite = {
  title: string;
  tagline: string;
  sections: SiteSection[];
  cta: string;
  trade?: string;
  location?: string;
  phone?: string;
  email?: string;
  hours?: string;
  about?: string;
  services?: string[];
  highlights?: string[];
  testimonials?: SiteTestimonial[];
  theme?: SiteTheme;
};

export type GenerateSource = "ai" | "mock";

export type GenerateResult = {
  site: GeneratedSite;
  source: GenerateSource;
};
