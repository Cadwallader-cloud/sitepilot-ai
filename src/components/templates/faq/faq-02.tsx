import { Card, Container, css, Grid, Heading, marginTop, radius, Section, Stack, Text, ThemeBar } from "@/components/ui";
import type { FaqTemplateProps } from "../types";

/** Two-column FAQ grid — all answers visible. */
export function Faq02({ items, label = "FAQ" }: FaqTemplateProps) {
  return (
    <Section id="faq" template="faq-02" spacing="md" className={css.surface}>
      <Container maxWidth="xl" align="center">
        <Heading level={2} size="md">
          {label}
        </Heading>
        <Grid cols={2} gap="md" className={`${marginTop.xl} max-w-5xl`}>
          {items.map((item) => (
            <Card key={item.question} variant="elevated" padding="md">
              <Stack gap="sm">
                <Text as="p" className={`font-semibold ${css.text}`}>
                  {item.question}
                </Text>
                <Text size="sm">{item.answer}</Text>
                <ThemeBar className={`${marginTop.sm} h-0.5 w-10 ${radius.full}`} />
              </Stack>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
