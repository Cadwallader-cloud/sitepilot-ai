import type { Reviewer } from "@/lib/review/types";
import { defineContentReviewer } from "../adapter";
import { reviewAbout } from "./about";
import { reviewCta } from "./cta";
import { reviewFaq } from "./faq";
import { reviewHero } from "./hero";
import { reviewReadability } from "./readability";
import { reviewServices } from "./services";
import { reviewUniqueness } from "./uniqueness";

export const heroReviewer = defineContentReviewer("hero", reviewHero);
export const aboutReviewer = defineContentReviewer("about", reviewAbout);
export const servicesReviewer = defineContentReviewer("services", reviewServices);
export const faqReviewer = defineContentReviewer("faq", reviewFaq);
export const ctaReviewer = defineContentReviewer("cta", reviewCta);
export const readabilityReviewer = defineContentReviewer("readability", reviewReadability);
export const uniquenessReviewer = defineContentReviewer("uniqueness", reviewUniqueness);

/** Registered content reviewers — implements general Reviewer interface. */
export const CONTENT_REVIEWERS: Reviewer[] = [
  heroReviewer,
  aboutReviewer,
  servicesReviewer,
  faqReviewer,
  ctaReviewer,
  readabilityReviewer,
  uniquenessReviewer,
];

export const CONTENT_REVIEWER_BY_ID: Record<string, Reviewer> = Object.fromEntries(
  CONTENT_REVIEWERS.map((reviewer) => [reviewer.id, reviewer]),
);
