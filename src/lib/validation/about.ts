import { z } from "zod";

/** About section data — About Generator owned */
export const AboutSchema = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()).min(2).max(3),
  highlights: z.array(z.string()).length(3),
});

/** @deprecated Use AboutSchema */
export const aboutSchema = AboutSchema;

export type AboutInput = z.infer<typeof AboutSchema>;
