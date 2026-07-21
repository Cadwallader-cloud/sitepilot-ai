import {
  GENERIC_HERO_EXACT,
  GENERIC_HERO_PATTERNS,
  collectTextBlob,
  ctaStrength,
  mentionsCity,
  mentionsDistrict,
  mentionsRegionOrCountry,
  normalizeText,
  parseLocationParts,
  wordCount,
  type ContentReviewInput,
  type SectionReview,
} from "../types";
import { buildSectionReview, check } from "../score";

const VALUE_PROPOSITION_PATTERNS = [
  /\b(within \d+\s*(hours?|days?)|same[- ]day|24[- ]hour|emergency|free \w+)\b/i,
  /\b(licensed|insured|certified|accredited|award|warranty|guarantee|family[- ]owned)\b/i,
  /\b(since \d{4}|#\d+|top[- ]rated|5[- ]star|trusted by|why us|what makes us)\b/i,
  /\b(only|first|leading|specializ\w+|exclusive|unique)\b/i,
];

function isGenericHero(headline: string): boolean {
  const normalized = normalizeText(headline);
  if (GENERIC_HERO_EXACT.some((sample) => normalized === sample)) return true;
  if (GENERIC_HERO_PATTERNS.some((pattern) => pattern.test(headline.trim()))) {
    return true;
  }
  return GENERIC_HERO_EXACT.some(
    (sample) => normalized.length <= sample.length + 8 && normalized.includes(sample),
  );
}

function isSpecificHero(headline: string, location: string): boolean {
  if (isGenericHero(headline)) return false;

  const normalized = normalizeText(headline);
  const hasConcreteAction = /\b(repair|replace|install|fix|clean|serve|deliver|restore|treat|design)\b/.test(
    normalized,
  );
  const hasScope =
    mentionsCity(headline, location) ||
    /\b(homeowners|businesses|families|companies|residents|within|for)\b/.test(normalized);
  const hasTimeOrOutcome =
    /\b(\d+\s*(hour|day|week|month)s?|within|before|after|under|fast|quick)\b/.test(normalized);

  return hasConcreteAction || (hasScope && hasTimeOrOutcome) || (hasScope && wordCount(headline) >= 6);
}

function reviewHeadlineWords(headline: string) {
  const count = wordCount(headline);

  if (!headline.trim()) {
    return check("headline_words", "fail", "Hero headline is missing");
  }
  if (count < 4) {
    return check(
      "headline_words",
      "fail",
      `Headline has ${count} words — minimum is 4 (ideal: 6–14)`,
    );
  }
  if (count <= 5) {
    return check(
      "headline_words",
      "warn",
      `Headline has ${count} words — aim for 6–14 words`,
    );
  }
  if (count <= 14) {
    return check("headline_words", "pass", `Headline length is strong (${count} words)`);
  }
  if (count <= 16) {
    return check(
      "headline_words",
      "warn",
      `Headline has ${count} words — trim toward 6–14 words`,
    );
  }
  return check(
    "headline_words",
    "fail",
    `Headline has ${count} words — maximum is 16 (ideal: 6–14)`,
  );
}

function reviewHeadlineSpecificity(headline: string, location: string) {
  if (!headline.trim()) {
    return check("headline_specificity", "fail", "Headline is too generic — add a concrete outcome");
  }
  if (isGenericHero(headline)) {
    return check(
      "headline_specificity",
      "fail",
      'Headline is too generic — e.g. "Quality Roofing Services" instead of "Roof Repair in London Within 24 Hours"',
    );
  }
  if (!isSpecificHero(headline, location)) {
    return check(
      "headline_specificity",
      "warn",
      "Headline needs more concrete detail — service, location, or timeframe",
    );
  }
  return check(
    "headline_specificity",
    "pass",
    "Headline is specific — concrete service, audience, or outcome",
  );
}

function reviewGeography(heroText: string, location: string) {
  const checks = [];
  const parts = parseLocationParts(location);

  if (parts.city) {
    checks.push(
      mentionsCity(heroText, location)
        ? check("geo_city", "pass", "Headline mentions the target city")
        : check(
            "geo_city",
            "warn",
            `Add the city (${parts.city}) so visitors know where you operate`,
          ),
    );
  } else {
    checks.push(
      check("geo_city", "warn", "Business location has no city — add one for local relevance"),
    );
  }

  if (parts.district) {
    checks.push(
      mentionsDistrict(heroText, location)
        ? check("geo_district", "pass", "Headline mentions the target district or neighborhood")
        : check(
            "geo_district",
            "warn",
            `Mention the district (${parts.district}) for stronger local intent`,
          ),
    );
  } else {
    checks.push(
      check(
        "geo_district",
        "pass",
        "No district required — location is city-level only",
      ),
    );
  }

  if (parts.region || parts.country) {
    const label = parts.country || parts.region;
    checks.push(
      mentionsRegionOrCountry(heroText, location)
        ? check("geo_country", "pass", "Headline mentions region or country")
        : check(
            "geo_country",
            "warn",
            `Add region or country (${label}) when you operate across borders or states`,
          ),
    );
  } else {
    checks.push(
      check(
        "geo_country",
        "pass",
        "No region or country required for this location format",
      ),
    );
  }

  return checks;
}

function reviewValueProposition(
  headline: string,
  subheadline: string,
  trustBar: string[] | undefined,
) {
  const blob = collectTextBlob([headline, subheadline, trustBar?.join(" ")]);

  if (VALUE_PROPOSITION_PATTERNS.some((pattern) => pattern.test(blob))) {
    return check(
      "value_proposition",
      "pass",
      "Hero answers why this company — clear differentiator or promise",
    );
  }

  if (trustBar?.length) {
    return check(
      "value_proposition",
      "warn",
      "Trust bar helps, but headline should state why customers should choose you",
    );
  }

  return check(
    "value_proposition",
    "fail",
    "Hero must answer why this company — add a differentiator, proof, or unique promise",
  );
}

function reviewHeroPrimaryCta(primary: string) {
  const trimmed = primary.trim();
  if (!trimmed) {
    return check("cta_present", "fail", "Primary CTA is missing");
  }

  const strength = ctaStrength(trimmed);
  if (strength === "invalid") {
    return check(
      "cta_strength",
      "fail",
      "Primary CTA must start with a verb and name the offer",
    );
  }
  if (strength === "weak") {
    return check(
      "cta_strength",
      "warn",
      `"${trimmed}" is a weak CTA — use Book Free Estimate or Get Free Quote`,
    );
  }
  return check("cta_strength", "pass", "Primary CTA is action-specific");
}

export function reviewHero(input: ContentReviewInput): SectionReview {
  const { hero, location } = input;
  const heroText = collectTextBlob([hero.headline, hero.subheadline]);
  const checks = [
    reviewHeadlineWords(hero.headline),
    reviewHeadlineSpecificity(hero.headline, location),
    ...reviewGeography(heroText, location),
    reviewValueProposition(hero.headline, hero.subheadline, hero.trustBar),
    reviewHeroPrimaryCta(hero.primaryCTA),
  ];

  if (!hero.subheadline.trim()) {
    checks.push(check("subheadline", "fail", "Hero subheadline is missing"));
  } else if (wordCount(hero.subheadline) < 8) {
    checks.push(
      check(
        "subheadline",
        "warn",
        "Subheadline should explain who you help and what happens next",
      ),
    );
  } else {
    checks.push(check("subheadline", "pass", "Subheadline supports the headline"));
  }

  if (!hero.trustBar?.length) {
    checks.push(
      check(
        "trustBar",
        "warn",
        "Add 2–4 trust signals under the hero (licensed, insured, reviews)",
      ),
    );
  } else {
    checks.push(check("trustBar", "pass", "Trust bar reinforces credibility"));
  }

  return buildSectionReview({
    id: "hero",
    label: "Hero",
    checks,
    passSummary: "Hero leads with a specific local promise and clear value",
    warnSummary: "Hero works but needs sharper geography or differentiation",
    failSummary: "Hero needs a sharper headline before launch",
  });
}
