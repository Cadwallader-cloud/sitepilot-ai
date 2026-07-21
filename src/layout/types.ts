import type { SiteLayoutSection } from "@/lib/site-types";
import type { TemplateVariant } from "@/lib/template-library";

/** One renderable page band — component registry id + allowed variants. */
export interface LayoutSection {
  id: string;
  component: string;
  required: boolean;
  priority: number;
  variants: string[];
}

/** AI / planner rule — optional sections can be disabled. */
export interface SectionRule {
  section: string;
  required: boolean;
}

/** Curated page skeleton — AI picks id, Layout Engine resolves sections. */
export interface Layout {
  id: string;
  name: string;
  industry: string[];
  sections: LayoutSection[];
}

/** Curated layout ids registered in LayoutRegistry. */
export type LayoutId =
  | "roofing-modern"
  | "plumber-modern"
  | "hvac-modern"
  | "electrician-modern"
  | "landscaping-modern"
  | "cleaning-modern"
  | "dentist-modern"
  | "restaurant-modern"
  | "lawyer-modern"
  | "real-estate-modern"
  | "generic-standard";

/** Registry preset — Layout plus engine UX defaults. */
export type LayoutPreset = Layout & {
  id: LayoutId;
  stickyCTA: boolean;
  floatingPhone: boolean;
  heroVariant: TemplateVariant;
  rationale: readonly string[];
};

/** @deprecated Use LayoutPreset */
export type LayoutDefinition = LayoutPreset;

export type LayoutPlan = {
  layoutId: LayoutId;
  layout: LayoutPreset;
  sections: LayoutSection[];
  siteSections: SiteLayoutSection[];
  stickyCTA: boolean;
  floatingPhone: boolean;
  heroVariant: TemplateVariant;
  rationale: string[];
};

export type AiLayoutSelection = {
  layout: LayoutId;
  /** Optional overrides — { section: "faq", required: false } disables FAQ */
  sectionRules?: SectionRule[];
  /** Optional reorder — ["hero", "services", "about", "faq"] */
  sectionOrder?: string[];
};

export type LayoutPlannerHints = {
  layout?: unknown;
  sections?: unknown;
  sectionRules?: unknown;
  sectionOrder?: unknown;
  variant?: unknown;
};

export type LayoutPlannerInput = {
  industry?: string;
  industryId?: string;
  tradeKey?: string;
  hints?: LayoutPlannerHints;
};
