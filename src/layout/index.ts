/**
 * Layout Engine — AI picks preset id; registry resolves section order.
 */

export type {
  AiLayoutSelection,
  LayoutDefinition,
  LayoutId,
  LayoutPlan,
  LayoutPlannerHints,
  LayoutPlannerInput,
} from "./types";

export {
  LAYOUT_IDS,
  LayoutRegistry,
  getLayout,
  isLayoutId,
  listRegisteredLayouts,
  normalizeLayoutId,
  RoofingLayout,
  RestaurantLayout,
  DentistLayout,
  GenericLayout,
} from "./registry";

export {
  LAYOUT_ENGINE_RULE,
  buildLayoutPlan,
  clampLayoutToTemplate,
  layoutEnginePromptBlock,
  layoutFieldsFromPreset,
  layoutUxBrief,
  parseAiLayoutSelection,
  parseAiLayoutSelectionOrThrow,
  resolveLayoutPreset,
  resolveLayoutVariant,
  suggestLayoutId,
} from "./engine";

export { planLayout, type PlannedLayout } from "./planner";

export { roofingLayout } from "./layouts/roofing";
export { restaurantLayout } from "./layouts/restaurant";
export { dentistLayout } from "./layouts/dentist";
export { genericLayout } from "./layouts/generic";
