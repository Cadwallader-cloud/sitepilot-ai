import type { ServicesTemplateId } from "@/lib/template-engine";
import { css } from "@/components/ui/tokens";

/** ServiceCard visual variants — AI picks via services-0X template id. */
export const SERVICE_CARD_VARIANTS = ["1", "2", "3"] as const;

export type ServiceCardVariant = (typeof SERVICE_CARD_VARIANTS)[number];

/** Template catalog id → card variant (AI never invents layouts). */
export const SERVICE_CARD_VARIANT_BY_TEMPLATE: Record<
  ServicesTemplateId,
  ServiceCardVariant
> = {
  "services-01": "1",
  "services-02": "2",
  "services-03": "3",
};

export function serviceCardVariant(template: ServicesTemplateId): ServiceCardVariant {
  return SERVICE_CARD_VARIANT_BY_TEMPLATE[template];
}

/** Static surface classes per card variant. */
export const serviceCardSurfaceClass: Record<ServiceCardVariant, string> = {
  "1": `${css.borderAll} ${css.surface}`,
  "2": `${css.borderAll} bg-[color-mix(in_srgb,var(--surface)_88%,var(--background))]`,
  "3": "border-transparent bg-transparent",
};
