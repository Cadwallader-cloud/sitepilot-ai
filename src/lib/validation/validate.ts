/**
 * Crestis Zod validation entry
 *
 *   AI Output → JSON Validator → PASS (Save) | FAIL (Retry)
 */

import { z } from "zod";
import { ensureWebsite, isWebsite, type Website } from "../website";
import { AboutSchema, aboutSchema } from "./about";
import {
  FAQSchema,
  FAQSectionSchema,
  faqSchema,
  faqSectionSchema,
} from "./faq";
import { HeroSchema, heroSchema } from "./hero";
import { SeoBlockSchema, SeoSchema, seoSchema } from "./seo";
import {
  ServiceSchema,
  ServicesSectionSchema,
  serviceSchema,
  servicesSectionSchema,
} from "./services";
import { WebsiteSchema, websiteSchema } from "./website";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationPass<T> = {
  ok: true;
  data: T;
  issues: [];
};

export type ValidationFail = {
  ok: false;
  data: null;
  issues: ValidationIssue[];
};

export type ValidationResult<T> = ValidationPass<T> | ValidationFail;

function zodIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.map(String).join(".") : "$",
    message: issue.message,
  }));
}

function parseWith<T>(
  schema: z.ZodType<T>,
  raw: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data, issues: [] };
  }
  return { ok: false, data: null, issues: zodIssues(result.error) };
}

export function validateHero(raw: unknown) {
  return parseWith(HeroSchema, raw);
}

export function validateAbout(raw: unknown) {
  return parseWith(AboutSchema, raw);
}

export function validateService(raw: unknown) {
  return parseWith(ServiceSchema, raw);
}

/** Services section — await retry(generateServices, validateServices) */
export function validateServices(raw: unknown) {
  return parseWith(ServicesSectionSchema, raw);
}

/** @deprecated Use validateServices */
export const validateServicesSection = validateServices;

export function validateFaq(raw: unknown) {
  return parseWith(FAQSchema, raw);
}

/** FAQ section — await retry(generateFAQ, validateFAQ) */
export function validateFAQ(raw: unknown) {
  return parseWith(FAQSectionSchema, raw);
}

/** @deprecated Use validateFAQ */
export const validateFaqSection = validateFAQ;

/** SEO — await retry(generateSEO, validateSEO) */
export function validateSEO(raw: unknown) {
  return parseWith(SeoSchema, raw);
}

/** @deprecated Use validateSEO */
export const validateSeo = validateSEO;

/**
 * Validate full Website JSON (normalize legacy shapes first).
 * Soft result for the Save/Retry gate — does not throw.
 */
export function validateWebsiteJson(
  raw: unknown,
): ValidationResult<Website> {
  let candidate: unknown = raw;
  try {
    candidate = isWebsite(raw) ? raw : ensureWebsite(raw);
  } catch {
    return {
      ok: false,
      data: null,
      issues: [{ path: "$", message: "not a valid Website JSON document" }],
    };
  }

  const parsed = WebsiteSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, data: null, issues: zodIssues(parsed.error) };
  }

  // Return Crestis Website instance (keeps crestis / optional extras)
  return {
    ok: true,
    data: candidate as Website,
    issues: [],
  };
}

/**
 * Strict Zod validate — returns parsed data or throws ZodError.
 */
export function validateWebsite(data: unknown) {
  const result = WebsiteSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

export {
  AboutSchema,
  aboutSchema,
  FAQSchema,
  FAQSectionSchema,
  faqSchema,
  faqSectionSchema,
  HeroSchema,
  heroSchema,
  SeoBlockSchema,
  SeoSchema,
  seoSchema,
  ServiceSchema,
  ServicesSectionSchema,
  serviceSchema,
  servicesSectionSchema,
  WebsiteSchema,
  websiteSchema,
};
