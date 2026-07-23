import type { EngineContext } from "../../ai-engine/types";
import type { PromptContextCache } from "./prompt-context-cache";
import type { PipelineContext } from "../orchestrator/context";

/** Shared engine/agent bag — each content step can build this without waiting on Hero. */
export function buildEngineAgentCtx(ctx: PipelineContext): {
  engineCtx: EngineContext;
  agentCtx: {
    ctx: EngineContext;
    brief: NonNullable<PipelineContext["meta"]["brief"]>;
    plan: NonNullable<PipelineContext["meta"]["plan"]>;
    promptCache?: PromptContextCache;
  };
} {
  if (!ctx.meta.plan) {
    throw new Error("ORCHESTRATOR:buildEngineAgentCtx requires plan");
  }

  const engineCtx: EngineContext = {
    input: ctx.meta.input,
    options: { ...ctx.meta.options, runId: ctx.meta.runId },
    runId: ctx.meta.runId,
    brief: ctx.meta.brief,
    plan: ctx.meta.plan,
  };

  return {
    engineCtx,
    agentCtx: {
      ctx: engineCtx,
      brief: ctx.meta.brief,
      plan: ctx.meta.plan,
      promptCache: ctx.meta.promptCache,
    },
  };
}
