/**
 * Section Wrapper — every page section uses one container.
 *
 * @example
 * <Section id="services">
 *   <Container>...</Container>
 * </Section>
 */

export const SECTION_WRAPPER_RULE =
  "Every section renders as Section > Container (single content width)." as const;

export const SECTION_IDS = ["hero", "about", "services", "faq"] as const;

export type SectionId = (typeof SECTION_IDS)[number];
