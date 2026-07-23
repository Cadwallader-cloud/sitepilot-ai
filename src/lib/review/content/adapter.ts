import type { Issue, ReviewResult, Reviewer } from "@/lib/review/types";
import type { GeneratedSite } from "@/lib/site-types";
import { getHero } from "@/lib/site-types";
import { flatFromWebsite, type Website } from "@/lib/website";
import {
  CONTENT_REVIEW_THRESHOLD,
  type ContentReviewInput,
  type ContentReviewSectionId,
  type ReviewCheck,
  type SectionReview,
} from "./types";

const SECTION_LABELS: Record<ContentReviewSectionId, string> = {
  hero: "Hero",
  about: "About",
  services: "Services",
  faq: "FAQ",
  cta: "CTA",
  readability: "Readability",
  uniqueness: "Uniqueness",
};

export function contentReviewInputFromWebsite(website: Website): ContentReviewInput {
  const flat = flatFromWebsite(website);
  return {
    location: flat.business.location || website.business.location,
    category: flat.business.category || website.business.category,
    businessName: flat.business.name || website.business.name,
    hero: flat.hero,
    about: flat.about,
    services: flat.services,
    faq: flat.faq,
    cta: flat.cta,
    contact: flat.contact,
  };
}

export function contentReviewInputFromGeneratedSite(
  site: GeneratedSite,
  location: string,
  category?: string,
): ContentReviewInput {
  return {
    location,
    category,
    businessName: site.businessName,
    hero: getHero(site),
    about: site.about,
    services: site.services,
    faq: site.faq,
    cta: site.cta,
    contact: site.contact,
  };
}

function checksToIssues(checks: readonly ReviewCheck[]): Issue[] {
  return checks
    .filter((check) => check.status !== "pass")
    .map((check) => ({
      id: check.id,
      message: check.message,
      severity: check.status,
    }));
}

function checksToRecommendations(checks: readonly ReviewCheck[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const check of checks) {
    if (check.status === "pass") continue;
    const line =
      check.status === "fail"
        ? `Fix: ${check.message}`
        : `Improve: ${check.message}`;
    if (seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out;
}

export function sectionReviewToResult(section: SectionReview): ReviewResult {
  const issues = checksToIssues(section.checks);
  const recommendations = checksToRecommendations(section.checks);
  if (!recommendations.length && !section.checks.every((check) => check.status === "pass")) {
    recommendations.push(section.summary);
  }
  if (!recommendations.length && section.summary && section.score < CONTENT_REVIEW_THRESHOLD) {
    recommendations.push(section.summary);
  }

  return {
    score: section.score,
    passed: section.score >= CONTENT_REVIEW_THRESHOLD,
    issues,
    recommendations,
  };
}

export function reviewResultToSection(
  reviewerId: ContentReviewSectionId,
  result: ReviewResult,
): SectionReview {
  return {
    id: reviewerId,
    label: SECTION_LABELS[reviewerId],
    score: result.score,
    checks: result.issues.map((issue) => ({
      id: issue.id,
      status: issue.severity,
      message: issue.message,
    })),
    summary:
      result.recommendations[0] ??
      (result.passed ? `${SECTION_LABELS[reviewerId]} passes review` : `${SECTION_LABELS[reviewerId]} needs work`),
  };
}

export function defineContentReviewer(
  id: SectionReview["id"],
  reviewFn: (input: ContentReviewInput) => SectionReview,
): Reviewer {
  return {
    id,
    async review(website) {
      return sectionReviewToResult(reviewFn(contentReviewInputFromWebsite(website)));
    },
  };
}
