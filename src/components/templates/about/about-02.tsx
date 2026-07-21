import { Button, Container, Heading, marginTop, Section, Stack, Text, ThemeBar } from "@/components/ui";
import type { AboutTemplateProps } from "../types";

/** Stacked editorial — accent rule + highlights row. */
export function About02({
  data,
  label = "About",
}: AboutTemplateProps) {
  const paragraphs =
    data.paragraphs.length > 0 ? data.paragraphs : ["We serve our local community."];

  return (
    <Section id="about" template="about-02" spacing="md">
      <Container maxWidth="md">
        <ThemeBar />
        <Heading level={2} size="md" className={marginTop.md}>
          {data.title || label}
        </Heading>
        <Stack gap="md" className={marginTop.md}>
          {paragraphs.map((para) => (
            <Text key={para.slice(0, 32)} size="lg">
              {para}
            </Text>
          ))}
        </Stack>
        {data.highlights.length > 0 ? (
          <div className={`flex flex-wrap gap-3 ${marginTop.lg}`}>
            {data.highlights.map((item) => (
              <Button key={item} variant="primary">
                {item}
              </Button>
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
