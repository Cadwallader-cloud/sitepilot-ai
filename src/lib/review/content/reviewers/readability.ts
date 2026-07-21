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

  const lineCounts = blocks.map((block) => paragraphLineCount(block));
  const maxLines = Math.max(...lineCounts);

  if (maxLines > 4) {
    return check(
      "paragraph_lines",
      "fail",
      "Paragraphs are too long — keep blocks to three lines or fewer",
    );
  }
  if (maxLines > 3) {
    return check(
      "paragraph_lines",
      "warn",
      "Some paragraphs exceed three lines — break them up for mobile reading",
    );
  }
  return check("paragraph_lines", "pass", "Paragraphs stay within three lines");
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
