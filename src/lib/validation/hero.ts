import { z } from "zod";

/** Hero section data — Hero Generator owned */
export const HeroSchema = z.object({
  headline: z.string().min(10).max(80),
  subheadline: z.string().min(20).max(250),
  primaryCTA: z.string().min(2),
  secondaryCTA: z.string().optional(),
  trustBar: z.array(z.string()).max(5),
});

/** @deprecated Use HeroSchema */
export const heroSchema = HeroSchema;

export type HeroInput = z.infer<typeof HeroSchema>;
