export {
  HERO_TEMPLATE_IDS,
  NAVBAR_TEMPLATE_IDS,
  SERVICES_TEMPLATE_IDS,
  FAQ_TEMPLATE_IDS,
  ABOUT_TEMPLATE_IDS,
  FOOTER_TEMPLATE_IDS,
  TEMPLATE_BLOCK_KINDS,
  type HeroTemplateId,
  type NavbarTemplateId,
  type ServicesTemplateId,
  type FaqTemplateId,
  type AboutTemplateId,
  type FooterTemplateId,
  type TemplateBlocks,
  type TemplateBlockKind,
} from "./ids";

export { DEFAULT_TEMPLATE_BLOCKS } from "./defaults";
export {
  selectTemplateBlocks,
  normalizeTemplateBlocks,
  isValidTemplateBlockId,
} from "./select-blocks";
export {
  TEMPLATE_CATALOG,
  TEMPLATE_RULES_PROMPT,
  enforceTemplateCatalog,
  findInvalidTemplatePicks,
  logRejectedTemplatePicks,
  type InvalidTemplatePick,
} from "./template-rules";
export {
  parseAiTemplateSelection,
  type AiTemplateBlockSelection,
  type AiTemplateSelectionResponse,
} from "./parse-ai-template";
export {
  TEMPLATE_METADATA,
  getTemplateMetadata,
  templateMetadataForKind,
  templateMetadataCatalogForPrompt,
  isKnownTemplateMetadataId,
  type TemplateMetadata,
  type TemplateMetadataPromptEntry,
  type TemplateStyle,
  type TemplateLayout,
  type TemplateImagePosition,
  type TemplateComplexity,
} from "./metadata";
