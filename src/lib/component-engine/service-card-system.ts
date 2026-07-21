/**
 * Service Card System — AI picks services-0X; React renders ServiceCard variant.
 */

export {
  SERVICE_CARD_VARIANTS,
  SERVICE_CARD_VARIANT_BY_TEMPLATE,
  serviceCardVariant,
  type ServiceCardVariant,
} from "@/components/services/service-card-variants";

export const SERVICE_CARD_SYSTEM_RULE =
  "Services use ServiceCard variants 1–3; AI selects template id only." as const;

export const SERVICES_TEMPLATE_TO_CARD_VARIANT = {
  "services-01": "1",
  "services-02": "2",
  "services-03": "3",
} as const;
