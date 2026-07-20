import {
  dnaToDesignTone,
  normalizeBusinessDna,
  type BusinessDna,
} from "../business-dna";
import { detectTrade } from "../trade-images";
import { completeJsonObject } from "./openai-json";
import { BUSINESS_DNA_SYSTEM, businessDnaUser } from "./prompts/business-dna";
import type { BusinessBrief, EngineContext } from "./types";

/**
 * Layer 1 — Business Intelligence
 * AI does NOT write copy. It builds Business DNA first.
 */
export async function analyzeBusiness(
  ctx: EngineContext,
): Promise<BusinessBrief> {
  const { input, options } = ctx;
  const category = (input.category || "").trim();
  const tradeHint = [
    input.businessName,
    category,
    input.location,
    input.description,
    input.services,
  ]
    .filter(Boolean)
    .join(" ");
  const tradeKey = detectTrade(tradeHint);

  let raw: Partial<BusinessDna> = {};
  try {
    raw = await completeJsonObject<Partial<BusinessDna>>({
      stage: "business_intelligence",
      userEmail: options.userEmail,
      temperature: 0.55,
      system: BUSINESS_DNA_SYSTEM,
      user: businessDnaUser({
        businessName: input.businessName,
        category: category || tradeKey,
        location: input.location,
        description: input.description || "",
        services: input.services,
        phone: input.phone,
        email: input.email,
        tradeKey,
        regenerate: options.regenerate,
      }),
    });
  } catch (error) {
    console.warn("Business DNA AI failed, using Crestis fallback:", error);
  }

  const dna = normalizeBusinessDna(raw, {
    industry: category || tradeKey,
    location: input.location.trim(),
    services: input.services,
  });

  const serviceFocus = input.services
    .split(/[,;•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  // Derive legacy brief fields from DNA — DNA remains the brain
  return {
    dna,
    niche: dna.subcategory || dna.industry,
    tradeHint,
    city: input.location.trim(),
    localeNote: `Serving ${input.location.trim()}`,
    tone: dnaToDesignTone(dna),
    customerPains: dna.targetAudience.map(
      (a) => `Needs trusted help as ${a.toLowerCase()}`,
    ),
    uniqueAngle: `${dna.brandPosition} ${dna.industry} for ${dna.targetAudience[0] || "local customers"} in ${input.location.trim()}`,
    serviceFocus: serviceFocus.length
      ? serviceFocus
      : [dna.subcategory, dna.industry].filter(Boolean),
    positioning: `${dna.brandPosition} — ${dna.brandPersonality.join(", ")}`,
    idealCustomer: dna.targetAudience.join(", "),
    offerPromise: dna.cta,
  };
}

export type { BusinessDna };
