import type {
  ContentReviewFinalReport,
  ContentReviewIssue,
  ContentReviewReportBody,
  ContentReviewSectionId,
  ReviewCheck,
  SectionReview,
} from "./types";

const SHORT_MESSAGES: Partial<Record<string, string>> = {
  headline_specificity: "Headline too generic.",
  headline_words: "Headline length is off.",
  geo_city: "City missing from hero.",
  geo_district: "District missing from hero.",
  geo_country: "Region or country missing from hero.",
  value_proposition: "Hero lacks a clear differentiator.",
  cta_strength: "CTA is weak.",
  cta_present: "Primary CTA is missing.",
  no_fluff: "About copy sounds like filler.",
  story: "About lacks a company story.",
  numbers: "About needs measurable proof.",
  experience: "About lacks experience signals.",
  trust: "About lacks trust signals.",
  faq_natural: "FAQ questions sound templated.",
  faq_unique: "FAQ questions duplicate each other.",
  faq_niche: "FAQ does not match the niche.",
  service_title: "Service name is too generic.",
  service_description: "Service description is too thin.",
  service_benefits: "Service benefits are incomplete.",
  service_cta: "Service CTA is missing or weak.",
  short_sentences: "Sentences run too long.",
  paragraph_lines: "Paragraphs are too long.",
  passive_voice: "Too much passive voice.",
  simple_english: "Copy sounds too complex.",
};

const SUGGESTIONS: Partial<Record<string, string>> = {
  headline_specificity: "Mention location and primary service.",
  headline_words: "Keep the headline between 6 and 14 words.",
  geo_city: "Add the target city to the headline or subheadline.",
  geo_district: "Mention the neighborhood or district you serve.",
  geo_country: "Add the region or country for local intent.",
  value_proposition: "State why customers should choose you over competitors.",
  cta_strength: "Use a strong CTA like Book Free Estimate or Get Free Quote.",
  cta_present: "Add a primary CTA that starts with a verb.",
  no_fluff: "Replace vague claims with concrete facts and proof.",
  story: "Add when the company started and why it exists.",
  numbers: "Add years, project counts, ratings, or other measurable proof.",
  experience: "Mention years in business or certified expertise.",
  trust: "Add licensed, insured, warranty, or review proof.",
  faq_natural: "Rewrite questions the way real customers ask them.",
  faq_unique: "Cover pricing, process, timeline, and trust separately.",
  faq_niche: "Mention the service, problem, or buyer scenario for this niche.",
  service_title: "Give each service a specific job-based name.",
  service_description: "Explain the outcome the customer gets.",
  service_benefits: "List three scannable benefits per service.",
  service_cta: "Add a verb-led CTA such as Book Inspection or Get Free Quote.",
  short_sentences: "Break long sentences into shorter mobile-friendly lines.",
  paragraph_lines: "Keep paragraphs to three lines or fewer.",
  passive_voice: "Rewrite passive lines in active voice.",
  simple_english: "Swap jargon for plain English customers understand quickly.",
};

function issueSeverity(status: ReviewCheck["status"]): ContentReviewIssue["severity"] {
  return status === "fail" ? "error" : "warning";
}

function shortMessage(check: ReviewCheck): string {
  for (const [key, message] of Object.entries(SHORT_MESSAGES)) {
    if (!message) continue;
    if (check.id === key || check.id.includes(key)) return message;
  }

  const sentence = check.message.trim();
  if (sentence.length <= 80) return sentence.endsWith(".") ? sentence : `${sentence}.`;
  return `${sentence.slice(0, 77).trim()}...`;
}

function suggestionFor(section: ContentReviewSectionId, check: ReviewCheck): string {
  for (const [key, suggestion] of Object.entries(SUGGESTIONS)) {
    if (!suggestion) continue;
    if (check.id === key || check.id.includes(key)) return suggestion;
  }

  if (check.status === "fail") {
    return `Rewrite the ${section} copy to fix: ${check.message}`;
  }
  return `Improve the ${section} copy: ${check.message}`;
}

export function collectStructuredIssues(
  sections: Record<ContentReviewSectionId, SectionReview>,
): ContentReviewIssue[] {
  const issues: ContentReviewIssue[] = [];

  for (const section of Object.values(sections)) {
    for (const check of section.checks) {
      if (check.status === "pass") continue;
      issues.push({
        severity: issueSeverity(check.status),
        section: section.id,
        message: shortMessage(check),
        suggestion: suggestionFor(section.id, check),
      });
    }
  }

  return issues;
}

export function buildFinalReport(report: ContentReviewReportBody): ContentReviewFinalReport {
  const { sections, final } = report;

  return {
    overall: final.score,
    hero: sections.hero.score,
    about: sections.about.score,
    services: sections.services.score,
    faq: sections.faq.score,
    cta: sections.cta.score,
    issues: collectStructuredIssues(sections),
  };
}
