/**
 * Component Registry rule — every block + variant sub-component is registered.
 */

export {
  assertRegistryParity,
  COMPONENT_REGISTRY_CHAIN,
  COMPONENT_REGISTRY_RULE,
  ComponentRegistry,
  ComponentVariantRegistry,
  registryComponent,
  registryNameForTemplateId,
  registryVariant,
  resolveRegisteredBlockComponent,
  serviceCardVariantForRegistry,
  TEMPLATE_ID_REGISTRY_NAME,
  type RegistryComponentName,
  type RegistryVariantName,
  type TemplateIdRegistryName,
} from "@/components/registry";

export const REGISTERED_BLOCK_COMPONENTS = [
  "Hero01",
  "Hero02",
  "Hero03",
  "Hero04",
  "Hero05",
  "Navbar01",
  "Navbar02",
  "Services01",
  "Services02",
  "Services03",
  "About01",
  "About02",
  "Footer01",
  "Footer02",
  "FAQAccordion01",
  "FAQGrid01",
  "ServiceCard",
] as const;

export const REGISTERED_VARIANT_COMPONENTS = [
  "ServiceCard01",
  "ServiceCard02",
  "ServiceCard03",
] as const;
