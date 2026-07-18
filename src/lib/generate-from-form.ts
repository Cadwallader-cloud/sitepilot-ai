import type { BusinessFormInput } from "./business-form";
import {
  buildContentFromInput,
  normalizeGeneratedSite,
} from "./generate-site-ai";
import type { GeneratedSite } from "./site-types";

export function generateFromForm(input: BusinessFormInput): GeneratedSite {
  return normalizeGeneratedSite(buildContentFromInput(input), input);
}
