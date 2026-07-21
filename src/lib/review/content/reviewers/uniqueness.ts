import { check } from "../score";
import {
  AI_CLICHE_DEDUCTION,
  clampReviewScore,
  collectTextBlob,
  detectAiCliches,
  jaccardSimilarity,
  normalizeText,
  type ContentReviewInput,
  type SectionReview,
} from "../types";

function uniquenessBlob(input: ContentReviewInput): string {
  return collectTextBlob([
    input.hero.headline,
    input.hero.subheadline,
    input.about.paragraphs?.join("\n\n") ?? input.about.text,
    input.about.title,
    ...input.services.map((service) => `${service.title} ${service.description}`),
    ...input.faq.map((item) => `${item.question} ${item.answer}`),
    input.cta?.headline,
    input.cta?.primaryCTA,
    input.hero.primaryCTA,
  ]);
}

export function reviewUniqueness(input: ContentReviewInput): SectionReview {
  const blob = uniquenessBlob(input);
  const cliches = detectAiCliches(blob);
  const checks = cliches.map((cliche) =>
    check(
      `ai_phrase_${cliche.id}`,
      "fail",
      `Typical AI phrase detected: ${cliche.label}`,
    ),
  );

  if (!cliches.length) {
    checks.push(check("ai_phrases", "pass", "No typical AI phrases detected"));
  }

  const heroAboutOverlap = jaccardSimilarity(
    input.hero.headline,
    (input.about.paragraphs?.join(" ") ?? input.about.text).slice(0, 180),
  );
  if (heroAboutOverlap >= 0.45) {
    checks.push(
      check(
        "hero_about_overlap",
        "warn",
        "Hero and About repeat the same words — vary the story arc",
      ),
    );
  }

  const serviceTitles = input.services.map((service) => normalizeText(service.title));
  if (
    serviceTitles.length >= 3 &&
    new Set(serviceTitles).size < serviceTitles.length
  ) {
    checks.push(
      check(
        "service_titles",
        "warn",
        "Service titles repeat — make each card name a different job",
      ),
    );
  }

  let score = 100 - cliches.length * AI_CLICHE_DEDUCTION;
  for (const entry of checks) {
    if (entry.status === "warn") score -= 8;
  }

  const fails = checks.filter((entry) => entry.status === "fail").length;
  const warns = checks.filter((entry) => entry.status === "warn").length;
  const summary =
    fails > 0
      ? `${fails} typical AI phrase${fails === 1 ? "" : "s"} lower the uniqueness score`
      : warns > 0
        ? "Copy is usable but could feel more distinctive"
        : "Copy feels original and free of AI clichés";

  return {
    id: "uniqueness",
    label: "Uniqueness",
    score: clampReviewScore(score),
    checks,
    summary,
  };
}
