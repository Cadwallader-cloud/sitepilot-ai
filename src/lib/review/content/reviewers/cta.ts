import { buildSectionReview, check } from "../score";
import {
  ctaStrength,
  type ContentReviewInput,
  type SectionReview,
} from "../types";

function reviewCtaStrength(
  id: string,
  label: string,
  role: "primary" | "secondary" | "band",
) {
  const trimmed = label.trim();
  const strengthId = role === "primary" ? "cta_strength" : `${id}_strength`;

  if (!trimmed) {
    if (role === "primary") {
      return [
        check("cta_present", "fail", "Primary CTA is missing"),
        check(
          strengthId,
          "fail",
          "Add a strong CTA — e.g. Book Free Estimate, Get Free Quote, Schedule Inspection",
        ),
      ];
    }
    return [
      check(
        `${id}_missing`,
        "warn",
        role === "secondary"
          ? "Add a secondary CTA — e.g. Call Now or Schedule Today"
          : "Final CTA band could restate the outcome before the button",
      ),
    ];
  }

  const checks = [];
  if (role === "primary") {
    checks.push(check("cta_present", "pass", "Primary CTA is present"));
  }

  const strength = ctaStrength(trimmed);
  if (strength === "invalid") {
    checks.push(
      check(
        strengthId,
        role === "primary" ? "fail" : "warn",
        `"${trimmed}" is not a clear CTA — start with a verb and name the offer`,
      ),
    );
  } else if (strength === "weak") {
    checks.push(
      check(
        strengthId,
        "warn",
        `"${trimmed}" is a weak CTA — prefer Book Free Estimate, Get Free Quote, or Schedule Inspection`,
      ),
    );
  } else {
    checks.push(
      check(
        strengthId,
        "pass",
        `"${trimmed}" is a strong CTA — clear action with a specific offer`,
      ),
    );
  }

  return checks;
}

export function reviewCta(input: ContentReviewInput): SectionReview {
  const { hero, cta } = input;
  const checks = [
    ...reviewCtaStrength("primary", hero.primaryCTA, "primary"),
    ...reviewCtaStrength("secondary", hero.secondaryCTA, "secondary"),
  ];

  if (cta?.primaryCTA?.trim()) {
    checks.push(...reviewCtaStrength("band_primary", cta.primaryCTA, "band"));
  } else if (cta?.headline?.trim()) {
    checks.push(check("band", "pass", "Final CTA band reinforces the offer"));
  } else {
    checks.push(
      check(
        "band",
        "warn",
        "Final CTA band could restate the outcome before the button",
      ),
    );
  }

  return buildSectionReview({
    id: "cta",
    label: "CTA",
    checks,
    passSummary: "CTAs are strong — specific action plus offer",
    warnSummary: "Some CTAs are weak — replace Learn More with Book Free Estimate",
    failSummary: "CTA path is too weak for conversion",
  });
}
