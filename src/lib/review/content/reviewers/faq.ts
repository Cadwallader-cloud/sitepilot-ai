import { buildSectionReview, check } from "../score";
import {
  faqQuestionMatchesNiche,
  hasDuplicateTexts,
  isNaturalFaqQuestion,
  normalizeText,
  wordCount,
  type ContentReviewInput,
  type SectionReview,
} from "../types";

function formatFaqList(indices: number[]): string {
  if (!indices.length) return "";
  const labels = indices.map((index) => `#${index + 1}`);
  return labels.length === 1 ? labels[0]! : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

function reviewFaqNatural(questions: string[]) {
  const unnatural = questions
    .map((question, index) => ({ index, question }))
    .filter(({ question }) => !isNaturalFaqQuestion(question))
    .map(({ index }) => index);

  if (!questions.length) {
    return check("faq_natural", "fail", "FAQ needs natural buyer questions");
  }
  if (unnatural.length === questions.length) {
    return check(
      "faq_natural",
      "fail",
      "FAQ questions sound templated — write natural questions buyers actually ask",
    );
  }
  if (unnatural.length > 0) {
    return check(
      "faq_natural",
      "warn",
      `FAQ ${formatFaqList(unnatural)} should sound natural — use How/What/Do you questions with enough detail`,
    );
  }
  return check("faq_natural", "pass", "FAQ questions sound natural and buyer-focused");
}

function reviewFaqUnique(questions: string[]) {
  const normalized = questions.map((question) => normalizeText(question));
  const hasExactDupes = normalized.length !== new Set(normalized).size;

  if (hasExactDupes || hasDuplicateTexts(questions, 0.82)) {
    return check(
      "faq_unique",
      "fail",
      "FAQ questions duplicate each other — cover pricing, process, timeline, and trust separately",
    );
  }
  return check("faq_unique", "pass", "FAQ questions do not duplicate");
}

function reviewFaqNiche(questions: string[], category?: string) {
  if (!category?.trim()) {
    return check(
      "faq_niche",
      "warn",
      "Add a business category so FAQ questions can match the niche",
    );
  }

  const offNiche = questions
    .map((question, index) => ({ index, question }))
    .filter(({ question }) => !faqQuestionMatchesNiche(question, category))
    .map(({ index }) => index);

  if (offNiche.length === questions.length) {
    return check(
      "faq_niche",
      "fail",
      `FAQ questions should match the ${category} niche — mention the service, problem, or buyer scenario`,
    );
  }
  if (offNiche.length > 0) {
    return check(
      "faq_niche",
      "warn",
      `FAQ ${formatFaqList(offNiche)} should better match the ${category} niche`,
    );
  }
  return check("faq_niche", "pass", "FAQ questions match the business niche");
}

export function reviewFaq(input: ContentReviewInput): SectionReview {
  const { faq, category } = input;
  const checks = [];
  const questions = faq.map((item) => item.question);

  if (faq.length < 3) {
    checks.push(check("faq_count", "fail", "FAQ needs more questions to reduce buyer hesitation"));
  } else if (faq.length < 6) {
    checks.push(
      check("faq_count", "warn", "Six FAQ items cover pricing, timeline, trust, and process better"),
    );
  } else {
    checks.push(check("faq_count", "pass", "FAQ count supports pre-sale objection handling"));
  }

  checks.push(
    reviewFaqNatural(questions),
    reviewFaqUnique(questions),
    reviewFaqNiche(questions, category),
  );

  if (faq.some((item) => wordCount(item.answer) < 6)) {
    checks.push(
      check("faq_answers", "warn", "Some FAQ answers are too thin to reassure a cautious buyer"),
    );
  } else {
    checks.push(check("faq_answers", "pass", "FAQ answers give useful reassurance"));
  }

  return buildSectionReview({
    id: "faq",
    label: "FAQ",
    checks,
    passSummary: "FAQ uses natural, niche-specific questions without duplication",
    warnSummary: "FAQ helps but some questions need a more natural or niche fit",
    failSummary: "FAQ is too thin or templated to support conversion",
  });
}
