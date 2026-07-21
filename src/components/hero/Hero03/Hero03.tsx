import type { HeroProps } from "@/components/hero/types";
import { CTAGroup } from "@/components/hero/components/CTAGroup";
import {
  Container,
  Headline,
  Section,
  Subheadline,
  marginTop,
} from "@/components/ui";

/**
 * Dark band hero — Section → Container → Headline → Subheadline → CTAGroup
 */
export function Hero03({ hero }: HeroProps) {
  return (
    <Section
      id="hero"
      template="hero-03"
      spacing="lg"
      background={{ variant: "solid" }}
    >
      <Container align="center" maxWidth="md">
        <Headline tone="light">{hero.headline}</Headline>
        <Subheadline tone="light">{hero.subheadline}</Subheadline>
        <CTAGroup hero={hero} align="center" className={marginTop.lg} />
      </Container>
    </Section>
  );
}
