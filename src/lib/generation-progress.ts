/**
 * User-facing generation checklist (maps orchestrator step ids → copy).
 */

export const GENERATION_STEPS = [
  { id: "business", label: "Understanding your business..." },
  { id: "brand", label: "Creating your brand..." },
  { id: "planner", label: "Planning website..." },
  { id: "hero", label: "Writing hero section..." },
  { id: "about", label: "Writing about section..." },
  { id: "services", label: "Writing services..." },
  { id: "faq", label: "Writing FAQ..." },
  { id: "seo", label: "Optimizing SEO..." },
  { id: "qa", label: "Finishing your website..." },
] as const;

export type GenerationStepId = (typeof GENERATION_STEPS)[number]["id"];

export type GenerationStepStatus = "pending" | "active" | "done" | "error";

export type GenerationStepState = Record<
  GenerationStepId,
  GenerationStepStatus
>;

export function initialGenerationSteps(): GenerationStepState {
  return Object.fromEntries(
    GENERATION_STEPS.map((s) => [s.id, "pending" as const]),
  ) as GenerationStepState;
}

export function isGenerationStepId(value: string): value is GenerationStepId {
  return GENERATION_STEPS.some((s) => s.id === value);
}

/** Apply a pipeline event onto checklist state */
export function applyGenerationEvent(
  prev: GenerationStepState,
  event: { type: string; step?: string },
): GenerationStepState {
  const step = event.step;
  if (!step || !isGenerationStepId(step)) return prev;

  const next = { ...prev };

  if (event.type === "step:start") {
    // Mark earlier steps done if we skipped catching their success
    for (const s of GENERATION_STEPS) {
      if (s.id === step) break;
      if (next[s.id] !== "error") next[s.id] = "done";
    }
    next[step] = "active";
    return next;
  }

  if (event.type === "step:success") {
    next[step] = "done";
    return next;
  }

  if (event.type === "step:error") {
    next[step] = "error";
    return next;
  }

  if (event.type === "step:retry" && next[step] === "pending") {
    next[step] = "active";
  }

  return next;
}
