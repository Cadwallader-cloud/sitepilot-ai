/**
 * Services — await retryServices(ctx) | await retry(generateServices, …)
 */

import {
  generateCtaSection,
  generateServicesSection,
  generateTestimonialsSection,
} from "../../ai-engine/content-generator";
import {
  parseServiceList,
  runServicePrioritizer,
  shouldSkipServicePrioritizer,
} from "../../ai-engine/service-prioritizer";
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
import { getGenerationProfile } from "../orchestrator/context";
import { prepareServicesRun, type ServicesSectionRun } from "../context";
import { buildEngineAgentCtx } from "../context/engine-agent";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  softRetryResult,
  type RetryResult,
} from "./retry";
import { servicesInputFallback } from "./section-fallbacks";

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

/** Orchestrator: await retryServices(run) */
export async function retryServices(
  run: ServicesSectionRun,
): Promise<RetryServicesFromContext>;

/** @deprecated Prefer ServicesSectionRun from Context Manager */
export async function retryServices(
  ctx: PipelineContext,
): Promise<RetryServicesFromContext>;

export async function retryServices(
  arg: (() => Promise<unknown>) | ServicesSectionRun | PipelineContext,
  maxAttemptsArg = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<ServicesSectionInput> | RetryServicesFromContext> {
  if (typeof arg === "function") {
    return retry<ServicesSectionInput>(
      async () => servicesForValidation(await arg()),
      validateServices,
      { module: "Services", maxAttempts: maxAttemptsArg },
    );
  }

  const run = "services" in arg ? arg : prepareServicesRun(arg);
  const ctx = run.pipeline;
  void run.services;
  const { meta } = ctx;
  const generationProfile = getGenerationProfile(ctx);
  const maxAttempts = generationProfile.maxSectionAttempts;
  if (!meta.plan || !meta.selection) {
    throw new Error("ORCHESTRATOR:services requires plan + selection");
  }

  const built = buildEngineAgentCtx(ctx);
  meta.engineCtx = meta.engineCtx ?? built.engineCtx;
  meta.agentCtx = meta.agentCtx ?? built.agentCtx;

  const stubHero = (): ContentDraft["hero"] => ({
    headline: meta.heroResult?.hero.headline ?? meta.input.businessName,
    subheadline:
      meta.heroResult?.hero.subheadline ??
      meta.input.description.slice(0, 160),
    primaryCTA:
      meta.heroResult?.hero.primaryCTA ??
      meta.plan?.ctaStyle ??
      "Get a free quote",
    secondaryCTA: meta.heroResult?.hero.secondaryCTA ?? "",
    trustBar: meta.heroResult?.hero.trustBar ?? [],
  });

  const stubAbout = (): ContentDraft["about"] => ({
    title:
      meta.aboutResult?.about.title ?? `About ${meta.input.businessName}`,
    text:
      meta.aboutResult?.about.text ??
      meta.aboutResult?.about.paragraphs?.join("\n\n") ??
      meta.input.description,
    paragraphs:
      meta.aboutResult?.about.paragraphs ?? [meta.input.description],
    highlights: meta.aboutResult?.about.highlights ?? [],
  });

  const servicesList = parseServiceList(meta.input.services);
  const plannerServices = meta.brief.serviceFocus.filter(Boolean);
  const skipPrioritizer = shouldSkipServicePrioritizer(
    servicesList,
    plannerServices,
  );

  if (!skipPrioritizer) {
    meta.onProgress?.({
      stage: "service_prioritizer",
      label: "Service Prioritizer",
    });
  }

  const servicePriority = await runServicePrioritizer({
    businessName: meta.input.businessName,
    industry: meta.category || meta.industryPack.label || meta.tradeKey,
    location: meta.input.location,
    description: meta.input.description || "",
    servicesRaw: meta.input.services,
    serviceFocus: meta.brief.serviceFocus,
    userEmail: meta.options.userEmail,
    industryBrief: meta.industryBrief,
    brandPosition: meta.liveDna.brandPosition,
    primaryGoal: meta.liveDna.primaryGoal,
  });

  const brief = { ...meta.brief, servicePriority };
  const engineCtx = { ...(meta.engineCtx ?? built.engineCtx), brief };
  const agentCtx = { ctx: engineCtx, brief, plan: meta.plan! };

  meta.onProgress?.({
    stage: "services_generator",
    label: "Services",
  });

  const stubCta = (): ContentDraft["cta"] => ({
    headline: meta.input.businessName,
    primaryCTA: meta.plan?.ctaStyle ?? meta.liveDna.cta ?? "Get a quote",
    secondaryCTA: meta.input.phone ? `Call ${meta.input.phone}` : "",
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

  const skipAux = generationProfile.skipTestimonialsAndCta;

  const [servicesRetry, testimonials, cta] = await Promise.all([
    retry<ServicesSectionInput>(generateServices, validateServices, {
      module: "Services",
      userEmail: meta.options.userEmail,
      runId: meta.runId,
      maxAttempts,
    }),
    skipAux
      ? Promise.resolve([] as ContentDraft["testimonials"])
      : generateTestimonialsSection(agentCtx),
    skipAux
      ? Promise.resolve(stubCta())
      : generateCtaSection(agentCtx, stubHero()),
  ]);

  const validated = softRetryResult(
    servicesRetry,
    servicesInputFallback({
      businessName: meta.input.businessName,
      category: meta.category || meta.industryPack.label || meta.tradeKey,
      location: meta.input.location,
      services: meta.input.services,
      description: meta.input.description,
    }),
  ).data;

  const draftItems = Array.isArray(validated.items) ? validated.items : [];
  const services = toWebsiteServices(draftItems);

  const content: ContentDraft = {
    hero: stubHero(),
    about: stubAbout(),
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
