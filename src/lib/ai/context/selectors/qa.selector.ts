/**
 * QA section context — the only agent that sees everything.
 *
 * QA sees ONLY:
 *   { website }
 *
 * Full Website v2 (all pages, sections, seo, theme, business, branding).
 * Engine scratch stays on PipelineContext.meta — not exposed here.
 */

import type { Website } from "../../../website";
import type { TemplateBlocks } from "../../../template-engine";
import { applyThemePatch } from "../../../website-ownership";
import type { PipelineContext } from "../../orchestrator/context";
import type { SharedContext } from "../shared";

export const QA_CONTEXT_KEYS = ["website"] as const;

export type QAContext = {
  website: Website;
};

/** Same gate as QAStep — prerequisites must exist before QA runs. */
export function assertQAReady(ctx: PipelineContext): void {
  const { meta } = ctx;
  if (
    !meta.plan ||
    !meta.content ||
    !meta.seo ||
    !meta.templateId ||
    !meta.aboutResult ||
    !meta.personality
  ) {
    throw new Error("ORCHESTRATOR:qa requires content + seo + plan");
  }
}

/** QA-only slice — full website, single field. */
export function selectQA(
  ctx: PipelineContext,
  shared?: SharedContext,
): QAContext {
  assertQAReady(ctx);
  const core = shared ?? {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
  return {
    website: {
      ...ctx.website,
      business: core.business,
      branding: core.branding,
    },
  };
}

export type QAThemePatch = {
  id: string;
  blocks: TemplateBlocks;
};

export function applyQATheme(website: Website, patch: QAThemePatch): Website {
  return applyThemePatch(website, {
    id: patch.id,
    blocks: patch.blocks,
  });
}

export function applyQAResult(
  ctx: PipelineContext,
  gated: Website,
): PipelineContext {
  return {
    ...ctx,
    business: gated.business,
    branding: gated.branding,
    website: gated,
  };
}
