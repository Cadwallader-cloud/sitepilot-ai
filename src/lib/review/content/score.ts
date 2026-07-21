import {
  clampReviewScore,
  CONTENT_REVIEW_THRESHOLD,
  SECTION_REVIEW_WEIGHTS,
  type ContentReviewFinal,
  type ContentReviewGrade,
  type ContentReviewSectionId,
  type ReviewCheck,
  type SectionReview,
} from "./types";

export function check(
  id: string,
  status: ReviewCheck["status"],
  message: string,
): ReviewCheck {
  return { id, status, message };
}

export function buildSectionReview(params: {
  id: SectionReview["id"];
  label: string;
  checks: ReviewCheck[];
  passSummary: string;
  warnSummary?: string;
  failSummary?: string;
}): SectionReview {
  let score = 100;
  const deduct = (points: number) => {
    score = Math.max(0, score - points);
  };

  for (const check of params.checks) {
    if (check.status === "fail") deduct(20);
    else if (check.status === "warn") deduct(8);
  }

  const fails = params.checks.filter((check) => check.status === "fail").length;
  const warns = params.checks.filter((check) => check.status === "warn").length;

  const summary =
    fails > 0
      ? params.failSummary ?? `${params.label} needs a rewrite before launch`
      : warns > 0
        ? params.warnSummary ?? `${params.label} is usable but could convert better`
        : params.passSummary;

  return {
    id: params.id,
    label: params.label,
    score: clampReviewScore(score),
    checks: params.checks,
    summary,
  };
}

export function gradeFromScore(score: number): ContentReviewGrade {
  if (score >= 90) return "excellent";
  if (score >= CONTENT_REVIEW_THRESHOLD) return "good";
  if (score >= 70) return "needs_work";
  return "poor";
}

export function computeFinalScore(
  sections: Record<ContentReviewSectionId, SectionReview>,
): ContentReviewFinal {
  let score = 0;
  for (const [id, weight] of Object.entries(SECTION_REVIEW_WEIGHTS) as Array<
    [ContentReviewSectionId, number]
  >) {
    score += sections[id].score * weight;
  }

  const rounded = clampReviewScore(score);
  const grade = gradeFromScore(rounded);
  const passed = rounded >= CONTENT_REVIEW_THRESHOLD;

  const weak = Object.values(sections).filter(
    (section) => section.score < CONTENT_REVIEW_THRESHOLD,
  );
  const summary = passed
    ? grade === "excellent"
      ? "Strong marketer-grade copy — ready to publish"
      : "Solid copy — passes the content review gate"
    : weak.length === 1
      ? `${weak[0]!.label} is holding the score back`
      : `${weak.length} sections need rewrites before launch`;

  return {
    score: rounded,
    grade,
    passed,
    summary,
    weights: { ...SECTION_REVIEW_WEIGHTS },
  };
}

export function collectIssues(
  sections: Record<ContentReviewSectionId, SectionReview>,
): string[] {
  const issues: string[] = [];
  for (const section of Object.values(sections)) {
    for (const check of section.checks) {
      if (check.status === "fail") {
        issues.push(`${section.label}: ${check.message}`);
      }
    }
  }
  return issues;
}

export function collectStrengths(
  sections: Record<ContentReviewSectionId, SectionReview>,
): string[] {
  return Object.values(sections)
    .filter((section) => section.score >= CONTENT_REVIEW_THRESHOLD)
    .map((section) => section.summary);
}
