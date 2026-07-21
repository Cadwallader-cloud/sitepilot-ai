import type { HeroProps } from "@/components/hero/types";
import { CTAGroup } from "@/components/hero/components/CTAGroup";
import {
  Badge,
  Container,
  Headline,
  maxWidth,
  Section,
  Subheadline,
  TrustBar,
  marginTop,
} from "@/components/ui";

/** Minimal centered hero — Badge + Headline + Subheadline + CTAGroup + TrustBar. */
export function Hero04({ hero }: HeroProps) {
  const eyebrow = hero.trustBar[0];
  const trustItems = eyebrow ? hero.trustBar.slice(1) : hero.trustBar;

  return (
    <Section
      id="hero"
      template="hero-04"
      spacing="lg"
      className="border-b border-zinc-100 bg-white"
    >
      <Container align="center" maxWidth="lg">
        {eyebrow ? <Badge label={eyebrow} tone="brand" /> : null}
        <Headline tone="dark" size="xl" className={eyebrow ? marginTop.md : ""}>
          {hero.headline}
        </Headline>
        <Subheadline tone="dark" className={`${maxWidth.lg} text-lg`}>
          {hero.subheadline}
        </Subheadline>
        <CTAGroup hero={hero} align="center" className={marginTop.xl} />
        <TrustBar items={trustItems} />
      </Container>
    </Section>
  );
}
