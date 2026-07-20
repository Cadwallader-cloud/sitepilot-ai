/**
 * Step — Business Analyzer
 */

import { normalizeBusinessDna, type BusinessDna } from "../../../business-dna";
import { completeJsonObject } from "../../../ai-engine/openai-json";
import {
  BUSINESS_DNA_SYSTEM,
  businessDnaUser,
} from "../../../ai-engine/prompts/business-dna";
import {
  briefFromDna,
  syncBusiness,
  type PipelineContext,
  type PipelineStep,
} from "../context";

export class BusinessStep implements PipelineStep<PipelineContext> {
  id = "business";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const { meta } = ctx;
    meta.onProgress?.({
      stage: "business_analyzer",
      label: "Business Analyzer",
    });

    const dnaRaw = await completeJsonObject<Partial<BusinessDna>>({
      stage: "business_intelligence",
      userEmail: meta.options.userEmail,
      maxCompletionTokens: 3072,
      system: BUSINESS_DNA_SYSTEM,
      user: businessDnaUser({
        businessName: meta.input.businessName,
        category: meta.category || meta.industryPack.label || meta.tradeKey,
        location: meta.input.location,
        description: meta.input.description || "",
        services: meta.input.services,
        phone: meta.input.phone,
        email: meta.input.email,
        tradeKey: meta.industryId !== "general" ? meta.industryId : meta.tradeKey,
        regenerate: meta.options.regenerate,
      }),
    });

    const dna = normalizeBusinessDna(dnaRaw, {
      industry: meta.category || meta.industryPack.label || meta.tradeKey,
      location: meta.input.location.trim(),
      services: meta.input.services,
    });

    const business = {
      ...ctx.business,
      category:
        meta.category || meta.industryPack.label || meta.tradeKey || dna.industry,
      subcategory: dna.subcategory || ctx.business.subcategory,
      description:
        (meta.input.description || "").trim() ||
        dna.brandPosition ||
        ctx.business.description,
      dna,
    };

    return syncBusiness({
      ...ctx,
      business,
      meta: {
        ...meta,
        dna,
        liveDna: dna,
        brief: briefFromDna(meta.input, dna, meta.tradeHint, meta.industryId),
      },
    });
  }
}

export const businessStep = new BusinessStep();
