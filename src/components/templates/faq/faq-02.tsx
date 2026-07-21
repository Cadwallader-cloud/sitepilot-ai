import { Card, Container, Grid, Heading, Section, Text, ThemeBar } from "@/components/ui";
import type { FaqTemplateProps } from "../types";

/** Two-column FAQ grid — all answers visible. */
export function Faq02({ items, label = "FAQ" }: FaqTemplateProps) {
  return (
    <Section id="faq" template="faq-02" spacing="md" className="bg-zinc-50">
      <Container maxWidth="xl" align="center">
        <Heading level={2} size="md">
          {label}
        </Heading>
        <Grid cols={2} gap="md" className="mt-10 max-w-5xl">
          {items.map((item) => (
            <Card key={item.question} variant="elevated" padding="md">
              <Text as="p" className="font-semibold text-zinc-900">
                {item.question}
              </Text>
              <Text size="sm" className="mt-3">
                {item.answer}
              </Text>
              <ThemeBar className="mt-4 h-0.5 w-10 rounded-full" />
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
