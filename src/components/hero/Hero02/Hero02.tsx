import type { HeroProps } from "@/components/hero/types";
import { CTAGroup } from "@/components/hero/components/CTAGroup";
import {
  Container,
  Headline,
  Image,
  Section,
  Subheadline,
  paddingY,
  responsiveLayout,
  size,
} from "@/components/ui";
import { heroImageSrc } from "../types";

/** Split layout — copy left, image right. */
export function Hero02({ hero }: HeroProps) {
  const image = heroImageSrc(hero);

  return (
    <Section
      id="hero"
      template="hero-02"
      className={`${responsiveLayout.heroSplit} ${size.heroMin}`}
    >
      <Container className={`flex flex-col justify-center bg-zinc-50 ${paddingY["2xl"]}`} maxWidth="full">
        <Headline tone="dark" className="max-w-xl">
          {hero.headline}
        </Headline>
        <Subheadline tone="dark" className="max-w-lg">
          {hero.subheadline}
        </Subheadline>
        <CTAGroup hero={hero} />
      </Container>
      <div className={`relative ${size.heroSplitImageMin}`}>
        <Image src={image} fallbackTint="22" sizes="50vw" />
      </div>
    </Section>
  );
}
