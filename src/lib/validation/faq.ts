import { z } from "zod";

/** FAQ item — FAQ Generator owned */
export const FAQSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
});

/** Crestis FAQ Generator requires exactly 6 items */
export const FAQ_REQUIRED_COUNT = 6;

export const FAQSectionSchema = z.object({
  items: z.array(FAQSchema).length(FAQ_REQUIRED_COUNT),
});

/** @deprecated Use FAQSchema */
export const faqSchema = FAQSchema;
/** @deprecated Use FAQSectionSchema */
export const faqSectionSchema = FAQSectionSchema;

export type FaqInput = z.infer<typeof FAQSchema>;
export type FaqSectionInput = z.infer<typeof FAQSectionSchema>;
