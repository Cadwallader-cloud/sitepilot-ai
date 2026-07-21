"use client";

import { ServiceIcon } from "@/components/service-icon";
import {
  Card,
  css,
  Heading,
  Stack,
  Text,
  marginTop,
  paddingY,
  radius,
  size,
  spacing,
} from "@/components/ui";
import { useThemeStyle } from "@/components/ui/theme-context";
import type { Service } from "@/lib/website";
import { type ServiceCardVariant } from "../service-card-variants";

export type ServiceCardProps = {
  service: Service;
  variant: ServiceCardVariant;
  /** Variant 1 only — featured primary service card. */
  emphasis?: "featured" | "default";
  className?: string;
};

function ServiceIconBadge({
  icon,
  variant,
  emphasis = "default",
}: {
  icon: string;
  variant: ServiceCardVariant;
  emphasis?: "featured" | "default";
}) {
  const { tint } = useThemeStyle();

  const boxSize =
    variant === "1" && emphasis === "featured"
      ? size.serviceIconLg
      : variant === "1"
        ? size.serviceIconSm
        : variant === "2"
          ? "h-11 w-11"
          : size.serviceIconMd;

  const glyphSize = variant === "1" && emphasis === "featured" ? "h-6 w-6" : "h-5 w-5";
  const alpha = variant === "3" ? "33" : variant === "2" ? "18" : "14";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${radius.md} ${boxSize}`}
      style={tint(alpha)}
    >
      <ServiceIcon name={icon} className={glyphSize} />
    </span>
  );
}

function ServiceCardVariant1({
  service,
  emphasis = "default",
  className = "",
}: Omit<ServiceCardProps, "variant">) {
  if (emphasis === "featured") {
    return (
      <div data-component="ServiceCard" data-variant="1" data-emphasis="featured" className={className}>
        <Card variant="outline" padding="lg">
          <Stack
            direction={{ mobile: "column", tablet: "row" }}
            gap="lg"
            align={{ tablet: "start" }}
          >
            <ServiceIconBadge icon={service.icon} variant="1" emphasis="featured" />
            <Stack gap="sm" className="min-w-0 flex-1">
              <Text as="p" size="xs" tone="muted" className="font-medium uppercase tracking-[0.14em]">
                Primary service
              </Text>
              <Heading level={3} size="sm" tone="brand">
                {service.title}
              </Heading>
              <Text className="max-w-2xl">{service.description}</Text>
            </Stack>
          </Stack>
        </Card>
      </div>
    );
  }

  return (
    <div data-component="ServiceCard" data-variant="1" data-emphasis="default" className={className}>
      <Card variant="outline" padding="sm">
        <Stack direction="row" gap="md" align="start">
          <ServiceIconBadge icon={service.icon} variant="1" />
          <Stack gap="xs">
            <Heading level={3} size="sm">
              {service.title}
            </Heading>
            <Text size="sm">{service.description}</Text>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}

function ServiceCardVariant2({
  service,
  className = "",
}: Omit<ServiceCardProps, "variant" | "emphasis">) {
  return (
    <article data-component="ServiceCard" data-variant="2" className={className}>
      <Card variant="elevated" padding="md">
        <ServiceIconBadge icon={service.icon} variant="2" />
        <Heading level={3} size="sm" className={marginTop.lg}>
          {service.title}
        </Heading>
        <Text size="sm" className={marginTop.tight}>
          {service.description}
        </Text>
        {service.benefits.length > 0 ? (
          <ul className={marginTop.lg}>
            {service.benefits.slice(0, 3).map((benefit) => (
              <li key={benefit}>
                <Text as="span" size="xs" tone="muted">
                  • {benefit}
                </Text>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </article>
  );
}

function ServiceCardVariant3({
  service,
  className = "",
}: Omit<ServiceCardProps, "variant" | "emphasis">) {
  const { border } = useThemeStyle();

  return (
    <div
      className={`flex ${spacing.lg} ${paddingY.list} ${className}`.trim()}
      data-component="ServiceCard"
      data-variant="3"
    >
      <ServiceIconBadge icon={service.icon} variant="3" />
      <div className="border-l-2 pl-4" style={border()}>
        <Heading level={3} size="sm" tone="light">
          {service.title}
        </Heading>
        <Text size="sm" className={`${marginTop.tight} ${css.muted}`}>
          {service.description}
        </Text>
      </div>
    </div>
  );
}

export function ServiceCard({
  service,
  variant,
  emphasis = "default",
  className = "",
}: ServiceCardProps) {
  if (variant === "1") {
    return (
      <ServiceCardVariant1
        service={service}
        emphasis={emphasis}
        className={className}
      />
    );
  }
  if (variant === "2") {
    return <ServiceCardVariant2 service={service} className={className} />;
  }
  return <ServiceCardVariant3 service={service} className={className} />;
}
