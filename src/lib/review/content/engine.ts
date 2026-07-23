import type { Website } from "@/lib/website";
import type { WebsiteJson } from "@/lib/website-json";
import type { Reviewer, ReviewResult } from "@/lib/review/types";
import {
  contentReviewInputFromWebsite,
  reviewResultToSection,
  sectionReviewToResult,
} from "./adapter";
import { CONTENT_REVIEWERS } from "./reviewers";
import { reviewAbout } from "./reviewers/about";
import { reviewCta } from "./reviewers/cta";
import { reviewFaq } from "./reviewers/faq";
import { reviewHero } from "./reviewers/hero";
import { reviewReadability } from "./reviewers/readability";
import { reviewServices } from "./reviewers/services";
import { reviewUniqueness } from "./reviewers/uniqueness";
import {
  collectIssues,
  collectStrengths,
  computeFinalScore,
} from "./score";
import { buildFinalReport } from "./final-report";
import type {
  ContentReviewInput,
  ContentReviewReport,
  ContentReviewSectionId,
  SectionReview,
} from "./types";

export const CONTENT_REVIEW_ENGINE_RULE =
  "Content Review Engine scores Website JSON like an experienced marketer — rules only, no HTML/CSS." as const;

export function contentReviewPromptBlock(): string {
  return [
    "CONTENT REVIEW ENGINE — deterministic marketer review:",
    "Hero, About, Services, FAQ, CTA, Readability, Uniqueness → Final Score.",
    "Pass threshold: 85/100.",
  ].join("\n");
}

export function reviewContent(input: ContentReviewInput): ContentReviewReport {
  const sections = {
    hero: reviewHero(input),
    about: reviewAbout(input),
    services: reviewServices(input),
    faq: reviewFaq(input),
    cta: reviewCta(input),
    readability: reviewReadability(input),
    uniqueness: reviewUniqueness(input),
  } satisfies Record<ContentReviewSectionId, SectionReview>;

  const final = computeFinalScore(sections);

  const reportBody = {
    sections,
    final,
    issues: collectIssues(sections),
    strengths: collectStrengths(sections),
  };

  return {
    ...reportBody,
    report: buildFinalReport(reportBody),
  };
}

export function reviewWebsiteJson(site: WebsiteJson): ContentReviewReport {
  return reviewContent({
    location: site.business.location,
    category: site.business.category,
    hero: site.hero,
    about: site.about,
    services: site.services,
    faq: site.faq,
    cta: site.cta,
    contact: site.contact,
  });
}

/** Website v2 entry — runs all registered content reviewers. */
export async function reviewWebsite(website: Website): Promise<ContentReviewReport> {
  return runReviewers(website, CONTENT_REVIEWERS);
}

export async function runReviewers(
  website: Website,
  reviewers: readonly Reviewer[],
): Promise<ContentReviewReport> {
  const sections = {} as Record<ContentReviewSectionId, SectionReview>;

  await Promise.all(
    reviewers.map(async (reviewer) => {
      const result = await reviewer.review(website);
      sections[reviewer.id as ContentReviewSectionId] = reviewResultToSection(
        reviewer.id as ContentReviewSectionId,
        result,
      );
    }),
  );

  const final = computeFinalScore(sections);

  const reportBody = {
    sections,
    final,
    issues: collectIssues(sections),
    strengths: collectStrengths(sections),
  };

  return {
    ...reportBody,
    report: buildFinalReport(reportBody),
  };
}

/** Run one registered reviewer by id. */
export async function runReviewer(
  website: Website,
  reviewerId: string,
): Promise<ReviewResult> {
  const reviewer = CONTENT_REVIEWERS.find((entry) => entry.id === reviewerId);
  if (!reviewer) {
    throw new Error(`Unknown content reviewer: ${reviewerId}`);
  }
  return reviewer.review(website);
}

export function reviewWebsiteSync(website: Website): ContentReviewReport {
  return reviewContent(contentReviewInputFromWebsite(website));
}

export function toReviewResult(section: SectionReview): ReviewResult {
  return sectionReviewToResult(section);
}

export function contentReviewBrief(report: ContentReviewReport): string {
  return [
    `CONTENT REVIEW: ${report.final.score}/100 (${report.final.grade})`,
    `Passed: ${report.final.passed ? "yes" : "no"}`,
    ...Object.values(report.sections).map(
      (section) => `- ${section.label}: ${section.score}/100`,
    ),
    report.final.summary,
  ].join("\n");
}

export type {
  ContentReviewFinal,
  ContentReviewFinalReport,
  ContentReviewGrade,
  ContentReviewInput,
  ContentReviewIssue,
  ContentReviewIssueSeverity,
  ContentReviewReport,
  ContentReviewSectionId,
  SectionReview,
} from "./types";

export type { Issue, ReviewResult, ReviewStatus, Reviewer } from "@/lib/review/types";
export type { ReviewCheck } from "./types";

export {
  CONTENT_REVIEW_THRESHOLD,
  SECTION_REVIEW_WEIGHTS,
  SECTION_SCORE_POINTS,
} from "./types";

export {
  contentReviewInputFromGeneratedSite,
  contentReviewInputFromWebsite,
  defineContentReviewer,
  reviewResultToSection,
  sectionReviewToResult,
} from "./adapter";

export {
  CONTENT_REVIEWERS,
  CONTENT_REVIEWER_BY_ID,
  aboutReviewer,
  ctaReviewer,
  faqReviewer,
  heroReviewer,
  readabilityReviewer,
  servicesReviewer,
  uniquenessReviewer,
} from "./reviewers";

export {
  buildSectionReview,
  collectIssues,
  collectStrengths,
  computeFinalScore,
  gradeFromScore,
} from "./score";

export {
  buildFinalReport,
  collectStructuredIssues,
} from "./final-report";

export {
  formatHealingFeedback,
  healingActionForSection,
  healingReasonFromCheck,
  healingReasonsFromSection,
  planContentReviewHealingTasks,
  shouldRunContentReviewSelfHealing,
  contentReviewHasCriticalIssues,
  sectionHasCriticalIssues,
  CONTENT_REVIEW_SELF_HEALING_SKIP_SCORE,
  HEALABLE_CONTENT_SECTIONS,
} from "./self-healing";

export type {
  ContentReviewHealingTask,
  ContentReviewHealingTaskStatus,
  ContentReviewSelfHealing,
} from "./types";

export { reviewHero } from "./reviewers/hero";
export { reviewAbout } from "./reviewers/about";
export { reviewServices } from "./reviewers/services";
export { reviewFaq } from "./reviewers/faq";
export { reviewCta } from "./reviewers/cta";
export { reviewReadability } from "./reviewers/readability";
export { reviewUniqueness } from "./reviewers/uniqueness";
