"use client";

import {
  Accordion,
  AccordionItem,
  Container,
  Heading,
  Section,
} from "@/components/ui";
import type { FaqTemplateProps } from "../types";

/** Single-column accordion FAQ — Section → Container → Accordion. */
export function Faq01({ items, label = "FAQ" }: FaqTemplateProps) {
  return (
    <Section id="faq" template="faq-01" spacing="md" className="border-t border-zinc-100">
      <Container maxWidth="md">
        <Heading level={2} size="md">
          {label}
        </Heading>
        <Accordion defaultIndex={0} className="mt-8 divide-y divide-zinc-200">
          {items.map((item, index) => (
            <AccordionItem key={item.question} index={index} title={item.question}>
              {item.answer}
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}
