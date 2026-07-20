import {
  clampQaScore,
  QA_THRESHOLD,
  qaRewriteTargets,
  type QaDimensionScores,
  type QaReport,
  type QaRewriteTarget,
  type QaSectionScores,
} from "../qa";
import type { AiQualityScores } from "./ai-quality-scorer";
import {
  generateAboutSection,
  generateCtaSection,
  generateFaqSection,
  generateHeroSection,
  generateServicesSection,
  generateTestimonialsSection,
} from "./content-generator";
import { runCroAi } from "./cro-ai";
import { completeJsonObject } from "./openai-json";
import { QA_AI_SYSTEM, qaAiUser } from "./prompts/qa-ai";
import { runSeoAi } from "./seo-ai";
import type {
  BusinessBrief,
  ContentDraft,
  DesignPlan,
  EngineContext,
  SeoDraft,
  WebsitePlan,
} from "./types";
import { runVisualAi } from "./visual-ai";

type QaAiJson = {
  design?: number;
  content?: number;
  trust?: number;
  seo?: number;
  mobile?: number;
  readability?: number;
  conversion?: number;
  overall?: number;
  sections?: Partial<QaSectionScores>;
  reasons?: { section?: string; score?: number; reason?: string }[];
  issues?: string[];
};

function parseDims(ai: QaAiJson): QaDimensionScores {
  const design = clampQaScore(ai.design);
  const content = clampQaScore(ai.content);
  const trust = clampQaScore(ai.trust);
  const seo = clampQaScore(ai.seo);
  const mobile = clampQaScore(ai.mobile);
  const readability = clampQaScore(ai.readability);
  const conversion = clampQaScore(ai.conversion);
  const overall = clampQaScore(
    ai.overall,
    Math.round(
      (design +
        content +
        trust +
        seo +
        mobile +
        readability +
        conversion) /
        7,
    ),
  );
  return {
    design,
    content,
    trust,
    seo,
    mobile,
    readability,
    conversion,
    overall,
  };
}

function parseSections(ai: QaAiJson, dims: QaDimensionScores): QaSectionScores {
  const s = ai.sections ?? {};
  return {
    hero: clampQaScore(s.hero, dims.content),
    about: clampQaScore(s.about, dims.trust),
    services: clampQaScore(s.services, dims.content),
    faq: clampQaScore(s.faq, dims.readability),
    cta: clampQaScore(s.cta, dims.conversion),
    seo: clampQaScore(s.seo, dims.seo),
  };
}

/** Bridge Layer 8 → legacy quality metadata shape */
export function qaToQualityScores(
  qa: QaReport,
): AiQualityScores {
  return {
    heroScore: qa.sections.hero,
    headlineQuality: qa.sections.hero,
    seoScore: qa.seo,
    trustScore: qa.trust,
    ctaScore: qa.sections.cta,
    callToAction: qa.conversion,
    readability: qa.readability,
    professionalAppearance: qa.design,
    overall: qa.overall,
    reasons: qa.reasons,
    issues: qa.issues,
    regeneratedSections: qa.rewritten,
  };
}

async function scoreOnce(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  seo: SeoDraft,
  design: DesignPlan,
  cro?: { willCall: number; willSubmitForm: number; trustEnough: number; overallConversion: number },
): Promise<Omit<QaReport, "rewritten" | "passed">> {
  const ai = await completeJsonObject<QaAiJson>({
    stage: "qa_ai",
    userEmail: ctx.options.userEmail,
    temperature: 0.2,
    system: QA_AI_SYSTEM,
    user: qaAiUser({
      business: ctx.input.businessName,
      city: brief.city,
      niche: brief.niche,
      phone: ctx.input.phone.trim(),
      hero: content.hero,
      about: content.about,
      services: content.services,
      faqSample: content.faq.slice(0, 3),
      testimonialsPolicy: {
        real: content.testimonials.filter((t) => t.demo === false).length,
        demo: content.testimonials.filter((t) => t.demo === true).length,
      },
      cta: content.cta,
      seo: {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        localSeoPhrase: seo.localSeoPhrase,
        schemaType: seo.schema?.["@type"],
        internalLinks: seo.internalLinks?.map((l) => l.href),
      },
      design: design.design,
      cro,
    }),
  });

  const dims = parseDims(ai);
  const sections = parseSections(ai, dims);
  const reasons = (Array.isArray(ai.reasons) ? ai.reasons : [])
    .map((r) => ({
      section: String(r?.section ?? "").trim(),
      score: clampQaScore(r?.score, 0),
      reason: String(r?.reason ?? "").trim(),
    }))
    .filter((r) => r.section && r.reason && r.score < QA_THRESHOLD)
    .slice(0, 14);

  const derived =
    reasons.length > 0
      ? reasons
      : ([
          ...Object.entries(dims).map(([section, score]) => ({
            section,
            score,
            reason: `${section} scored ${score} (below ${QA_THRESHOLD})`,
          })),
          ...Object.entries(sections).map(([section, score]) => ({
            section,
            score,
            reason: `${section} scored ${score} (below ${QA_THRESHOLD})`,
          })),
        ] as QaReport["reasons"]).filter((r) => r.score < QA_THRESHOLD);

  const issues = [
    ...derived.map((r) => `${r.section} (${r.score}): ${r.reason}`),
    ...(Array.isArray(ai.issues) ? ai.issues.map(String).filter(Boolean) : []),
  ].slice(0, 14);

  return { ...dims, sections, reasons: derived.slice(0, 14), issues };
}

async function autoRewrite(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
  content: ContentDraft;
  seo: SeoDraft;
  design: DesignPlan;
  targets: QaRewriteTarget[];
}): Promise<{
  content: ContentDraft;
  seo: SeoDraft;
  design: DesignPlan;
  rewritten: QaRewriteTarget[];
}> {
  const { ctx, brief, plan, targets } = params;
  let { content, seo, design } = params;
  const c = { ctx, brief, plan };
  const rewritten: QaRewriteTarget[] = [];

  for (const target of targets) {
    try {
      if (target === "hero") {
        content = { ...content, hero: await generateHeroSection(c) };
        rewritten.push("hero");
      } else if (target === "about") {
        const about = await generateAboutSection(c);
        const testimonials = content.testimonials.some((t) => t.demo === false)
          ? content.testimonials
          : await generateTestimonialsSection(c);
        content = { ...content, about, testimonials };
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
      } else if (target === "design") {
        design = await runVisualAi(ctx, brief, content, plan);
        rewritten.push("design");
      } else if (target === "conversion") {
        const cro = await runCroAi(ctx, brief, content, plan);
        content = cro.content;
        rewritten.push("conversion");
      }
    } catch (error) {
      console.warn(`QA AI auto-rewrite ${target} failed:`, error);
    }
  }

  return { content, seo, design, rewritten };
}

export type QaAiResult = {
  content: ContentDraft;
  seo: SeoDraft;
  design: DesignPlan;
  qa: QaReport;
  quality: AiQualityScores;
};

/**
 * Layer 8 — QA AI
 * Score → if Hero 74/100 → automatically Rewrite Hero → re-score once.
 */
export async function runQaAi(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
  content: ContentDraft;
  seo: SeoDraft;
  design: DesignPlan;
  cro?: {
    willCall: number;
    willSubmitForm: number;
    trustEnough: number;
    overallConversion: number;
  };
}): Promise<QaAiResult> {
  const { ctx, brief, plan, cro } = params;
  let { content, seo, design } = params;

  let scored: Omit<QaReport, "rewritten" | "passed">;
  try {
    scored = await scoreOnce(ctx, brief, content, seo, design, cro);
  } catch (error) {
    console.warn("QA AI scoring failed:", error);
    scored = {
      design: 80,
      content: 80,
      trust: 80,
      seo: 80,
      mobile: 80,
      readability: 80,
      conversion: 80,
      overall: 80,
      sections: {
        hero: 80,
        about: 80,
        services: 80,
        faq: 80,
        cta: 80,
        seo: 80,
      },
      reasons: [],
      issues: ["QA AI unavailable — used fallback scores"],
    };
  }

  // Cap rewrites so generate/regenerate cannot spawn a 20-call cascade
  const maxRewrites = ctx.options.regenerate ? 2 : 3;
  const priority: QaRewriteTarget[] = [
    "hero",
    "cta",
    "about",
    "conversion",
    "seo",
    "services",
    "faq",
    "design",
  ];
  const targets = qaRewriteTargets(scored, scored.sections)
    .sort((a, b) => priority.indexOf(a) - priority.indexOf(b))
    .slice(0, maxRewrites);
  let rewritten: QaRewriteTarget[] = [];

  if (targets.length > 0) {
    const result = await autoRewrite({
      ctx,
      brief,
      plan,
      content,
      seo,
      design,
      targets,
    });
    content = result.content;
    seo = result.seo;
    design = result.design;
    rewritten = result.rewritten;

    // Re-score once after automatic rewrites (skip on regenerate for speed)
    if (rewritten.length > 0 && !ctx.options.regenerate) {
      try {
        scored = await scoreOnce(ctx, brief, content, seo, design, cro);
      } catch (error) {
        console.warn("QA AI re-score failed:", error);
      }
    }
  }

  const qa: QaReport = {
    ...scored,
    rewritten,
    passed: scored.overall >= QA_THRESHOLD,
  };

  return {
    content,
    seo,
    design,
    qa,
    quality: qaToQualityScores(qa),
  };
}
