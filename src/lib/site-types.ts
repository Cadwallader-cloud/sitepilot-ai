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

export type GeneratedSite = {
  title: string;
  tagline: string;
  sections: SiteSection[];
  cta: string;
  trade?: string;
  location?: string;
  phone?: string;
  theme?: SiteTheme;
};

export type GenerateSource = "ai" | "mock";

export type GenerateResult = {
  site: GeneratedSite;
  source: GenerateSource;
};
