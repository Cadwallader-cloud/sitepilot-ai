/**
 * Step — Brand Personality
 */

import { runBrandPersonalityEngine } from "../../../ai-engine/brand-personality-engine";
import {
  briefFromDna,
  ensurePromptCache,
  syncBranding,
  syncBusiness,
  type PipelineContext,
  type PipelineStep,
} from "../context";

export class BrandStep implements PipelineStep<PipelineContext> {
  id = "brand";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const { meta } = ctx;
    meta.onProgress?.({
      stage: "brand_personality",
      label: "Brand Personality",
    });

    const personalityResult = await runBrandPersonalityEngine({
      businessName: meta.input.businessName,
      industry: meta.category || meta.industryPack.label || meta.tradeKey,
      location: meta.input.location,
      description: meta.input.description || "",
      services: meta.input.services,
      dna: meta.dna,
      userEmail: meta.options.userEmail,
      regenerate: meta.options.regenerate,
      preferredWordsSeed: [
        ...meta.industryPack.preferredWords,
        ...meta.dna.keywords.slice(0, 4),
      ],
      industryBrief: meta.industryBrief,
    });

    const liveDna = personalityResult.dna;
    const personality = personalityResult.personality;

    const branding = {
      ...ctx.branding,
      tone: `${personality.voice}, ${personality.energy.toLowerCase()} energy`,
      personality: [
        personality.archetype,
        personality.voice,
        personality.energy,
        ...personality.traits.slice(0, 4),
      ].filter(Boolean),
      style: ctx.branding.style,
    };

    const business = {
      ...ctx.business,
      dna: liveDna,
      personality,
    };

    return ensurePromptCache(
      syncBusiness(
        syncBranding({
          ...ctx,
          business,
          branding,
          meta: {
            ...meta,
            liveDna,
            personality,
            personalityBrief: personalityResult.brief,
            brief: {
              ...briefFromDna(meta.input, liveDna, meta.tradeHint, meta.industryId),
              personality,
              seoPlan: meta.brief.seoPlan,
            },
          },
        }),
      ),
    );
  }
}

export const brandStep = new BrandStep();
