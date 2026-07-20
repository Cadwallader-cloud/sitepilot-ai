/**
 * Crestis Industry Knowledge Packs v1
 * Professionally prepared niche bases — AI adapts, does not invent from zero.
 */

export type IndustryId =
  | "roofing"
  | "plumbing"
  | "electrician"
  | "dentist"
  | "restaurant"
  | "lawyer"
  | "cleaning"
  | "real_estate"
  | "gym"
  | "solar"
  | "general";

export type IndustryPack = {
  id: IndustryId;
  label: string;
  /** Keywords used by detectIndustry */
  aliases: string[];
  /** Template Library id preference */
  preferredTemplate: string;
  /** Fallback TradeKey for stock/demo images */
  imageTrade: string;
  siteStructure: {
    sections: string[];
    stickyCTA: boolean;
    floatingPhone: boolean;
  };
  ctas: {
    primary: string[];
    secondary: string[];
  };
  faqThemes: string[];
  seoVocab: {
    primaryTerms: string[];
    localModifiers: string[];
    avoid: string[];
  };
  textStyle: {
    voice: string;
    writingStyle: string;
    do: string[];
    dont: string[];
  };
  heroRules: {
    shellHint: "A" | "B" | "C";
    headlinePattern: string;
    mustInclude: string[];
    avoid: string[];
    wordCountIdeal: string;
  };
  imageGuidance: {
    heroSubjects: string[];
    gallerySubjects: string[];
    avoid: string[];
  };
  preferredWords: string[];
  sectionHints: {
    about: string;
    services: string;
    faq: string;
  };
};
