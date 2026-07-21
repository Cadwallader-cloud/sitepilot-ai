import { dentistLayout } from "./layouts/dentist";
import { genericLayout } from "./layouts/generic";
import { restaurantLayout } from "./layouts/restaurant";
import { roofingLayout } from "./layouts/roofing";
import type { LayoutDefinition, LayoutId } from "./types";

/** Hand-authored layouts — preset id → section order + UX rules. */
export const LayoutRegistry = {
  roofing: roofingLayout,
  restaurant: restaurantLayout,
  dentist: dentistLayout,
  generic: genericLayout,
} as const satisfies Record<LayoutId, LayoutDefinition>;

export const LAYOUT_IDS = Object.keys(LayoutRegistry) as LayoutId[];

const LEGACY_LAYOUT_ALIASES = {
  trade: "roofing",
  food: "restaurant",
  medical: "dentist",
  default: "generic",
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

export function getLayout(id: LayoutId): LayoutDefinition {
  return LayoutRegistry[id];
}

export function listRegisteredLayouts(): LayoutDefinition[] {
  return LAYOUT_IDS.map((id) => getLayout(id));
}

export {
  roofingLayout as RoofingLayout,
  restaurantLayout as RestaurantLayout,
  dentistLayout as DentistLayout,
  genericLayout as GenericLayout,
};
