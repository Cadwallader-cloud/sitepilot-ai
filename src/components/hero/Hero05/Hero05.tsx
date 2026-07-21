import type { HeroProps } from "@/components/hero/types";
import { CTAGroup } from "@/components/hero/components/CTAGroup";
import {
  Card,
  Container,
  Headline,
  Image,
  Section,
  Subheadline,
  marginTop,
  paddingY,
  responsiveLayout,
  size,
} from "@/components/ui";
import { heroImageSrc } from "../types";

/** Card overlay hero — Image + Section dim + Headline + Subheadline + CTAGroup. */
export function Hero05({ hero }: HeroProps) {
  const image = heroImageSrc(hero);

  return (
    <Section
      id="hero"
      template="hero-05"
      className={`overflow-hidden ${paddingY["2xl"]} ${size.heroMinLg}`}
      background={{ variant: "dim" }}
    >
      <Image src={image} fallbackColor="var(--text)" sizes="100vw" />
      <Container
        className={`relative flex ${responsiveLayout.flexAlignEndCenter} ${size.heroPanelMin}`}
        maxWidth="2xl"
      >
        <Card variant="overlay" padding="lg" className="w-full max-w-xl">
          <Headline tone="brand" size="md">
            {hero.headline}
          </Headline>
          <Subheadline tone="brand">{hero.subheadline}</Subheadline>
          <CTAGroup hero={hero} className={marginTop.md} />
        </Card>
      </Container>
    </Section>
  );
}
