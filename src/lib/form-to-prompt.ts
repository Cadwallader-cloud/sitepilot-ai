import type { BusinessFormInput } from "./business-form";
import { buildWebsiteUserPrompt } from "./openai-prompt";

/** @deprecated use buildWebsiteUserPrompt — kept for compatibility */
export function formInputToPrompt(input: BusinessFormInput): string {
  return buildWebsiteUserPrompt(input);
}
