/**
 * Crestis Brand Personality Engine v1
 *
 * Runs after Business Analyzer, before Website Planner.
 * Output is the voice law for Planner → Hero → About → Services → FAQ → SEO.
 */

import type { BusinessDna } from "../business-dna";
import {
  formatBrandPersonalityBrief,
  normalizeBrandPersonality,
  type BrandPersonality,
} from "../brand-personality";
import { completeJsonObject } from "./openai-json";
import {
  BRAND_PERSONALITY_SYSTEM,
  brandPersonalityUser,
} from "./prompts/brand-personality";
import type { WebsitePlan } from "./types";

export type BrandPersonalityEngineResult = {
  personality: BrandPersonality;
  /** Rich brief for Hero / About / Services / FAQ / CTA */
  brief: string;
  /** DNA with traits + tone synced from personality */
  dna: BusinessDna;
};

export async function runBrandPersonalityEngine(params: {
  businessName: string;
  industry: string;
  location: string;
  description: string;
  services: string;
  dna: BusinessDna;
  /** Optional — when Brand Personality runs before Website Planner */
  plan?: WebsitePlan | null;
  userEmail?: string | null;
  regenerate?: boolean;
  preferredWordsSeed?: string[];
  industryBrief?: string;
}): Promise<BrandPersonalityEngineResult> {
  const dnaJson = JSON.stringify(params.dna, null, 2);
  const planJson = params.plan
    ? JSON.stringify(
        {
          pageType: params.plan.pageType,
          conversionGoal: params.plan.goal,
          template: params.plan.template,
          variant: params.plan.variant,
          tone: params.plan.tone,
          positioning: params.plan.positioning,
          targetAudience: params.plan.targetAudience,
          ctaStrategy: params.plan.ctaStrategy,
          trustSignals: params.plan.trustSignals,
          notes: params.plan.notes,
        },
        null,
        2,
      )
    : undefined;

  const raw = await completeJsonObject<Partial<BrandPersonality>>({
    stage: "business_intelligence",
    userEmail: params.userEmail,
    maxCompletionTokens: 3072,
    temperature: 0.55,
    system: BRAND_PERSONALITY_SYSTEM,
    user: [
      brandPersonalityUser({
        businessName: params.businessName,
        industry: params.industry,
        location: params.location,
        description: params.description,
        services: params.services,
        dnaJson,
        planJson,
        regenerate: params.regenerate,
      }),
      params.industryBrief ? `\n${params.industryBrief}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const personality = normalizeBrandPersonality(raw, {
    traits: params.dna.brandPersonality,
    voice: params.dna.tone,
    preferredWords:
      params.preferredWordsSeed ?? params.dna.keywords.slice(0, 8),
  });

  const dna: BusinessDna = {
    ...params.dna,
    brandPersonality: personality.traits,
    tone: personality.voice,
  };

  return {
    personality,
    brief: formatBrandPersonalityBrief(personality),
    dna,
  };
}

export { formatBrandPersonalityBrief };
