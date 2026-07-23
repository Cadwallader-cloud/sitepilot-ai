import type { GeneratedSite } from "./site-types";
import { getHero } from "./site-types";
import { contentReviewInputFromGeneratedSite } from "./review/content/adapter";
import { reviewCta } from "./review/content/reviewers/cta";
import { reviewHero } from "./review/content/reviewers/hero";
import { reviewReadability, maxParagraphLines, paragraphLineQaPenalty } from "./review/content/reviewers/readability";
import { reviewUniqueness } from "./review/content/reviewers/uniqueness";
import { ctaStrength, mentionsCity as mentionsCityTerm } from "./review/content/types";
import type { ReviewCheck } from "./review/types";

export type QualityCheckStatus = "pass" | "warn" | "fail";

export type QualityCheck = {
  id: string;
  label: string;
  status: QualityCheckStatus;
  message?: string;
};

export type QualityAuditResult = {
  score: number;
  checks: QualityCheck[];
  summary: string;
  source: "rules" | "ai" | "hybrid";
};

const BAD_HERO_EXACT = [
  "professional roofing services",
  "quality plumbing services",
  "expert dental care",
  "professional electrician services",
  "welcome to our restaurant",
  "your trusted local experts",
  "quality services you can trust",
];

const BAD_HERO_PATTERNS = [
  /^(professional|quality|expert|trusted)\s+\w+(\s+\w+)?\s+services$/i,
  /^welcome to our .+$/i,
];

const GENERIC_CTAS = [
  "contact us today",
  "get in touch today",
  "call us today",
  "contact us",
  "learn more",
];

const CONTENT_PENALTIES = {
  readability: { fail: 12, warn: 5 },
  long_sentences: { fail: 8, warn: 4 },
  word_repetition: { fail: 10, warn: 4 },
  generic_phrases: { fail: 14, warn: 6 },
  local_specificity: { fail: 10, warn: 5 },
  hero: { fail: 8, warn: 4 },
  cta: { fail: 8, warn: 5 },
} as const;

const STATUS_RANK: Record<QualityCheckStatus, number> = {
  pass: 0,
  warn: 1,
  fail: 2,
};

function worstCheckStatus(checks: ReviewCheck[]): QualityCheckStatus {
  if (checks.some((c) => c.status === "fail")) return "fail";
  if (checks.some((c) => c.status === "warn")) return "warn";
  return "pass";
}

function messageForStatus(
  checks: ReviewCheck[],
  status: QualityCheckStatus,
): string | undefined {
  return checks.find((c) => c.status === status)?.message;
}

function upgradeQualityCheck(
  checks: QualityCheck[],
  penalize: (pts: number) => void,
  id: string,
  label: string,
  status: QualityCheckStatus,
  message: string | undefined,
  penalties: { fail: number; warn: number },
): void {
  const existingIdx = checks.findIndex((c) => c.id === id);
  const existing = existingIdx >= 0 ? checks[existingIdx] : undefined;
  const oldRank = existing ? STATUS_RANK[existing.status] : -1;
  const newRank = STATUS_RANK[status];

  if (newRank < oldRank) return;
  if (newRank === oldRank) {
    if (message && existing && existing.status !== "pass") {
      checks[existingIdx] = { ...existing, message };
    }
    return;
  }

  if (status !== "pass") {
    const pts = status === "fail" ? penalties.fail : penalties.warn;
    if (existing?.status === "warn" && status === "fail") {
      penalize(Math.max(0, penalties.fail - penalties.warn));
    } else if (!existing || existing.status === "pass") {
      penalize(pts);
    }
  }

  const next: QualityCheck = {
    id,
    label: existing?.label ?? label,
    status,
    message: message ?? existing?.message,
  };
  if (existingIdx >= 0) checks[existingIdx] = next;
  else checks.push(next);
}

function setQualityCheck(
  checks: QualityCheck[],
  id: string,
  label: string,
  status: QualityCheckStatus,
  message?: string,
): void {
  const existingIdx = checks.findIndex((c) => c.id === id);
  const next: QualityCheck = { id, label, status, message };
  if (existingIdx >= 0) checks[existingIdx] = next;
  else checks.push(next);
}

function enrichAuditWithContentReview(
  checks: QualityCheck[],
  penalize: (pts: number) => void,
  site: GeneratedSite,
  location: string,
  category?: string,
): void {
  const input = contentReviewInputFromGeneratedSite(site, location, category);
  const readability = reviewReadability(input);
  const uniqueness = reviewUniqueness(input);
  const ctaReview = reviewCta(input);
  const heroReview = reviewHero(input);

  const maxLines = maxParagraphLines(input);
  const paragraphPenalty = paragraphLineQaPenalty(maxLines);
  const paragraphCheck = readability.checks.find((c) => c.id === "paragraph_lines");
  const otherReadabilityChecks = readability.checks.filter(
    (c) => c.id !== "short_sentences" && c.id !== "paragraph_lines",
  );
  const otherStatus = worstCheckStatus(otherReadabilityChecks);
  const combinedReadabilityStatus = worstCheckStatus([
    ...(paragraphCheck ? [paragraphCheck] : []),
    ...otherReadabilityChecks,
  ]);

  if (paragraphPenalty > 0) penalize(paragraphPenalty);
  if (otherStatus !== "pass") {
    penalize(
      otherStatus === "fail"
        ? CONTENT_PENALTIES.readability.fail
        : CONTENT_PENALTIES.readability.warn,
    );
  }

  setQualityCheck(
    checks,
    "readability",
    "Readability",
    combinedReadabilityStatus,
    combinedReadabilityStatus === "pass"
      ? "Copy is scannable with plain English"
      : messageForStatus(
          [
            ...(paragraphCheck && paragraphCheck.status !== "pass" ? [paragraphCheck] : []),
            ...otherReadabilityChecks.filter((c) => c.status !== "pass"),
          ],
          combinedReadabilityStatus,
        ),
  );

  const longSentenceCheck = readability.checks.find((c) => c.id === "short_sentences");
  if (longSentenceCheck && longSentenceCheck.status !== "pass") {
    upgradeQualityCheck(
      checks,
      penalize,
      "long_sentences",
      "Sentences",
      longSentenceCheck.status,
      longSentenceCheck.message,
      CONTENT_PENALTIES.long_sentences,
    );
  }

  const wordRepCheck = uniqueness.checks.find((c) => c.id === "word_repetition");
  if (wordRepCheck && wordRepCheck.status !== "pass") {
    upgradeQualityCheck(
      checks,
      penalize,
      "word_repetition",
      "Word repetition",
      wordRepCheck.status,
      wordRepCheck.message,
      CONTENT_PENALTIES.word_repetition,
    );
  }

  const clicheChecks = uniqueness.checks.filter((c) => c.id.startsWith("ai_phrase_"));
  const clicheStatus = worstCheckStatus(clicheChecks);
  if (clicheStatus !== "pass") {
    const messages = clicheChecks
      .filter((c) => c.status !== "pass")
      .map((c) => c.message);
    upgradeQualityCheck(
      checks,
      penalize,
      "generic_phrases",
      "Generic phrases",
      clicheStatus,
      messages.slice(0, 2).join("; "),
      CONTENT_PENALTIES.generic_phrases,
    );
  }

  const localChecks = heroReview.checks.filter((c) =>
    ["geo_city", "geo_district", "headline_specificity"].includes(c.id),
  );
  const localStatus = worstCheckStatus(localChecks);
  upgradeQualityCheck(
    checks,
    penalize,
    "local_specificity",
    "Local specificity",
    localStatus,
    localStatus === "pass"
      ? "Hero and copy signal the target market"
      : messageForStatus(localChecks, localStatus),
    CONTENT_PENALTIES.local_specificity,
  );

  const heroContentChecks = heroReview.checks.filter((c) =>
    ["headline_specificity", "headline_words", "value_proposition"].includes(c.id),
  );
  const heroContentStatus = worstCheckStatus(heroContentChecks);
  upgradeQualityCheck(
    checks,
    penalize,
    "hero",
    "Hero",
    heroContentStatus,
    messageForStatus(heroContentChecks, heroContentStatus),
    CONTENT_PENALTIES.hero,
  );

  const ctaContentChecks = ctaReview.checks.filter(
    (c) => c.id === "cta_strength" || c.id === "cta_present",
  );
  const ctaContentStatus = worstCheckStatus(ctaContentChecks);
  upgradeQualityCheck(
    checks,
    penalize,
    "cta",
    "CTA",
    ctaContentStatus,
    messageForStatus(ctaContentChecks, ctaContentStatus),
    CONTENT_PENALTIES.cta,
  );
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(s: string): number {
  return normalize(s).split(" ").filter(Boolean).length;
}

function jaccard(a: string, b: string): number {
  const A = new Set(normalize(a).split(" ").filter(Boolean));
  const B = new Set(normalize(b).split(" ").filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

function hasInternalDuplicates(texts: string[], threshold = 0.9): boolean {
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      if (
        normalize(texts[i]) === normalize(texts[j]) ||
        jaccard(texts[i], texts[j]) >= threshold
      ) {
        return true;
      }
    }
  }
  return false;
}

function isGenericHero(title: string): boolean {
  const n = normalize(title);
  if (BAD_HERO_EXACT.some((b) => n === b)) return true;
  if (BAD_HERO_PATTERNS.some((re) => re.test(title.trim()))) return true;
  return BAD_HERO_EXACT.some((b) => n.length <= b.length + 8 && n.includes(b));
}

function mentionsCity(text: string, location: string): boolean {
  return mentionsCityTerm(text, location);
}

function lookLikeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("/");
}

/** Deterministic single-site quality checks (Phase 2). */
export function auditWebsiteWithRules(
  site: GeneratedSite,
  location: string,
  options?: { category?: string },
): QualityAuditResult {
  const checks: QualityCheck[] = [];
  let score = 100;
  const penalize = (pts: number) => {
    score = Math.max(0, score - pts);
  };

  const city = location.trim();
  const hero = getHero(site);
  const cityInHero = mentionsCity(hero.headline, city);
  const cityInAbout = mentionsCity(site.about.text, city);
  const cityInSeo =
    mentionsCity(site.seo.title, city) ||
    mentionsCity(site.seo.description, city) ||
    site.seo.keywords.some((k) => mentionsCity(k, city));

  // Hero
  if (!hero.headline.trim()) {
    checks.push({
      id: "hero",
      label: "Hero",
      status: "fail",
      message: "Hero headline is missing",
    });
    penalize(20);
  } else if (isGenericHero(hero.headline)) {
    checks.push({
      id: "hero",
      label: "Hero",
      status: "fail",
      message: "Hero headline is too generic",
    });
    penalize(15);
  } else if (!cityInHero) {
    checks.push({
      id: "hero",
      label: "Hero",
      status: "warn",
      message: "Hero could be more specific — mention the city or a local outcome",
    });
    penalize(6);
  } else if (wordCount(hero.headline) < 4) {
    checks.push({
      id: "hero",
      label: "Hero",
      status: "warn",
      message: "Hero could be more specific",
    });
    penalize(4);
  } else {
    checks.push({
      id: "hero",
      label: "Hero",
      status: "pass",
      message: "Specific hero with local signal",
    });
  }

  // CTA
  const cta = hero.primaryCTA.trim();
  const ctaPower = ctaStrength(cta);
  if (!cta) {
    checks.push({
      id: "cta",
      label: "CTA",
      status: "fail",
      message: "Missing primary CTA",
    });
    penalize(12);
  } else if (ctaPower === "invalid") {
    checks.push({
      id: "cta",
      label: "CTA",
      status: "fail",
      message: `"${cta}" is not a clear CTA — start with a verb and name the offer`,
    });
    penalize(12);
  } else if (ctaPower === "weak" || GENERIC_CTAS.includes(normalize(cta))) {
    checks.push({
      id: "cta",
      label: "CTA",
      status: "warn",
      message: `"${cta}" is a weak CTA — prefer Book Free Estimate, Get Free Quote, or Schedule Inspection`,
    });
    penalize(8);
  } else if (!hero.secondaryCTA.trim()) {
    checks.push({
      id: "cta",
      label: "CTA",
      status: "warn",
      message: "Add a secondary CTA",
    });
    penalize(2);
  } else {
    checks.push({ id: "cta", label: "CTA", status: "pass" });
  }

  // About length + city
  const aboutWords = wordCount(site.about.text);
  if (aboutWords < 40) {
    checks.push({
      id: "about",
      label: "About",
      status: "fail",
      message: "About text is too short",
    });
    penalize(10);
  } else if (!cityInAbout) {
    checks.push({
      id: "about",
      label: "About",
      status: "warn",
      message: "About should mention the city",
    });
    penalize(4);
  } else {
    checks.push({ id: "about", label: "About", status: "pass" });
  }

  // Services
  const serviceDescs = site.services.map((s) => s.description);
  if (site.services.length < 3) {
    checks.push({
      id: "services",
      label: "Services",
      status: "fail",
      message: "Need at least 3 services",
    });
    penalize(10);
  } else if (serviceDescs.some((d) => wordCount(d) < 8)) {
    checks.push({
      id: "services",
      label: "Services",
      status: "warn",
      message: "Some service descriptions are too short",
    });
    penalize(5);
  } else if (hasInternalDuplicates(serviceDescs)) {
    checks.push({
      id: "services",
      label: "Services",
      status: "warn",
      message: "Service descriptions look duplicated",
    });
    penalize(8);
  } else {
    checks.push({ id: "services", label: "Services", status: "pass" });
  }

  // FAQ
  if (site.faq.length < 3) {
    checks.push({
      id: "faq",
      label: "FAQ",
      status: "fail",
      message: "Need more FAQ items",
    });
    penalize(10);
  } else if (site.faq.some((f) => wordCount(f.answer) < 6)) {
    checks.push({
      id: "faq",
      label: "FAQ",
      status: "warn",
      message: "Some FAQ answers are thin",
    });
    penalize(4);
  } else {
    checks.push({ id: "faq", label: "FAQ", status: "pass" });
  }

  // SEO
  const seoOk =
    site.seo.title.trim().length >= 10 &&
    site.seo.description.trim().length >= 40 &&
    site.seo.keywords.length >= 3;
  if (!seoOk) {
    checks.push({
      id: "seo",
      label: "SEO",
      status: "fail",
      message: "SEO title, description, or keywords incomplete",
    });
    penalize(12);
  } else if (!cityInSeo) {
    checks.push({
      id: "seo",
      label: "SEO",
      status: "warn",
      message: "SEO should include the city",
    });
    penalize(4);
  } else {
    checks.push({ id: "seo", label: "SEO", status: "pass" });
  }

  // Contact
  const phoneOk = site.contact.phone.trim().length >= 7;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contact.email.trim());
  const addressOk = site.contact.address.trim().length >= 3;
  if (!phoneOk || !emailOk) {
    checks.push({
      id: "contact",
      label: "Contact",
      status: "fail",
      message: "Phone or email missing / invalid",
    });
    penalize(12);
  } else if (!addressOk) {
    checks.push({
      id: "contact",
      label: "Contact",
      status: "warn",
      message: "Add a service-area address",
    });
    penalize(3);
  } else {
    checks.push({ id: "contact", label: "Contact", status: "pass" });
  }

  // Local mentions (aggregate)
  if (cityInHero || cityInAbout || cityInSeo) {
    checks.push({
      id: "local",
      label: "Local",
      status: cityInHero && (cityInAbout || cityInSeo) ? "pass" : "warn",
      message:
        cityInHero && (cityInAbout || cityInSeo)
          ? undefined
          : "Add more local city mentions across sections",
    });
    if (!(cityInHero && (cityInAbout || cityInSeo))) penalize(3);
  } else {
    checks.push({
      id: "local",
      label: "Local",
      status: "fail",
      message: "City is not mentioned on the site",
    });
    penalize(10);
  }

  // Images
  const galleryOk =
    Array.isArray(site.images.gallery) && site.images.gallery.length >= 2;
  if (!lookLikeUrl(site.images.hero) || !galleryOk) {
    checks.push({
      id: "images",
      label: "Images",
      status: "fail",
      message: "Hero or gallery images missing",
    });
    penalize(10);
  } else {
    checks.push({ id: "images", label: "Images", status: "pass" });
  }

  // Mobile — template is responsive; always pass with note
  checks.push({
    id: "mobile",
    label: "Mobile",
    status: "pass",
    message: "Layout supports mobile preview",
  });

  // Testimonials — real reviews preferred; demo examples OK in preview only
  const realReviews = site.testimonials.filter((t) => t.demo === false);
  const demoReviews = site.testimonials.filter((t) => t.demo);
  if (site.testimonials.length === 0) {
    checks.push({
      id: "testimonials",
      label: "Reviews",
      status: "pass",
      message: "No reviews — section hidden on live site until real ones are added",
    });
  } else if (hasInternalDuplicates(site.testimonials.map((t) => t.text))) {
    checks.push({
      id: "testimonials",
      label: "Reviews",
      status: "warn",
      message: "Review texts look duplicated",
    });
    penalize(6);
  } else if (realReviews.length > 0) {
    checks.push({
      id: "testimonials",
      label: "Reviews",
      status: "pass",
      message: `${realReviews.length} real customer review(s)`,
    });
  } else {
    checks.push({
      id: "testimonials",
      label: "Reviews",
      status: "pass",
      message: `${demoReviews.length} example review(s) for preview — hidden on live site`,
    });
  }

  enrichAuditWithContentReview(checks, penalize, site, city, options?.category);

  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const summary =
    fails === 0 && warns === 0
      ? "Strong site — ready to publish"
      : fails > 0
        ? `Fix ${fails} issue${fails === 1 ? "" : "s"} before publishing`
        : `${warns} improvement${warns === 1 ? "" : "s"} suggested`;

  return {
    score,
    checks,
    summary,
    source: "rules",
  };
}

/** Merge rule audit with AI self-critique; rules win on hard fails. */
export function mergeQualityAudits(
  rules: QualityAuditResult,
  ai: QualityAuditResult,
): QualityAuditResult {
  const byId = new Map<string, QualityCheck>();

  for (const c of rules.checks) byId.set(c.id, { ...c });

  for (const c of ai.checks) {
    const existing = byId.get(c.id);
    if (!existing) {
      byId.set(c.id, c);
      continue;
    }
    if (STATUS_RANK[c.status] > STATUS_RANK[existing.status]) {
      byId.set(c.id, {
        ...c,
        message: c.message || existing.message,
      });
    } else if (
      existing.status === "pass" &&
      c.status === "pass" &&
      c.message &&
      !existing.message
    ) {
      byId.set(c.id, { ...existing, message: c.message });
    } else if (
      existing.status === c.status &&
      c.message &&
      existing.status !== "pass"
    ) {
      byId.set(c.id, { ...existing, message: c.message });
    }
  }

  // Prefer AI nuanced hero warning if rules only passed
  const aiHero = ai.checks.find((c) => c.id === "hero");
  const ruleHero = byId.get("hero");
  if (
    aiHero &&
    ruleHero?.status === "pass" &&
    aiHero.status === "warn" &&
    aiHero.message
  ) {
    byId.set("hero", aiHero);
  }

  const checks = preferredCheckOrder(Array.from(byId.values()));
  const score = Math.round(
    Math.min(rules.score, ai.score) * 0.35 +
      ((rules.score + ai.score) / 2) * 0.65,
  );

  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const summary =
    ai.summary?.trim() ||
    (fails === 0 && warns === 0
      ? "Strong site — ready to publish"
      : fails > 0
        ? `Fix ${fails} issue${fails === 1 ? "" : "s"} before publishing`
        : `${warns} improvement${warns === 1 ? "" : "s"} suggested`);

  return {
    score: Math.max(0, Math.min(100, score)),
    checks,
    summary,
    source: "hybrid",
  };
}

function preferredCheckOrder(checks: QualityCheck[]): QualityCheck[] {
  const order = [
    "seo",
    "cta",
    "readability",
    "long_sentences",
    "word_repetition",
    "generic_phrases",
    "local_specificity",
    "images",
    "mobile",
    "faq",
    "hero",
    "about",
    "services",
    "local",
    "contact",
    "testimonials",
  ];
  return [...checks].sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export function parseAiQualityAudit(raw: unknown): QualityAuditResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const score = typeof o.score === "number" ? Math.round(o.score) : null;
  if (score === null || score < 0 || score > 100) return null;

  const checksRaw = Array.isArray(o.checks) ? o.checks : [];
  const checks: QualityCheck[] = [];
  for (const item of checksRaw) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;
    const id = typeof c.id === "string" ? c.id : "";
    const label = typeof c.label === "string" ? c.label : id;
    const status = c.status;
    if (!id || (status !== "pass" && status !== "warn" && status !== "fail"))
      continue;
    checks.push({
      id,
      label,
      status,
      message: typeof c.message === "string" ? c.message : undefined,
    });
  }
  if (!checks.length) return null;

  return {
    score,
    checks: preferredCheckOrder(checks),
    summary:
      typeof o.summary === "string" && o.summary.trim()
        ? o.summary.trim()
        : "AI self-audit complete",
    source: "ai",
  };
}
