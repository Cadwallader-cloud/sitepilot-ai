import {
  CONTENT_REVIEW_THRESHOLD,
  type ContentReviewHealingTask,
  type ContentReviewHealingTaskStatus,
  type ContentReviewReportBody,
  type ContentReviewSectionId,
  type ContentReviewSelfHealing,
  type SectionReview,
} from "./types";
import type { ReviewCheck } from "@/lib/review/types";

export type {
  ContentReviewHealingTask,
  ContentReviewHealingTaskStatus,
  ContentReviewSelfHealing,
} from "./types";

export const HEALABLE_CONTENT_SECTIONS = [
  "hero",
  "about",
  "services",
  "faq",
  "cta",
] as const satisfies readonly ContentReviewSectionId[];

export type HealableContentSection = (typeof HEALABLE_CONTENT_SECTIONS)[number];

const HEALING_PRIORITY: HealableContentSection[] = [
  "hero",
  "cta",
  "about",
  "services",
  "faq",
];

const HEALING_REASON_LABELS: Partial<Record<string, string>> = {
  headline_specificity: "Headline too generic",
  headline_words: "Headline length is off",
  geo_city: "No location",
  geo_district: "No district",
  geo_country: "No region or country",
  value_proposition: "Weak value proposition",
  subheadline: "Subheadline too weak",
  trustBar: "Missing trust bar",
  cta_strength: "Weak CTA",
  cta_present: "Missing CTA",
  no_fluff: "Too much filler copy",
  story: "Missing company story",
  numbers: "Missing proof numbers",
  experience: "Missing experience signals",
  trust: "Missing trust signals",
  service_title: "Generic service name",
  service_description: "Weak service description",
  service_benefits: "Incomplete service benefits",
  service_cta: "Missing service CTA",
  faq_natural: "FAQ sounds templated",
  faq_unique: "FAQ questions duplicate",
  faq_niche: "FAQ off-niche",
};

export function healingActionForSection(section: SectionReview): string {
  return `Regenerate ${section.label}`;
}

export function healingReasonFromCheck(check: ReviewCheck): string {
  for (const [key, label] of Object.entries(HEALING_REASON_LABELS)) {
    if (!label) continue;
    if (check.id === key || check.id.includes(key)) return label;
  }

  return check.message.trim().replace(/\.$/, "");
}

export function healingReasonsFromSection(section: SectionReview): string[] {
  const reasons: string[] = [];
  const seen = new Set<string>();

  for (const check of section.checks) {
    if (check.status === "pass") continue;
    const reason = healingReasonFromCheck(check);
    if (seen.has(reason)) continue;
    seen.add(reason);
    reasons.push(reason);
  }

  return reasons;
}

export function planContentReviewHealingTasks(
  report: ContentReviewReportBody,
  maxTasks = 2,
): ContentReviewHealingTask[] {
  const tasks: ContentReviewHealingTask[] = [];

  for (const sectionId of HEALABLE_CONTENT_SECTIONS) {
    const section = report.sections[sectionId];
    if (section.score >= CONTENT_REVIEW_THRESHOLD) continue;

    tasks.push({
      action: healingActionForSection(section),
      section: sectionId,
      score: section.score,
      reasons: healingReasonsFromSection(section),
      status: "pending",
    });
  }

  return tasks
    .sort(
      (left, right) =>
        HEALING_PRIORITY.indexOf(left.section as HealableContentSection) -
        HEALING_PRIORITY.indexOf(right.section as HealableContentSection),
    )
    .slice(0, maxTasks);
}

export function formatHealingFeedback(reasons: string[]): string {
  return ["Fix these content review issues:", ...reasons.map((reason) => `- ${reason}`)].join(
    "\n",
  );
}
