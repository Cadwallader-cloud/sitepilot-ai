/**
 * User-facing generation checklist — Sprint 1 product diagram order.
 *
 * Business Form → Business Analyzer → Brand Personality → Website Planner
 * → Template Selector → Theme Selector → Hero → About → Services → FAQ
 * → SEO → QA → Renderer → Preview
 */

export const GENERATION_STEPS = [
  { id: "business-form", label: "Business Form" },
  { id: "business", label: "Business Analyzer" },
  { id: "brand", label: "Brand Personality" },
  { id: "planner", label: "Website Planner" },
  { id: "template", label: "Template Selector" },
  { id: "theme", label: "Theme Selector" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQ" },
  { id: "seo", label: "SEO" },
  { id: "qa", label: "QA" },
  { id: "renderer", label: "Renderer" },
  { id: "preview", label: "Preview" },
] as const;

export type GenerationStepId = (typeof GENERATION_STEPS)[number]["id"];

export type GenerationStepStatus = "pending" | "active" | "done" | "error";

export type GenerationStepState = Record<
  GenerationStepId,
  GenerationStepStatus
>;

const STAGE_TO_STEP: Partial<Record<string, GenerationStepId>> = {
  business_analyzer: "business",
  competitor_intelligence: "business",
  brand_personality: "brand",
  website_planner: "planner",
  layout_selector_ai: "planner",
  seo_planner: "planner",
  template_selector: "template",
  template_selector_ai: "template",
  theme_selector: "theme",
  theme_selector_ai: "theme",
  design_planner: "theme",
  hero_headlines: "hero",
  hero_select: "hero",
  hero_refine: "hero",
  hero_single: "hero",
  hero_retry: "hero",
  about_variants: "about",
  about_select: "about",
  about_single: "about",
  about_retry: "about",
  service_prioritizer: "services",
  services_generator: "services",
  services_retry: "services",
  faq_generator: "faq",
  faq_retry: "faq",
  seo_ai: "seo",
  seo_generator: "seo",
  seo_retry: "seo",
  content_review: "qa",
  content_review_healing: "qa",
  assemble: "qa",
  json_validator: "qa",
  copywriting_engine: "qa",
  visual_ai: "qa",
};

const LABEL_TO_STEP: Record<string, GenerationStepId> = {
  Hero: "hero",
  About: "about",
  Services: "services",
  FAQ: "faq",
  SEO: "seo",
  "Theme Selector": "theme",
  "Theme Engine": "theme",
  "Template Selector": "template",
  "Website JSON": "qa",
  "JSON Validator": "qa",
  "Content Review": "qa",
};

const ORCHESTRATOR_STEP_IDS = new Set<GenerationStepId>([
  "business",
  "brand",
  "planner",
  "hero",
  "about",
  "services",
  "faq",
  "seo",
  "qa",
]);

export function initialGenerationSteps(): GenerationStepState {
  return Object.fromEntries(
    GENERATION_STEPS.map((s) => [s.id, "pending" as const]),
  ) as GenerationStepState;
}

export function isGenerationStepId(value: string): value is GenerationStepId {
  return GENERATION_STEPS.some((s) => s.id === value);
}

function stepIndex(id: GenerationStepId): number {
  return GENERATION_STEPS.findIndex((s) => s.id === id);
}

function markPriorDone(
  next: GenerationStepState,
  step: GenerationStepId,
  skipError = true,
): void {
  for (const s of GENERATION_STEPS) {
    if (s.id === step) break;
    if (skipError && next[s.id] === "error") continue;
    if (next[s.id] !== "error") next[s.id] = "done";
  }
}

export function resolveProgressStep(payload: {
  stage?: string;
  label?: string;
  step?: string;
}): GenerationStepId | null {
  if (payload.step && isGenerationStepId(payload.step)) {
    return payload.step;
  }
  if (payload.stage && STAGE_TO_STEP[payload.stage]) {
    return STAGE_TO_STEP[payload.stage]!;
  }
  if (payload.label && LABEL_TO_STEP[payload.label]) {
    return LABEL_TO_STEP[payload.label]!;
  }
  if (payload.stage === "content_generator" && payload.label) {
    return LABEL_TO_STEP[payload.label] ?? null;
  }
  return null;
}

/** Apply pipeline / progress events onto checklist state */
export function applyGenerationEvent(
  prev: GenerationStepState,
  event: {
    type: string;
    step?: string;
    stage?: string;
    label?: string;
  },
): GenerationStepState {
  const next = { ...prev };

  if (event.type === "generation:start") {
    next["business-form"] = "done";
    next.business = "active";
    return next;
  }

  if (event.type === "stage:progress") {
    const step = resolveProgressStep(event);
    if (!step) return prev;
    markPriorDone(next, step);
    next[step] = "active";
    return next;
  }

  if (event.type === "generation:preview") {
    for (const s of GENERATION_STEPS) {
      if (s.id === "preview") break;
      if (next[s.id] !== "error") next[s.id] = "done";
    }
    next.renderer = "done";
    next.preview = "done";
    return next;
  }

  const step = event.step;
  if (!step || !isGenerationStepId(step)) return prev;

  if (event.type === "step:start") {
    markPriorDone(next, step);
    if (ORCHESTRATOR_STEP_IDS.has(step)) {
      next["business-form"] = "done";
    }
    if (step === "template" || stepIndex(step) > stepIndex("template")) {
      next.template = next.template === "error" ? "error" : "done";
    }
    if (step === "theme" || stepIndex(step) > stepIndex("theme")) {
      next.theme = next.theme === "error" ? "error" : "done";
    }
    next[step] = "active";
    return next;
  }

  if (event.type === "step:success") {
    next[step] = "done";
    if (step === "planner") {
      next.template = next.template === "error" ? "error" : "done";
    }
    if (step === "qa") {
      next.theme = next.theme === "error" ? "error" : "done";
      next.renderer = "active";
    }
    return next;
  }

  if (event.type === "step:error") {
    next[step] = "error";
    return next;
  }

  if (event.type === "step:retry") {
    if (next[step] === "pending" || next[step] === "done") {
      next[step] = "active";
    }
  }

  if (event.type === "pipeline:complete") {
    for (const s of GENERATION_STEPS) {
      if (s.id === "preview") break;
      if (next[s.id] !== "error") next[s.id] = "done";
    }
    next.renderer = "active";
  }

  return next;
}
