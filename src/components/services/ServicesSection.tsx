import type { ReactNode } from "react";
import type { ServicesTemplateId } from "@/lib/template-engine";
import {
  Container,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
  marginTop,
} from "@/components/ui";
import type { ServicesTemplateProps } from "@/components/templates/types";
import { ServiceCard } from "./components/ServiceCard";
import { serviceCardVariant } from "./service-card-variants";

export type ServicesSectionProps = ServicesTemplateProps & {
  template: ServicesTemplateId;
};

function ServicesHeader({
  label,
  locationLink,
  tone = "dark",
}: {
  label: string;
  locationLink?: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <>
      <Heading level={2} size="md" tone={tone}>
        {label}
      </Heading>
      {locationLink ? (
        <Text size="sm" className={marginTop.tight}>
          Across {locationLink}
        </Text>
      ) : null}
    </>
  );
}

function ServicesFeaturedGrid({
  items,
  label,
  locationLink,
  template,
}: ServicesSectionProps) {
  const featured = items.find((s) => s.featured) ?? items[0];
  const secondary = items.filter((s) => s !== featured);
  const variant = serviceCardVariant(template);

  return (
    <Section id="services" template={template} spacing="md" className="border-t border-zinc-100">
      <Container>
        <ServicesHeader label={label ?? "Services"} locationLink={locationLink} />
        {featured ? (
          <ServiceCard
            service={featured}
            variant={variant}
            emphasis="featured"
            className={marginTop.lg}
          />
        ) : null}
        {secondary.length > 0 ? (
          <Grid cols={3} gap="lg" className={marginTop.md}>
            {secondary.map((service) => (
              <ServiceCard key={service.title} service={service} variant={variant} />
            ))}
          </Grid>
        ) : null}
      </Container>
    </Section>
  );
}

function ServicesEqualGrid({ items, label, template }: ServicesSectionProps) {
  const variant = serviceCardVariant(template);

  return (
    <Section id="services" template={template} spacing="md">
      <Container maxWidth="2xl" align="center">
        <ServicesHeader label={label ?? "Services"} />
        <Grid cols={3} gap="md" className={marginTop.xl}>
          {items.map((service) => (
            <ServiceCard key={service.title} service={service} variant={variant} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

function ServicesAccentList({ items, label, template }: ServicesSectionProps) {
  const variant = serviceCardVariant(template);

  return (
    <Section id="services" template={template} spacing="md" className="bg-zinc-950 text-white">
      <Container>
        <ServicesHeader label={label ?? "Services"} tone="light" />
        <ul className={`divide-y divide-white/10 ${marginTop.lg}`}>
          {items.map((service) => (
            <li key={service.title}>
              <ServiceCard service={service} variant={variant} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Unified services section — layout per template, cards via ServiceCard variant. */
export function ServicesSection({ template, ...props }: ServicesSectionProps) {
  if (template === "services-01") {
    return <ServicesFeaturedGrid template={template} {...props} />;
  }
  if (template === "services-02") {
    return <ServicesEqualGrid template={template} {...props} />;
  }
  return <ServicesAccentList template={template} {...props} />;
}
