/**
 * Layout Engine — AI picks preset id; registry resolves section order.
 */

export type {
  AiLayoutSelection,
  Layout,
  LayoutDefinition,
  LayoutId,
  LayoutPlan,
  LayoutPlannerHints,
  LayoutPlannerInput,
  LayoutPreset,
  LayoutSection,
  SectionRule,
} from "./types";

export {
  INDUSTRY_LAYOUT_IDS,
  LAYOUT_IDS,
  LayoutRegistry,
  cleaning,
  dentist,
  electrician,
  generic,
  getLayout,
  hvac,
  isLayoutId,
  landscaping,
  lawyer,
  listRegisteredLayouts,
  normalizeLayoutId,
  plumber,
  realEstate,
  restaurant,
  roofing,
} from "./registry";

export {
  SECTION_COMPONENT_DEFAULTS,
  layoutSection,
  sortLayoutSections,
} from "./sections";

export type {
  LayoutContentInput,
  LayoutContentSignals,
} from "./dynamic-sections";

export {
  applyDynamicLayoutSections,
  applyDynamicSiteSectionIds,
  layoutContentSignalsFromContent,
  layoutContentSignalsFromSite,
  shouldIncludeDynamicSection,
} from "./dynamic-sections";

export {
  applySectionRules,
  filterDisabledSections,
  LOCKED_SECTION_IDS,
  parseAiSectionRule,
  parseAiSectionRules,
  resolveSectionsWithRules,
  SECTION_RULES_ENGINE_RULE,
  sectionRulesPromptBlock,
} from "./section-rules";

export {
  parseSectionOrder,
  reorderLayoutSections,
  reorderPreservedComponents,
  REORDER_ENGINE_RULE,
  reorderPromptBlock,
} from "./reorder";

export {
  applySmartLayoutRules,
  getSmartLayoutRules,
  SMART_LAYOUT_RULES,
  SMART_RULES_ENGINE_RULE,
  smartRulePreservedComponents,
  smartRulesPromptBlock,
  smartSectionLabel,
  type SmartLayoutRules,
  type SmartOrderConstraint,
  type SmartSectionInsert,
} from "./smart-rules";

export {
  assertNoHtmlLayoutFields,
  isAiLayoutSelection,
  parseAiLayoutSelection,
  parseAiLayoutSelectionOrThrow,
  resolveLayoutId,
} from "./parse-ai-layout";

export {
  LAYOUT_ENGINE_RULE,
  buildLayoutPlan,
  clampLayoutToTemplate,
  layoutEnginePromptBlock,
  layoutFieldsFromPreset,
  layoutSectionsToSiteSections,
  layoutUxBrief,
  resolveLayout,
  resolveLayoutFromAi,
  resolveLayoutPreset,
  resolveLayoutVariant,
  suggestLayoutId,
} from "./engine";

export { planLayout, type PlannedLayout } from "./planner";
