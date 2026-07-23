import { buildSectionReview, check } from "../score";
import {
  averageSentenceLength,
  collectTextBlob,
  countComplexEnglishWords,
  countLongSentences,
  countPassiveSentences,
  paragraphBlocks,
  paragraphLineCount,
  splitSentences,
  wordCount,
  type ContentReviewInput,
  type ReviewCheck,
  type SectionReview,
} from "../types";

const READABILITY_BLOB = (input: ContentReviewInput) =>
  collectTextBlob([
    input.hero.headline,
    input.hero.subheadline,
    input.about.paragraphs?.join("\n\n") ?? input.about.text,
    ...input.services.map((service) => service.description),
    ...input.faq.map((item) => item.answer),
    input.cta?.headline,
  ]);

function reviewShortSentences(blob: string) {
  const sentences = splitSentences(blob);
  const avg = averageSentenceLength(blob);
  const longSentences = countLongSentences(blob, 25);

  if (!sentences.length) {
    return check("short_sentences", "warn", "Add readable body copy with short, clear sentences");
  }
  if (avg > 28 || longSentences >= 4) {
    return check(
      "short_sentences",
      "fail",
      "Sentences are too long — aim for short, scannable lines on mobile",
    );
  }
  if (avg > 22 || longSentences >= 2) {
    return check(
      "short_sentences",
      "warn",
      "Some sentences run long — trim toward short, direct phrasing",
    );
  }
  return check("short_sentences", "pass", "Sentences stay short and easy to scan");
}

function reviewParagraphLines(input: ContentReviewInput) {
  const blocks = paragraphBlocks(input);
  if (!blocks.length) {
    return check("paragraph_lines", "warn", "About section needs short paragraphs");
  }

  const maxLines = maxParagraphLines(input);
  return check(
    "paragraph_lines",
    paragraphLineCheckStatus(maxLines),
    paragraphLineMessage(maxLines),
  );
}

/** Longest rendered paragraph line count across about blocks. */
export function maxParagraphLines(input: ContentReviewInput): number {
  const blocks = paragraphBlocks(input);
  if (!blocks.length) return 0;
  return Math.max(...blocks.map((block) => paragraphLineCount(block)));
}

/** QA audit tier: ≤4 → 0, 5–6 → 2, 7–8 → 5, >8 → 10. */
export function paragraphLineQaPenalty(maxLines: number): number {
  if (maxLines <= 4) return 0;
  if (maxLines <= 6) return 2;
  if (maxLines <= 8) return 5;
  return 10;
}

export function paragraphLineCheckStatus(
  maxLines: number,
): ReviewCheck["status"] {
  if (maxLines <= 4) return "pass";
  if (maxLines <= 6) return "warn";
  return "fail";
}

export function paragraphLineMessage(maxLines: number): string {
  if (maxLines <= 4) {
    return "Paragraphs stay within four lines";
  }
  if (maxLines <= 6) {
    return `Some paragraphs run ${maxLines} lines — aim for four or fewer on mobile`;
  }
  if (maxLines <= 8) {
    return `Paragraphs up to ${maxLines} lines are hard to scan — break them into shorter blocks`;
  }
  return `Paragraphs exceed eight lines — split copy into short mobile-friendly blocks`;
}

function reviewPassiveVoice(blob: string) {
  const sentences = splitSentences(blob);
  const passiveCount = countPassiveSentences(blob);

  if (!sentences.length) {
    return check("passive_voice", "warn", "Use active voice in customer-facing copy");
  }
  if (passiveCount >= 3 || passiveCount / sentences.length > 0.2) {
    return check(
      "passive_voice",
      "fail",
      "Too much passive voice — rewrite with direct active phrasing",
    );
  }
  if (passiveCount > 0) {
    return check(
      "passive_voice",
      "warn",
      "Some copy uses passive voice — prefer active sentences",
    );
  }
  return check("passive_voice", "pass", "Copy keeps passive voice to a minimum");
}

function reviewSimpleEnglish(blob: string) {
  const words = wordCount(blob);
  const complexSignals = countComplexEnglishWords(blob);

  if (!words) {
    return check("simple_english", "warn", "Use plain English customers understand quickly");
  }

  const ratio = complexSignals / words;
  if (complexSignals >= 8 || ratio > 0.12) {
    return check(
      "simple_english",
      "fail",
      "Copy sounds too complex — use plain English and shorter words",
    );
  }
  if (complexSignals >= 3 || ratio > 0.06) {
    return check(
      "simple_english",
      "warn",
      "Some wording is heavier than needed — simplify jargon and long words",
    );
  }
  return check("simple_english", "pass", "Copy uses simple, plain English");
}

export function reviewReadability(input: ContentReviewInput): SectionReview {
  const blob = READABILITY_BLOB(input);

  return buildSectionReview({
    id: "readability",
    label: "Readability",
    checks: [
      reviewShortSentences(blob),
      reviewParagraphLines(input),
      reviewPassiveVoice(blob),
      reviewSimpleEnglish(blob),
    ],
    passSummary: "Copy is readable — short sentences, tight paragraphs, plain English",
    warnSummary: "Readability is acceptable but could be simpler or more scannable",
    failSummary: "Copy is hard to scan — shorten sentences and simplify language",
  });
}
