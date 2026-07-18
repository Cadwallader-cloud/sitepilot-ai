import type { BusinessFormInput } from "./business-form";

export function formInputToPrompt(input: BusinessFormInput): string {
  const name = input.businessName.trim();
  const type = input.type.trim();
  const location = input.location.trim();
  const services = input.services.trim();
  const phone = input.phone.trim();

  return [
    `${name} — a ${type} in ${location}.`,
    `Services: ${services}.`,
    `Phone: ${phone}.`,
    "Create a professional local business website.",
  ].join(" ");
}
