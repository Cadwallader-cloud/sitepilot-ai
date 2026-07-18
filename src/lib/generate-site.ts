import { generateFromForm } from "./generate-from-form";
import type { GeneratedSite } from "./site-types";

export type { GeneratedSite } from "./site-types";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function extractBusinessName(prompt: string) {
  const match = prompt.match(/^([^—–-]+)/);
  const name = match?.[1]?.trim();
  return capitalize(name || "Your Business");
}

/** Legacy prompt → nested content site */
export function generateSiteFromPrompt(prompt: string): GeneratedSite {
  const name = extractBusinessName(prompt);
  const lower = prompt.toLowerCase();

  let services = "General services, free estimates, emergency call-outs";
  if (/plumb|drain|pipe|boiler/.test(lower)) {
    services =
      "Emergency repairs, boiler installs, bathroom fitting, leak detection";
  } else if (/electric|wiring/.test(lower)) {
    services =
      "Panel upgrades, rewiring, lighting installs, EV charger setup";
  } else if (/roof|gutter|chimney/.test(lower)) {
    services = "Roof repair, gutter replacement, chimney repair";
  } else if (/landscape|garden|lawn/.test(lower)) {
    services = "Garden design, lawn care, patio installation";
  }

  const locationMatch = prompt.match(/\bin ([A-Z][a-zA-Z\s]+)/);
  const location = locationMatch?.[1]?.trim() || "your area";

  return generateFromForm({
    businessName: name,
    location,
    services,
    phone: "(555) 000-0000",
    email: "hello@example.com",
  });
}
