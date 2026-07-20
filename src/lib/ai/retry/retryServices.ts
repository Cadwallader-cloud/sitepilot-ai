/**
 * Services — await retryServices(ctx) | await retry(generateServices, …)
 */

import {
  generateCtaSection,
  generateServicesSection,
  generateTestimonialsSection,
} from "../../ai-engine/content-generator";
import { runServicePrioritizer } from "../../ai-engine/service-prioritizer";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  WebsitePlan,
} from "../../ai-engine/types";
import type { Service } from "../../website";
import { validateServices } from "../../validation/validate";
import type { ServicesSectionInput } from "../../validation/services";
import type { PipelineContext } from "../orchestrator/context";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  unwrapRetryResult,
  type RetryResult,
} from "./retry";

/** Generators return Service[]; section schema expects { items } */
export function servicesForValidation(raw: unknown): unknown {
  if (Array.isArray(raw)) return { items: raw };
  return raw;
}

function toWebsiteServices(items: ContentDraft["services"]): Service[] {
  return items.map((s, i) => ({
    title: s.title,
    description: s.description,
    benefits:
      Array.isArray(s.benefits) && s.benefits.length
        ? s.benefits.slice(0, 3)
        : ["Clear pricing", "Reliable work", "Local support"],
    icon: s.icon || "wrench",
    featured: s.featured === true || s.priority === "featured" || i === 0,
  }));
}

export type RetryServicesFromContext = {
  services: Service[];
  content: ContentDraft;
  brief: BusinessBrief;
  engineCtx: EngineContext;
  agentCtx: {
    ctx: EngineContext;
    brief: BusinessBrief;
    plan: WebsitePlan;
  };
};

/** Classic: await retry(generateServices, validateServices, { module: "Services" }) */
export async function retryServices(
  generateServices: () => Promise<unknown>,
  maxAttempts?: number,
): Promise<RetryResult<ServicesSectionInput>>;

/** Orchestrator: await retryServices(ctx) */
export async function retryServices(
  ctx: PipelineContext,
): Promise<RetryServicesFromContext>;

export async function retryServices(
  arg: (() => Promise<unknown>) | PipelineContext,
  maxAttempts = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<ServicesSectionInput> | RetryServicesFromContext> {
  if (typeof arg === "function") {
    return retry<ServicesSectionInput>(
      async () => servicesForValidation(await arg()),
      validateServices,
      { module: "Services", maxAttempts },
    );
  }

  const ctx = arg;
  const { meta } = ctx;
  if (
    !meta.plan ||
    !meta.engineCtx ||
    !meta.agentCtx ||
    !meta.heroResult ||
    !meta.aboutResult
  ) {
    throw new Error("ORCHESTRATOR:services requires plan + hero + about");
  }

  meta.onProgress?.({
    stage: "service_prioritizer",
    label: "Service Prioritizer",
  });
  const servicePriority = await runServicePrioritizer({
    businessName: meta.input.businessName,
    industry: meta.category || meta.industryPack.label || meta.tradeKey,
    location: meta.input.location,
    description: meta.input.description || "",
    servicesRaw: meta.input.services,
    userEmail: meta.options.userEmail,
    industryBrief: meta.industryBrief,
    brandPosition: meta.liveDna.brandPosition,
    primaryGoal: meta.liveDna.primaryGoal,
  });

  const brief = { ...meta.brief, servicePriority };
  const engineCtx = { ...meta.engineCtx, brief };
  const agentCtx = { ctx: engineCtx, brief, plan: meta.plan };

  meta.onProgress?.({
    stage: "services_generator",
    label: "Services",
  });

  let servicesAttempt = 0;
  const generateServices = async () => {
    servicesAttempt += 1;
    if (servicesAttempt > 1) {
      meta.onProgress?.({
        stage: "services_retry",
        label: `Services retry #${servicesAttempt}`,
      });
    }
    return servicesForValidation(await generateServicesSection(agentCtx));
  };

  const validated = unwrapRetryResult(
    await retry<ServicesSectionInput>(generateServices, validateServices, {
      module: "Services",
      userEmail: meta.options.userEmail,
      runId: meta.runId,
      maxAttempts,
    }),
  );

  const draftItems = Array.isArray(validated.items) ? validated.items : [];
  const services = toWebsiteServices(draftItems);

  const [testimonials, cta] = await Promise.all([
    generateTestimonialsSection(agentCtx),
    generateCtaSection(agentCtx, meta.heroResult.hero),
  ]);

  const content: ContentDraft = {
    hero: meta.heroResult.hero,
    about: meta.aboutResult.about,
    services: draftItems,
    testimonials,
    faq: [],
    cta,
    contact: {
      phone: meta.input.phone.trim(),
      email: meta.input.email.trim(),
      address: meta.input.location.trim(),
    },
  };

  return {
    services,
    content,
    brief,
    engineCtx,
    agentCtx,
  };
}
