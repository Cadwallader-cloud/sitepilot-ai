import type { BusinessFormInput } from "./business-form";

export function formInputToPrompt(input: BusinessFormInput): string {
  const name = input.businessName.trim();
  const type = input.type.trim();
  const location = input.location.trim();
  const services = input.services.trim();
  const phone = input.phone.trim();
  const description = input.description.trim();

  const parts = [
    `${name} — a ${type} in ${location}.`,
    `Services: ${services}.`,
  ];

  if (phone) parts.push(`Phone: ${phone}.`);
  if (description) parts.push(`About the business: ${description}`);
  parts.push(
    "Create a complete professional local business website ready for customers.",
  );

  return parts.join(" ");
}
