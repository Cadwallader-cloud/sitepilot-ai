import type { SiteLayoutSection } from "@/lib/site-types";
import type { TemplateVariant } from "@/lib/template-library";

/** Curated page skeleton ids — AI picks one, Layout Engine resolves sections. */
export type LayoutId = "roofing" | "restaurant" | "dentist" | "generic";

export type LayoutDefinition = {
  id: LayoutId;
  name: string;
  /** Industry / trade aliases for deterministic routing */
  industries: readonly string[];
  sections: readonly SiteLayoutSection[];
  stickyCTA: boolean;
  floatingPhone: boolean;
  /** Preferred hero shell variant when planner has no hint */
  heroVariant: TemplateVariant;
  rationale: readonly string[];
};

export type LayoutPlan = {
  layoutId: LayoutId;
  layout: LayoutDefinition;
  sections: SiteLayoutSection[];
  stickyCTA: boolean;
  floatingPhone: boolean;
  heroVariant: TemplateVariant;
  rationale: string[];
};

export type AiLayoutSelection = {
  layout: LayoutId;
};

export type LayoutPlannerHints = {
  layout?: unknown;
  sections?: unknown;
  variant?: unknown;
};

export type LayoutPlannerInput = {
  industry?: string;
  industryId?: string;
  tradeKey?: string;
  hints?: LayoutPlannerHints;
};
