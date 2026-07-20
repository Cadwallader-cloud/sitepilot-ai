import {
  clampAiLikelihood,
  parseHumanVerdict,
  type HumanDetectorReport,
  type HumanDetectorTarget,
  type HumanDetectorVerdict,
} from "../human-detector";
import {
  generateAboutSection,
  generateCtaSection,
  generateFaqSection,
  generateHeroSection,
  generateServicesSection,
} from "./content-generator";
import { completeJsonObject } from "./openai-json";
import {
  HUMAN_DETECTOR_SYSTEM,
  humanDetectorUser,
} from "./prompts/human-detector";
import { runSeoAi } from "./seo-ai";
import type {
  BusinessBrief,
  ContentDraft,
  DesignPlan,
  EngineContext,
  SeoDraft,
  WebsitePlan,
} from "./types";

type HumanAiJson = {
  looksAiGenerated?: string | boolean;
  aiLikelihood?: number;
  tells?: string[];
  verdict?: string;
  rewriteTargets?: string[];
};

const ALLOWED: HumanDetectorTarget[] = [
  "hero",
  "about",
  "services",
  "faq",
  "cta",
  "seo",
];

function cleanTargets(raw: unknown): HumanDetectorTarget[] {
  if (!Array.isArray(raw)) return [];
  const out: HumanDetectorTarget[] = [];
  for (const item of raw) {
    const id = String(item ?? "")
      .trim()
      .toLowerCase() as HumanDetectorTarget;
    if (ALLOWED.includes(id) && !out.includes(id)) out.push(id);
  }
  return out.slice(0, 5);
}

async function detectOnce(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  seo: SeoDraft,
): Promise<{
  looksAiGenerated: HumanDetectorVerdict;
  aiLikelihood: number;
  tells: string[];
  verdict: string;
  rewriteTargets: HumanDetectorTarget[];
}> {
  const ai = await completeJsonObject<HumanAiJson>({
    stage: "human_detector",
    userEmail: ctx.options.userEmail,
    temperature: 0.25,
    system: HUMAN_DETECTOR_SYSTEM,
    user: humanDetectorUser({
      business: ctx.input.businessName,
      city: brief.city,
      niche: brief.niche,
      hero: content.hero,
      about: content.about,
      services: content.services,
      faqSample: content.faq.slice(0, 3),
      cta: content.cta,
      seo: {
        title: seo.title,
        description: seo.description,
        localSeoPhrase: seo.localSeoPhrase,
      },
    }),
  });

  let looksAiGenerated = parseHumanVerdict(ai.looksAiGenerated);
  const aiLikelihood = clampAiLikelihood(ai.aiLikelihood, 55);

  // Likelihood overrides ambiguous answers
  if (typeof ai.looksAiGenerated !== "string" && aiLikelihood >= 55) {
    looksAiGenerated = "YES";
  } else if (aiLikelihood < 40 && looksAiGenerated === "YES") {
    // Model said YES but scored low — trust the number unless tells are strong
    const tells = Array.isArray(ai.tells) ? ai.tells : [];
    if (tells.length === 0) looksAiGenerated = "NO";
  } else if (aiLikelihood >= 60) {
    looksAiGenerated = "YES";
  }

  let rewriteTargets = cleanTargets(ai.rewriteTargets);
  if (looksAiGenerated === "YES" && rewriteTargets.length === 0) {
    rewriteTargets = ["hero", "about", "cta"];
  }
  if (looksAiGenerated === "NO") {
    rewriteTargets = [];
  }

  const tells = (Array.isArray(ai.tells) ? ai.tells : [])
    .map(String)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    looksAiGenerated,
    aiLikelihood,
    tells,
    verdict:
      String(ai.verdict ?? "").trim() ||
      (looksAiGenerated === "YES"
        ? "Looks AI-generated — rewriting flagged sections"
        : "Reads human enough to ship"),
    rewriteTargets,
  };
}

async function rewriteTargets(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
  content: ContentDraft;
  seo: SeoDraft;
  targets: HumanDetectorTarget[];
}): Promise<{
  content: ContentDraft;
  seo: SeoDraft;
  rewritten: HumanDetectorTarget[];
}> {
  const { ctx, brief, plan, targets } = params;
  let { content, seo } = params;
  const rewritten: HumanDetectorTarget[] = [];

  // Feed prior copy as "forbidden" so Hero/About avoid repeating AI sludge
  const priorCtx: EngineContext = {
    ...ctx,
    options: {
      ...ctx.options,
      regenerate: true,
      previous: {
        ...ctx.options.previous,
        headline: content.hero.headline,
        subheadline: content.hero.subheadline,
        primaryCTA: content.hero.primaryCTA,
        heroTitle: content.hero.headline,
        heroSubtitle: content.hero.subheadline,
        heroCta: content.hero.primaryCTA,
        aboutText: content.about.text,
      },
    },
  };
  const c = { ctx: priorCtx, brief, plan };

  for (const target of targets) {
    try {
      if (target === "hero") {
        content = { ...content, hero: await generateHeroSection(c) };
        rewritten.push("hero");
      } else if (target === "about") {
        content = { ...content, about: await generateAboutSection(c) };
        rewritten.push("about");
      } else if (target === "services") {
        content = {
          ...content,
          services: await generateServicesSection(c),
        };
        rewritten.push("services");
      } else if (target === "faq") {
        content = { ...content, faq: await generateFaqSection(c) };
        rewritten.push("faq");
      } else if (target === "cta") {
        const cta = await generateCtaSection(c, content.hero);
        content = {
          ...content,
          cta,
          hero: {
            ...content.hero,
            primaryCTA: cta.primaryCTA || content.hero.primaryCTA,
            secondaryCTA: cta.secondaryCTA || content.hero.secondaryCTA,
          },
        };
        rewritten.push("cta");
      } else if (target === "seo") {
        seo = await runSeoAi(ctx, brief, content, plan);
        rewritten.push("seo");
      }
    } catch (error) {
      console.warn(`Human Detector rewrite ${target} failed:`, error);
    }
  }

  return { content, seo, rewritten };
}

export type HumanDetectorResult = {
  content: ContentDraft;
  seo: SeoDraft;
  human: HumanDetectorReport;
};

/**
 * Layer 9 — Human Detector
 * Would this website look AI-generated? YES → Rewrite.
 */
export async function runHumanDetector(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
  content: ContentDraft;
  seo: SeoDraft;
  design?: DesignPlan;
}): Promise<HumanDetectorResult> {
  const { ctx, brief, plan } = params;
  let { content, seo } = params;

  let first: Awaited<ReturnType<typeof detectOnce>>;
  try {
    first = await detectOnce(ctx, brief, content, seo);
  } catch (error) {
    console.warn("Human Detector failed:", error);
    return {
      content,
      seo,
      human: {
        looksAiGenerated: "NO",
        aiLikelihood: 40,
        tells: ["Human Detector unavailable — skipped rewrite"],
        verdict: "Detector unavailable — left copy unchanged",
        rewritten: [],
        finalLooksAiGenerated: "NO",
      },
    };
  }

  let rewritten: HumanDetectorTarget[] = [];
  let finalLooksAiGenerated: HumanDetectorVerdict = first.looksAiGenerated;

  if (first.looksAiGenerated === "YES") {
    // Cap humanization rewrites (regenerate: hero+cta only)
    const targets = ctx.options.regenerate
      ? first.rewriteTargets
          .filter((t) => t === "hero" || t === "cta" || t === "about")
          .slice(0, 2)
      : first.rewriteTargets.slice(0, 3);

    const result = await rewriteTargets({
      ctx,
      brief,
      plan,
      content,
      seo,
      targets,
    });
    content = result.content;
    seo = result.seo;
    rewritten = result.rewritten;

    // Re-check after rewrite (skip on regenerate — saves a full GPT round-trip)
    if (rewritten.length > 0 && !ctx.options.regenerate) {
      try {
        const second = await detectOnce(ctx, brief, content, seo);
        finalLooksAiGenerated = second.looksAiGenerated;
      } catch {
        finalLooksAiGenerated = "NO";
      }
    } else if (rewritten.length > 0) {
      finalLooksAiGenerated = "NO";
    }
  }

  return {
    content,
    seo,
    human: {
      looksAiGenerated: first.looksAiGenerated,
      aiLikelihood: first.aiLikelihood,
      tells: first.tells,
      verdict: first.verdict,
      rewritten,
      finalLooksAiGenerated,
    },
  };
}
