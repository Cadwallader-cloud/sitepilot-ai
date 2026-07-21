import {
  AI_SMELL_PATTERNS,
  collectTextBlob,
  mentionsCity,
  wordCount,
  type ContentReviewInput,
  type SectionReview,
} from "../types";
import { buildSectionReview, check } from "../score";

const STORY_PATTERNS = [
  /\b(since|founded|started|began|originally|our story|our journey|years ago|when we)\b/i,
  /\b(family[- ]owned|locally owned|built this company|grew from|started as)\b/i,
];

const NUMBER_PATTERNS = [
  /\b\d+\+?\b/,
  /\b\d+\s*(%|percent|k|m)\b/i,
  /\b(hundred|thousand|million)\b/i,
];

const EXPERIENCE_PATTERNS = [
  /\b(\d+\+?\s*years?(\s+of)?\s+(experience|service|in business))\b/i,
  /\b(since \d{4}|over \d+\s*years?|more than \d+\s*years?)\b/i,
  /\b(experienced|veteran|seasoned|expert team|certified technicians?)\b/i,
];

const TRUST_PATTERNS = [
  /\b(licensed|insured|certified|accredited|bonded|background[- ]checked)\b/i,
  /\b(warranty|guarantee|trusted|rated|reviews?|award|referral)\b/i,
  /\b(proof|verified|reputation|stand behind|peace of mind)\b/i,
];

function aboutBlob(input: ContentReviewInput): string {
  return collectTextBlob([
    input.about.title,
    input.about.text,
    input.about.paragraphs?.join("\n"),
    input.about.highlights?.join("\n"),
  ]);
}

function reviewNoFluff(text: string) {
  if (!text.trim()) {
    return check("no_fluff", "fail", "About section is empty — replace filler with concrete facts");
  }

  if (wordCount(text) < 40) {
    return check(
      "no_fluff",
      "fail",
      "About copy is too thin — cut fluff and add concrete facts",
    );
  }

  const fluffHits = AI_SMELL_PATTERNS.filter((pattern) => pattern.test(text));
  if (fluffHits.length >= 2) {
    return check(
      "no_fluff",
      "fail",
      "About reads like generic filler — remove water and add specifics",
    );
  }
  if (fluffHits.length === 1) {
    return check(
      "no_fluff",
      "warn",
      "About has marketing fluff — replace vague claims with proof",
    );
  }

  return check("no_fluff", "pass", "About avoids empty filler and stays concrete");
}

function reviewStory(text: string) {
  if (STORY_PATTERNS.some((pattern) => pattern.test(text))) {
    return check("story", "pass", "About tells a company story — origin, journey, or timeline");
  }
  return check(
    "story",
    "warn",
    "About needs a story — when you started, why you exist, or how the company grew",
  );
}

function reviewNumbers(text: string) {
  if (NUMBER_PATTERNS.some((pattern) => pattern.test(text))) {
    return check("numbers", "pass", "About includes numbers — stats, counts, or measurable proof");
  }
  return check(
    "numbers",
    "warn",
    "About needs numbers — years, project counts, ratings, or other measurable proof",
  );
}

function reviewExperience(text: string) {
  if (EXPERIENCE_PATTERNS.some((pattern) => pattern.test(text))) {
    return check("experience", "pass", "About shows experience — tenure, expertise, or track record");
  }
  return check(
    "experience",
    "warn",
    "About should show experience — years in business, certified team, or specialist background",
  );
}

function reviewTrust(text: string, highlights: string[]) {
  const hasTrustLanguage = TRUST_PATTERNS.some((pattern) => pattern.test(text));
  const hasProofHighlights =
    highlights.length >= 2 && highlights.every((item) => wordCount(item) >= 2);

  if (hasTrustLanguage && hasProofHighlights) {
    return check("trust", "pass", "About earns trust with proof points and credibility signals");
  }
  if (hasTrustLanguage || hasProofHighlights) {
    return check(
      "trust",
      "pass",
      "About includes trust signals — credentials, proof, or outcome highlights",
    );
  }
  return check(
    "trust",
    "warn",
    "About needs trust — licensed/insured cues, reviews, guarantees, or proof highlights",
  );
}

export function reviewAbout(input: ContentReviewInput): SectionReview {
  const { about, location } = input;
  const text = aboutBlob(input);
  const highlights = about.highlights ?? [];
  const checks = [
    reviewNoFluff(text),
    reviewStory(text),
    reviewNumbers(text),
    reviewExperience(text),
    reviewTrust(text, highlights),
  ];

  if (!about.title.trim()) {
    checks.push(check("title", "warn", "About section should have a title"));
  }

  if (!mentionsCity(text, location)) {
    checks.push(
      check("local", "warn", "About should mention the city or service area"),
    );
  }

  return buildSectionReview({
    id: "about",
    label: "About",
    checks,
    passSummary: "About earns trust with story, proof, and experience",
    warnSummary: "About is acceptable but needs more story, numbers, or trust",
    failSummary: "About needs more substance before launch",
  });
}
