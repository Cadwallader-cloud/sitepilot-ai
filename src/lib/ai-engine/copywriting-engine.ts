/**
 * Crestis AI Engine V2 — Layer 4: Copywriting Engine
 *
 * Separate agents (not one GPT call for the whole site):
 *   Hero AI → About AI → Service AI → FAQ AI → CTA AI
 *
 * When Hero Pipeline already produced a Final hero, pass lockedHero and skip Hero AI.
 * Each agent receives ONLY the context it needs (isolation).
 */

import {
  generateAboutSection,
  generateCtaSection,
  generateFaqSection,
  generateHeroSection,
  generateServicesSection,
  generateTestimonialsSection,
} from "./content-generator";
import {
  COPY_AGENT_LABELS,
  type CopyAgentName,
} from "./prompts/copywriting";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  WebsitePlan,
} from "./types";

export type CopyAgentProgress = {
  agent: CopyAgentName;
  label: string;
};

type AgentCtx = {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
};

/**
 * Layer 4 entry — runs specialized copy agents with isolated context.
 */
export async function runCopywritingEngine(
  ctx: EngineContext,
  brief: BusinessBrief,
  plan: WebsitePlan,
  onAgent?: (p: CopyAgentProgress) => void,
  options?: {
    lockedHero?: ContentDraft["hero"];
    lockedAbout?: ContentDraft["about"];
  },
): Promise<ContentDraft> {
  const c: AgentCtx = { ctx, brief, plan };
  const emit = (agent: CopyAgentName) =>
    onAgent?.({ agent, label: COPY_AGENT_LABELS[agent] });

  if (!options?.lockedHero) emit("hero_ai");
  if (!options?.lockedAbout) emit("about_ai");
  emit("service_ai");
  emit("faq_ai");

  if (plan.sections.some((s) => s.id === "testimonials")) {
    emit("testimonials_ai");
  }

  const [hero, about, services, faq, testimonials] = await Promise.all([
    options?.lockedHero
      ? Promise.resolve(options.lockedHero)
      : generateHeroSection(c),
    options?.lockedAbout
      ? Promise.resolve(options.lockedAbout)
      : generateAboutSection(c),
    generateServicesSection(c),
    generateFaqSection(c),
    generateTestimonialsSection(c),
  ]);

  emit("cta_ai");
  const cta = await generateCtaSection(c, hero);

  return {
    hero,
    about,
    services,
    testimonials,
    faq,
    cta,
    contact: {
      phone: ctx.input.phone.trim(),
      email: ctx.input.email.trim(),
      address: brief.city,
    },
  };
}
