import {
  generateAboutSection,
  generateCtaSection,
  generateFaqSection,
  generateHeroSection,
  generateServicesSection,
} from "./content-generator";
import type { BusinessBrief, ContentDraft, EngineContext, WebsitePlan } from "./types";
import { reviewContent } from "@/lib/review/content/engine";
import {
  formatHealingFeedback,
  planContentReviewHealingTasks,
  shouldRunContentReviewSelfHealing,
  type ContentReviewHealingTask,
  type ContentReviewSelfHealing,
} from "@/lib/review/content/self-healing";
import type { ContentReviewInput, ContentReviewReport } from "@/lib/review/content/types";

type AgentCtx = {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
};

export type RunContentReviewSelfHealingParams = {
  agentCtx: AgentCtx;
  input: ContentReviewInput;
  content: ContentDraft;
  report: ContentReviewReport;
  maxTasks?: number;
  onProgress?: (payload: { stage: "content_review_healing"; label: string }) => void;
};

export type RunContentReviewSelfHealingResult = {
  content: ContentDraft;
  report: ContentReviewReport;
  selfHealing: ContentReviewSelfHealing;
};

async function regenerateSection(
  agentCtx: AgentCtx,
  section: ContentReviewHealingTask["section"],
  feedback: string,
  content: ContentDraft,
): Promise<ContentDraft> {
  const ctx = { ...agentCtx, contentReviewFeedback: feedback };

  switch (section) {
    case "hero":
      return { ...content, hero: await generateHeroSection(ctx) };
    case "about":
      return { ...content, about: await generateAboutSection(ctx) };
    case "services":
      return { ...content, services: await generateServicesSection(ctx) };
    case "faq":
      return { ...content, faq: await generateFaqSection(ctx) };
    case "cta": {
      const cta = await generateCtaSection(ctx, content.hero);
      return {
        ...content,
        cta,
        hero: {
          ...content.hero,
          primaryCTA: cta.primaryCTA || content.hero.primaryCTA,
          secondaryCTA: cta.secondaryCTA || content.hero.secondaryCTA,
        },
      };
    }
    default:
      return content;
  }
}

function reviewInputFromContent(input: ContentReviewInput, content: ContentDraft): ContentReviewInput {
  return {
    ...input,
    hero: content.hero,
    about: content.about,
    services: content.services,
    faq: content.faq,
    cta: content.cta,
    contact: content.contact,
  };
}

export async function runContentReviewSelfHealing(
  params: RunContentReviewSelfHealingParams,
): Promise<RunContentReviewSelfHealingResult> {
  const { agentCtx, input, maxTasks = 2, onProgress } = params;
  let content = params.content;

  if (!shouldRunContentReviewSelfHealing(params.report)) {
    return {
      content,
      report: params.report,
      selfHealing: { tasks: [], regeneratedSections: [] },
    };
  }

  const pendingTasks = planContentReviewHealingTasks(params.report, maxTasks);

  const tasks: ContentReviewHealingTask[] = [];
  const regeneratedSections: string[] = [];

  for (const task of pendingTasks) {
    onProgress?.({
      stage: "content_review_healing",
      label: task.action,
    });

    try {
      content = await regenerateSection(
        agentCtx,
        task.section,
        formatHealingFeedback(task.reasons),
        content,
      );
      tasks.push({ ...task, status: "completed" });
      regeneratedSections.push(task.section);
    } catch (error) {
      console.warn(`Content review healing failed for ${task.section}:`, error);
      tasks.push({ ...task, status: "failed" });
    }
  }

  const reviewed = reviewContent(reviewInputFromContent(input, content));

  return {
    content,
    report: {
      ...reviewed,
      selfHealing: {
        tasks,
        regeneratedSections,
      },
    },
    selfHealing: {
      tasks,
      regeneratedSections,
    },
  };
}
