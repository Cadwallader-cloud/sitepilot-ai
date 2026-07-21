import { cleaning } from "./layouts/cleaning";
import { dentist } from "./layouts/dentist";
import { electrician } from "./layouts/electrician";
import { generic } from "./layouts/generic";
import { hvac } from "./layouts/hvac";
import { landscaping } from "./layouts/landscaping";
import { lawyer } from "./layouts/lawyer";
import { plumber } from "./layouts/plumber";
import { realEstate } from "./layouts/real-estate";
import { restaurant } from "./layouts/restaurant";
import { roofing } from "./layouts/roofing";
import type { LayoutId, LayoutPreset } from "./types";

/** Hand-authored industry layouts — preset id → section order + UX rules. */
export const LayoutRegistry = {
  "roofing-modern": roofing,
  "plumber-modern": plumber,
  "hvac-modern": hvac,
  "electrician-modern": electrician,
  "landscaping-modern": landscaping,
  "cleaning-modern": cleaning,
  "dentist-modern": dentist,
  "restaurant-modern": restaurant,
  "lawyer-modern": lawyer,
  "real-estate-modern": realEstate,
  "generic-standard": generic,
} as const satisfies Record<LayoutId, LayoutPreset>;

export const INDUSTRY_LAYOUT_IDS = [
  "roofing-modern",
  "plumber-modern",
  "hvac-modern",
  "electrician-modern",
  "landscaping-modern",
  "cleaning-modern",
  "dentist-modern",
  "restaurant-modern",
  "lawyer-modern",
  "real-estate-modern",
] as const satisfies readonly LayoutId[];

export const LAYOUT_IDS = Object.keys(LayoutRegistry) as LayoutId[];

const LEGACY_LAYOUT_ALIASES = {
  roofing: "roofing-modern",
  plumbing: "plumber-modern",
  plumber: "plumber-modern",
  hvac: "hvac-modern",
  electrician: "electrician-modern",
  landscaping: "landscaping-modern",
  cleaning: "cleaning-modern",
  restaurant: "restaurant-modern",
  dentist: "dentist-modern",
  lawyer: "lawyer-modern",
  legal: "lawyer-modern",
  "real estate": "real-estate-modern",
  realtor: "real-estate-modern",
  real_estate: "real-estate-modern",
  generic: "generic-standard",
  trade: "roofing-modern",
  food: "restaurant-modern",
  medical: "dentist-modern",
  default: "generic-standard",
} as const satisfies Record<string, LayoutId>;

export function isLayoutId(value: unknown): value is LayoutId {
  return typeof value === "string" && value in LayoutRegistry;
}

export function normalizeLayoutId(value: string): LayoutId | null {
  const trimmed = value.trim().toLowerCase();
  if (isLayoutId(trimmed)) return trimmed;
  if (trimmed in LEGACY_LAYOUT_ALIASES) {
    return LEGACY_LAYOUT_ALIASES[trimmed as keyof typeof LEGACY_LAYOUT_ALIASES];
  }
  return null;
}

export function getLayout(id: LayoutId): LayoutPreset {
  return LayoutRegistry[id];
}

export function listRegisteredLayouts(): LayoutPreset[] {
  return LAYOUT_IDS.map((id) => getLayout(id));
}

export {
  cleaning,
  dentist,
  electrician,
  generic,
  hvac,
  landscaping,
  lawyer,
  plumber,
  realEstate,
  restaurant,
  roofing,
};
