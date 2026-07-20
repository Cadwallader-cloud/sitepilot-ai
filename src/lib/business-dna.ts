/**
 * Crestis AI Engine — Brand Profile (Business Analyzer v1)
 * Built before any website copy is written.
 */

export type BusinessDna = {
  industry: string;
  subcategory: string;
  /** Primary audiences (max 3) */
  targetAudience: string[];
  customerIntent: string;
  brandPosition: string;
  /** Exactly 5 traits preferred */
  brandPersonality: string[];
  tone: string;
  primaryGoal: string;
  secondaryGoal: string;
  trustSignals: string[];
  conversionStrategy: string;
  /** Primary CTA phrase (first of ctaOptions) */
  cta: string;
  /** Up to 3 recommended CTA labels */
  ctaOptions: string[];
  websiteStyle: string;
  colorDirection: string;
  imageDirection: string;
  /** Ordered section labels from analyzer */
  sections: string[];
  seoIntent: string;
  keywords: string[];
  localSeo: string[];
  advantages: string[];
};

export function isBusinessDna(value: unknown): value is BusinessDna {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.industry === "string" &&
    typeof v.subcategory === "string" &&
    Array.isArray(v.targetAudience) &&
    typeof v.brandPosition === "string" &&
    Array.isArray(v.brandPersonality) &&
    typeof v.tone === "string" &&
    typeof v.primaryGoal === "string" &&
    typeof v.secondaryGoal === "string" &&
    Array.isArray(v.trustSignals) &&
    typeof v.cta === "string"
  );
}

/** Map free-form DNA tone/position → Crestis design tone enum */
export function dnaToDesignTone(
  dna: BusinessDna,
): "bold" | "clean" | "professional" | "warm" | "premium" {
  const blob = `${dna.tone} ${dna.brandPosition} ${dna.websiteStyle}`.toLowerCase();
  if (blob.includes("premium") || blob.includes("luxury")) return "premium";
  if (blob.includes("bold") || blob.includes("confident")) return "bold";
  if (blob.includes("warm") || blob.includes("friendly")) return "warm";
  if (blob.includes("clean") || blob.includes("minimal")) return "clean";
  return "professional";
}

function asStringList(value: unknown, max = 20): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

function firstString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (Array.isArray(v) && v.length) {
      const s = String(v[0] ?? "").trim();
      if (s) return s;
    }
  }
  return "";
}

/**
 * Normalize Analyzer v1 Brand Profile JSON (and legacy DNA shapes).
 * Accepts both `audience` and `targetAudience`; `cta` as string or string[].
 */
export function normalizeBusinessDna(
  raw: Partial<BusinessDna> | Record<string, unknown>,
  fallback: {
    industry: string;
    location: string;
    services: string;
  },
): BusinessDna {
  const row = raw as Record<string, unknown>;

  const audience = asStringList(
    row.audience ?? row.targetAudience,
    3,
  );
  const personality = asStringList(row.brandPersonality, 5);
  const trust = asStringList(row.trustSignals, 8);
  const ctaOptions = asStringList(row.cta, 3);
  // Legacy: cta was a single string
  if (!ctaOptions.length && typeof row.cta === "string" && row.cta.trim()) {
    ctaOptions.push(row.cta.trim());
  }
  const keywords = asStringList(row.keywords, 15);
  const localSeo = asStringList(row.localSeo, 12);
  const advantages = asStringList(row.advantages, 8);
  const sections = asStringList(row.sections, 12);

  const serviceHint = fallback.services
    .split(/[,;•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)[0];

  const primaryCta =
    firstString(ctaOptions[0], row.cta) || "Request a Quote";

  return {
    industry: String(row.industry ?? "").trim() || fallback.industry,
    subcategory:
      String(row.subcategory ?? "").trim() ||
      serviceHint ||
      fallback.industry,
    targetAudience: audience.length
      ? audience
      : ["Local customers", `People in ${fallback.location}`].slice(0, 3),
    customerIntent:
      String(row.customerIntent ?? "").trim() || "Get Quote",
    brandPosition:
      String(row.brandPosition ?? "").trim() || "Standard",
    brandPersonality: personality.length
      ? personality
      : ["Reliable", "Professional", "Local", "Honest", "Approachable"],
    tone: String(row.tone ?? "").trim() || "Professional",
    primaryGoal:
      String(row.primaryGoal ?? "").trim() || "Lead Generation",
    secondaryGoal:
      String(row.secondaryGoal ?? "").trim() || "Phone Calls",
    trustSignals: trust.length
      ? trust
      : ["Locally Owned", "Free Estimates"],
    conversionStrategy:
      String(row.conversionStrategy ?? "").trim() || "Quote Form",
    cta: primaryCta,
    ctaOptions: ctaOptions.length
      ? ctaOptions
      : [primaryCta, "Call Now", "Get Free Estimate"].slice(0, 3),
    websiteStyle:
      String(row.websiteStyle ?? "").trim() || "Modern",
    colorDirection:
      String(row.colorDirection ?? "").trim() || "Navy",
    imageDirection:
      String(row.imageDirection ?? "").trim() || "Workers on site",
    sections: sections.length
      ? sections
      : [
          "Hero",
          "Trust",
          "Services",
          "About",
          "Testimonials",
          "FAQ",
          "Contact",
        ],
    seoIntent: String(row.seoIntent ?? "").trim() || "Local",
    keywords: keywords.length
      ? keywords
      : [
          `${fallback.industry} ${fallback.location}`,
          `${fallback.industry} near me`,
        ],
    localSeo: localSeo.length
      ? localSeo
      : [fallback.location],
    advantages: advantages.length
      ? advantages
      : ["Clear communication", "Local focus"],
  };
}
