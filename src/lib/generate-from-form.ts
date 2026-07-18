import type { BusinessFormInput } from "./business-form";
import { generateSiteWithOpenAI } from "./generate-site-ai";
import type { GeneratedSite } from "./site-types";

/** Prefer OpenAI — kept for scripts that expect a form → site helper */
export async function generateFromForm(
  input: BusinessFormInput,
): Promise<GeneratedSite> {
  return generateSiteWithOpenAI(input);
}
