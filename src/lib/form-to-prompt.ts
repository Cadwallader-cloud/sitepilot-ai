import type { BusinessFormInput } from "./business-form";

export function formInputToPrompt(input: BusinessFormInput): string {
  return [
    `Business name: ${input.businessName.trim()}`,
    `Location: ${input.location.trim()}`,
    `Services: ${input.services.trim()}`,
    `Phone: ${input.phone.trim()}`,
    `Email: ${input.email.trim()}`,
    "Generate a complete, sellable local business website.",
  ].join("\n");
}
