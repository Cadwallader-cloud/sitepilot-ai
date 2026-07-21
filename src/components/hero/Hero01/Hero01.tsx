import type { HeroProps } from "@/components/hero/types";
import { CTAGroup } from "@/components/hero/components/CTAGroup";
import {
  Container,
  Headline,
  Image,
  Section,
  Subheadline,
  paddingY,
  size,
} from "@/components/ui";
import { heroImageSrc } from "../types";

/** Full-bleed image hero with bottom gradient overlay. */
export function Hero01({ hero }: HeroProps) {
  const image = heroImageSrc(hero);

  return (
    <Section
      id="hero"
      template="hero-01"
      className={`overflow-hidden ${size.heroMin}`}
      background={!image ? { variant: "gradient" } : undefined}
    >
      <Image src={image} sizes="100vw" />
      {image ? (
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/35 to-black/20"
          aria-hidden
        />
      ) : null}
      <Container
        className={`relative z-[2] flex flex-col justify-end ${paddingY["2xl"]} ${size.heroMin}`}
        maxWidth="full"
      >
        <Headline tone="light" className="max-w-3xl">
          {hero.headline}
        </Headline>
        <Subheadline tone="light" className="max-w-xl">
          {hero.subheadline}
        </Subheadline>
        <CTAGroup hero={hero} />
      </Container>
    </Section>
  );
}
