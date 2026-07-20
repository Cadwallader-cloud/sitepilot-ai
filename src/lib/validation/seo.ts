import { z } from "zod";

/** Site-wide SEO — SEO Generator owned */
export const SeoSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  keywords: z.array(z.string()),
  canonical: z.string(),
});

/**
 * Full SEO block on Website may also carry schema / OG / Twitter bags.
 * Core SeoSchema fields remain required; extras are optional.
 */
export const SeoBlockSchema = SeoSchema.extend({
  schema: z.record(z.string(), z.unknown()).nullable().optional(),
  openGraph: z.record(z.string(), z.unknown()).nullable().optional(),
  twitter: z.record(z.string(), z.unknown()).nullable().optional(),
});

/** @deprecated Use SeoSchema */
export const seoSchema = SeoSchema;

export type SeoInput = z.infer<typeof SeoSchema>;
export type SeoBlockInput = z.infer<typeof SeoBlockSchema>;
