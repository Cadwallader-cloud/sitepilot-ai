/**
 * Prompt Context Cache — core business/brand fields built once per generation run.
 *
 * Reused by Hero, About, Services, FAQ, Planner, and retry paths without
 * re-extracting or re-stringifying the same prompt inputs.
 */

import type { PipelineContext } from "../orchestrator/context";
import { recordCacheTelemetry } from "../telemetry/stage-telemetry";

export type PromptContextFields = {
  /** Business name + category context */
  business: string;
  /** Brand personality brief / voice */
  brand: string;
  location: string;
  tone: string;
  audience: string;
  /** uniqueAngle / positioning / advantages */
  usp: string;
  services: string;
};

export type PromptContextCache = PromptContextFields & {
  dnaJson: string;
  /** Pre-formatted block for injection into user prompts */
  block: string;
};

function categoryLabel(ctx: PipelineContext): string {
  const { meta } = ctx;
  return meta.category || meta.industryPack.label || meta.tradeKey;
}

function audienceFrom(ctx: PipelineContext): string {
  const planAudience = ctx.meta.plan?.targetAudience?.trim();
  if (planAudience) return planAudience;
  if (ctx.meta.liveDna.targetAudience.length) {
    return ctx.meta.liveDna.targetAudience.join(", ");
  }
  if (ctx.meta.brief?.idealCustomer) {
    return ctx.meta.brief.idealCustomer;
  }
  return "Local customers";
}

function uspFrom(ctx: PipelineContext): string {
  const parts = [
    ctx.meta.brief.uniqueAngle?.trim(),
    ctx.meta.plan?.positioning?.trim(),
    ...(ctx.meta.liveDna.advantages ?? []).map((a) => a.trim()).filter(Boolean),
  ].filter(Boolean);
  if (parts.length) return parts.join(" — ");
  return ctx.meta.liveDna.brandPosition?.trim() || "";
}

function servicesFrom(ctx: PipelineContext): string {
  const raw = ctx.meta.input.services.trim();
  if (raw) return raw;
  if (ctx.business.services.length) return ctx.business.services.join(", ");
  return "";
}

function locationFrom(ctx: PipelineContext): string {
  return (
    ctx.business.location?.trim() ||
    ctx.meta.input.location?.trim() ||
    ctx.meta.brief?.city?.trim() ||
    ""
  );
}

function toneFrom(ctx: PipelineContext): string {
  return (
    ctx.branding.tone?.trim() ||
    ctx.meta.liveDna.tone?.trim() ||
    ctx.meta.brief.tone ||
    "Professional"
  );
}

/** Stable prompt block — same format everywhere. */
export function formatPromptContextBlock(
  fields: PromptContextFields & { dnaJson: string },
): string {
  return [
    `Business: ${fields.business}`,
    "Brand:",
    fields.brand,
    "",
    `Location: ${fields.location}`,
    `Tone: ${fields.tone}`,
    `Audience: ${fields.audience}`,
    `USP: ${fields.usp}`,
    `Services: ${fields.services}`,
    "",
    "Brand Profile:",
    fields.dnaJson,
  ]
    .filter((line, i, arr) => line !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n");
}

export function buildPromptContextCache(ctx: PipelineContext): PromptContextCache {
  const category = categoryLabel(ctx);
  const businessName = ctx.meta.input.businessName.trim() || ctx.business.name.trim();
  const business = businessName
    ? `${businessName} (${category})`
    : category;

  const fields: PromptContextFields = {
    business,
    brand: ctx.meta.personalityBrief,
    location: locationFrom(ctx),
    tone: toneFrom(ctx),
    audience: audienceFrom(ctx),
    usp: uspFrom(ctx),
    services: servicesFrom(ctx),
  };

  const dnaJson = JSON.stringify(ctx.meta.liveDna, null, 2);

  return {
    ...fields,
    dnaJson,
    block: formatPromptContextBlock({ ...fields, dnaJson }),
  };
}

/** Build once per run and store on meta.promptCache. */
export function ensurePromptCache(ctx: PipelineContext): PipelineContext {
  if (ctx.meta.promptCache) {
    recordCacheTelemetry({ stage: "prompt_cache", cacheHit: true });
    return ctx;
  }
  recordCacheTelemetry({ stage: "prompt_cache", cacheHit: false });
  const promptCache = buildPromptContextCache(ctx);
  return {
    ...ctx,
    meta: {
      ...ctx.meta,
      promptCache,
    },
  };
}
