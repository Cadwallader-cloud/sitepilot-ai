import type { ComponentType } from "react";
import type { ServicesTemplateId } from "@/lib/template-engine";
import type { ServicesTemplateProps } from "@/components/templates/types";
import { ServicesSection } from "./ServicesSection";

function servicesTemplate(
  template: ServicesTemplateId,
): ComponentType<ServicesTemplateProps> {
  return function ServicesTemplate(props: ServicesTemplateProps) {
    return <ServicesSection template={template} {...props} />;
  };
}

export const ServicesRegistry: Record<
  ServicesTemplateId,
  ComponentType<ServicesTemplateProps>
> = {
  "services-01": servicesTemplate("services-01"),
  "services-02": servicesTemplate("services-02"),
  "services-03": servicesTemplate("services-03"),
};

export const Services01 = ServicesRegistry["services-01"];
export const Services02 = ServicesRegistry["services-02"];
export const Services03 = ServicesRegistry["services-03"];

/** @deprecated Use ServicesRegistry */
export const SERVICES_TEMPLATES = ServicesRegistry;
