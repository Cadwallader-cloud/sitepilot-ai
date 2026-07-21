import NextImage from "next/image";
import {
  css,
  Container,
  Grid,
  Heading,
  Card,
  marginTop,
  radius,
  Section,
  size,
  Text,
  ThemeGradient,
} from "@/components/ui";
import { resolveAlign } from "@/components/ui/responsive";
import type { AboutTemplateProps } from "../types";

/** Split layout — copy + side image. */
export function About01({
  data,
  label = "About",
  imageUrl,
  imageAlt,
}: AboutTemplateProps) {
  const paragraphs =
    data.paragraphs.length > 0 ? data.paragraphs : ["We serve our local community."];

  return (
    <Section id="about" template="about-01" spacing="md">
      <Container>
        <Grid cols={2} gap="lg" className={resolveAlign({ desktop: "center" })}>
          <div>
            <Heading level={2} size="md">
              {data.title || label}
            </Heading>
            {paragraphs.map((para) => (
              <Text key={para.slice(0, 32)} className={marginTop.sm}>
                {para}
              </Text>
            ))}
            {data.highlights.length > 0 ? (
              <Grid cols="threeFromTablet" gap="sm" className={marginTop.md}>
                {data.highlights.map((item) => (
                  <Card key={item} variant="outline" padding="sm">
                    <Text as="span" size="sm" className={`block text-center font-medium ${css.text}`}>
                      {item}
                    </Text>
                  </Card>
                ))}
              </Grid>
            ) : null}
          </div>
          <div className={`relative overflow-hidden ${radius.lg} ${size.aboutImage}`}>
            {imageUrl ? (
              <NextImage
                src={imageUrl}
                alt={imageAlt || data.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <ThemeGradient />
            )}
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
