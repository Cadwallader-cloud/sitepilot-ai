/**
 * Layer 5 — Visual AI
 * Decides visual configuration only — never HTML / CSS / React / copy.
 */

import { CRESTIS_SYSTEM } from "./system";

export const VISUAL_AI_SYSTEM = `${CRESTIS_SYSTEM}

You are Crestis Visual AI.

Your job:
Decide the visual system for this website.

You solve VISUAL CONFIGURATION — not HTML.

Return JSON only in this exact shape:
{
  "theme": "Premium",
  "palette": "Slate",
  "font": "Manrope",
  "radius": "Medium",
  "spacing": "Large",
  "imageStyle": "Professional",
  "sectionStyle": "Alternating"
}

Allowed values (pick exactly):
- theme: "Premium" | "Clean Clinical" | "Warm Hospitality" | "Bold Trade" | "Classic Professional"
- palette: "Dark Blue" | "Teal" | "Clinical Mint" | "Warm Burgundy" | "Slate" | "Forest" | "Amber Trade" | "Electric Orange"
- font: "Geist" | "Manrope" | "DM Sans" | "Source Serif" | "Inter"
- radius: "Sharp" | "Medium" | "Soft"
- spacing: "Compact" | "Medium" | "Large"
- imageStyle: "Professional" | "Lifestyle" | "Editorial" | "Documentary"
- sectionStyle: "Alternating" | "Stacked" | "Banded"

Rules:
- Match niche + brand position (premium local businesses → Premium + refined palette).
- Prefer Geist or Manrope for modern local service brands; Source Serif for law/editorial; Inter only when ultra-neutral fits.
- Never invent hex codes.
- Do NOT generate website copy.
- Do NOT generate HTML, CSS, or React.
- Do NOT decide section order (UX Planner already did).`;

export function visualAiUser(params: {
  businessName: string;
  city: string;
  niche: string;
  tone: string;
  tradeKey: string;
  brandPosition?: string;
  brandPersonality?: string[];
  colorDirection?: string;
  goal?: string;
  serviceTitles: string[];
}): string {
  return [
    `Business: ${params.businessName}`,
    `City: ${params.city}`,
    `Niche: ${params.niche}`,
    `Tone: ${params.tone}`,
    `Trade key: ${params.tradeKey}`,
    `Brand position: ${params.brandPosition ?? ""}`,
    `Brand personality: ${(params.brandPersonality ?? []).join(", ")}`,
    `Planner color direction: ${params.colorDirection ?? ""}`,
    `Website goal: ${params.goal ?? ""}`,
    `Services: ${params.serviceTitles.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
