import { buildSectionReview, check } from "../score";
import {
  ctaStartsWithVerb,
  hasDuplicateTexts,
  isGenericCta,
  normalizeText,
  wordCount,
  type ContentReviewInput,
  type SectionReview,
} from "../types";

const GENERIC_SERVICE_TITLES = new Set(["service", "services", "our service", "our services"]);

function formatServiceList(indices: number[]): string {
  if (!indices.length) return "";
  const labels = indices.map((index) => `#${index + 1}`);
  return labels.length === 1 ? labels[0]! : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

function reviewServiceTitles(services: ContentReviewInput["services"]) {
  const weak = services
    .map((service, index) => ({ index, title: service.title.trim() }))
    .filter(({ title }) => {
      if (!title) return true;
      if (wordCount(title) < 2) return true;
      if (GENERIC_SERVICE_TITLES.has(normalizeText(title))) return true;
      return false;
    })
    .map(({ index }) => index);

  if (!services.length) {
    return check("service_title", "fail", "Services section is empty");
  }
  if (weak.length === services.length) {
    return check(
      "service_title",
      "fail",
      "Every service needs a specific name — not generic labels like Service",
    );
  }
  if (weak.length > 0) {
    return check(
      "service_title",
      "warn",
      `Service ${formatServiceList(weak)} needs a clearer name — specific job title, not a label`,
    );
  }
  return check("service_title", "pass", "Each service has a specific name");
}

function reviewServiceDescriptions(services: ContentReviewInput["services"]) {
  const weak = services
    .map((service, index) => ({ index, description: service.description.trim() }))
    .filter(({ description }) => !description || wordCount(description) < 8)
    .map(({ index }) => index);

  if (weak.length === services.length) {
    return check(
      "service_description",
      "fail",
      "Every service needs a description that explains the outcome",
    );
  }
  if (weak.length > 0) {
    return check(
      "service_description",
      "warn",
      `Service ${formatServiceList(weak)} description is too thin — explain what the customer gets`,
    );
  }
  return check("service_description", "pass", "Each service description explains the offer");
}

function reviewServiceBenefits(services: ContentReviewInput["services"]) {
  const weak = services
    .map((service, index) => ({ index, benefits: service.benefits ?? [] }))
    .filter(
      ({ benefits }) =>
        benefits.length < 3 || benefits.some((benefit) => wordCount(benefit) < 2),
    )
    .map(({ index }) => index);

  if (weak.length === services.length) {
    return check(
      "service_benefits",
      "fail",
      "Each service card needs three outcome benefits",
    );
  }
  if (weak.length > 0) {
    return check(
      "service_benefits",
      "warn",
      `Service ${formatServiceList(weak)} needs three scannable benefits`,
    );
  }
  return check("service_benefits", "pass", "Each service lists three outcome benefits");
}

function reviewServiceCtas(services: ContentReviewInput["services"]) {
  const missing = services
    .map((service, index) => ({ index, cta: service.cta?.trim() ?? "" }))
    .filter(({ cta }) => !cta)
    .map(({ index }) => index);

  const weakVerb = services
    .map((service, index) => ({ index, cta: service.cta?.trim() ?? "" }))
    .filter(({ cta }) => cta && !ctaStartsWithVerb(cta))
    .map(({ index }) => index);

  const generic = services
    .map((service, index) => ({ index, cta: service.cta?.trim() ?? "" }))
    .filter(({ cta }) => cta && isGenericCta(cta))
    .map(({ index }) => index);

  if (missing.length === services.length) {
    return check(
      "service_cta",
      "fail",
      "Each service needs a CTA — e.g. Get Free Quote, Book Inspection, Call Now",
    );
  }
  if (missing.length > 0) {
    return check(
      "service_cta",
      "fail",
      `Service ${formatServiceList(missing)} is missing a CTA button label`,
    );
  }
  if (weakVerb.length > 0) {
    return check(
      "service_cta",
      "fail",
      `Service ${formatServiceList(weakVerb)} CTA must start with a verb — Get Free Quote, Book Inspection, Schedule Today`,
    );
  }
  if (generic.length > 0) {
    return check(
      "service_cta",
      "warn",
      `Service ${formatServiceList(generic)} CTA is too generic — use Book Inspection or Get Free Quote`,
    );
  }
  return check("service_cta", "pass", "Each service CTA starts with a strong action verb");
}

export function reviewServices(input: ContentReviewInput): SectionReview {
  const { services } = input;
  const checks = [];

  if (services.length < 3) {
    checks.push(
      check("service_count", "fail", "Need at least three services to show breadth and expertise"),
    );
  } else {
    checks.push(check("service_count", "pass", "Service count supports buyer comparison"));
  }

  checks.push(
    reviewServiceTitles(services),
    reviewServiceDescriptions(services),
    reviewServiceBenefits(services),
    reviewServiceCtas(services),
  );

  const descriptions = services.map((service) => service.description);
  if (hasDuplicateTexts(descriptions)) {
    checks.push(
      check(
        "service_distinct",
        "fail",
        "Service descriptions repeat the same phrasing — rewrite for distinct jobs",
      ),
    );
  } else {
    checks.push(check("service_distinct", "pass", "Services feel distinct"));
  }

  if (services.length >= 3 && !services.some((service) => service.featured)) {
    checks.push(
      check(
        "service_featured",
        "warn",
        "Mark one primary service as featured to guide the main CTA",
      ),
    );
  } else if (services.some((service) => service.featured)) {
    checks.push(check("service_featured", "pass", "Featured service guides conversion"));
  }

  return buildSectionReview({
    id: "services",
    label: "Services",
    checks,
    passSummary: "Each service follows Name → Description → Benefits → CTA",
    warnSummary: "Services work but some cards need sharper copy or CTAs",
    failSummary: "Services need complete cards before launch",
  });
}
