import { z } from "zod";

/** Single service — Services Generator owned */
export const ServiceSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  benefits: z.array(z.string()).length(3),
  icon: z.string(),
  featured: z.boolean(),
});

export const ServicesSectionSchema = z.object({
  items: z.array(ServiceSchema),
});

/** @deprecated Use ServiceSchema */
export const serviceSchema = ServiceSchema;
/** @deprecated Use ServicesSectionSchema */
export const servicesSectionSchema = ServicesSectionSchema;

export type ServiceInput = z.infer<typeof ServiceSchema>;
export type ServicesSectionInput = z.infer<typeof ServicesSectionSchema>;
