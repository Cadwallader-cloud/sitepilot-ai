import {
  clampCroScore,
  croNeedsWork,
  type CroPatches,
  type CroReport,
} from "../cro";
import { completeJsonObject } from "./openai-json";
import { CRO_AI_SYSTEM, croAiUser } from "./prompts/cro-ai";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  WebsitePlan,
} from "./types";

type CroAiJson = {
  willCall?: number;
  willSubmitForm?: number;
  trustEnough?: number;
  overallConversion?: number;
  blockers?: string[];
  verdict?: string;
  patches?: CroPatches;
};

function cleanStr(value: unknown, max = 160): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

function sanitizePatches(
  raw: CroPatches | undefined,
  phone: string,
): CroPatches {
  if (!raw || typeof raw !== "object") return {};

  const hero = raw.hero
    ? {
        primaryCTA: cleanStr(raw.hero.primaryCTA, 48),
        secondaryCTA: cleanStr(raw.hero.secondaryCTA, 64),
        subheadline: cleanStr(raw.hero.subheadline, 160),
      }
    : undefined;

  const cta = raw.cta
    ? {
        headline: cleanStr(raw.cta.headline, 90),
        primaryCTA: cleanStr(raw.cta.primaryCTA, 48),
        secondaryCTA: cleanStr(raw.cta.secondaryCTA, 64),
      }
    : undefined;

  const about = raw.about
    ? { text: cleanStr(raw.about.text, 900) }
    : undefined;

  // If phone exists and secondary CTA patch is empty-ish generic, prefer Call phone
  if (phone && hero?.secondaryCTA) {
    const low = hero.secondaryCTA.toLowerCase();
    if (
      low.includes("learn more") ||
      low.includes("contact us") ||
      low === "get started"
    ) {
      hero.secondaryCTA = `Call ${phone}`;
    }
  }

  return {
    ...(hero && (hero.primaryCTA || hero.secondaryCTA || hero.subheadline)
      ? { hero }
      : {}),
    ...(cta && (cta.headline || cta.primaryCTA || cta.secondaryCTA)
      ? { cta }
      : {}),
    ...(about?.text ? { about } : {}),
  };
}

/** Apply CRO patches onto content (data only — never HTML). */
export function applyCroPatches(
  content: ContentDraft,
  patches: CroPatches,
): { content: ContentDraft; patched: string[] } {
  const patched: string[] = [];
  let next = { ...content };

  if (patches.hero) {
    const hero = { ...next.hero };
    if (patches.hero.primaryCTA) {
      hero.primaryCTA = patches.hero.primaryCTA;
      patched.push("hero.primaryCTA");
    }
    if (patches.hero.secondaryCTA) {
      hero.secondaryCTA = patches.hero.secondaryCTA;
      patched.push("hero.secondaryCTA");
    }
    if (patches.hero.subheadline) {
      hero.subheadline = patches.hero.subheadline;
      patched.push("hero.subheadline");
    }
    next = { ...next, hero };
  }

  if (patches.cta && next.cta) {
    const cta = { ...next.cta };
    if (patches.cta.headline) {
      cta.headline = patches.cta.headline;
      patched.push("cta.headline");
    }
    if (patches.cta.primaryCTA) {
      cta.primaryCTA = patches.cta.primaryCTA;
      patched.push("cta.primaryCTA");
    }
    if (patches.cta.secondaryCTA) {
      cta.secondaryCTA = patches.cta.secondaryCTA;
      patched.push("cta.secondaryCTA");
    }
    next = { ...next, cta };
  } else if (patches.cta && !next.cta) {
    next = {
      ...next,
      cta: {
        headline: patches.cta.headline || next.hero.primaryCTA,
        primaryCTA: patches.cta.primaryCTA || next.hero.primaryCTA,
        secondaryCTA: patches.cta.secondaryCTA || next.hero.secondaryCTA,
      },
    };
    patched.push("cta");
  }

  if (patches.about?.text) {
    next = {
      ...next,
      about: { ...next.about, text: patches.about.text },
    };
    patched.push("about.text");
  }

  return { content: next, patched };
}

/**
 * Layer 7 — CRO AI
 * Separate agent. Looks at Call / form / trust — not beauty.
 */
export async function runCroAi(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  _plan?: WebsitePlan,
): Promise<{ content: ContentDraft; cro: CroReport }> {
  const phone = ctx.input.phone.trim();
  const hasRealReviews = content.testimonials.some((t) => t.demo === false);
  const demoReviewCount = content.testimonials.filter((t) => t.demo === true)
    .length;

  const fallback = (): CroReport => ({
    willCall: phone ? 78 : 55,
    willSubmitForm: 72,
    trustEnough: 70,
    overallConversion: 70,
    blockers: ["CRO AI unavailable — used Crestis conversion fallback"],
    patched: [],
    patches: {},
    verdict: "Fallback scores — regenerate to run full CRO AI",
  });

  try {
    const ai = await completeJsonObject<CroAiJson>({
      stage: "cro_ai",
      userEmail: ctx.options.userEmail,
      temperature: 0.35,
      system: CRO_AI_SYSTEM,
      user: croAiUser({
        businessName: ctx.input.businessName,
        city: brief.city,
        niche: brief.niche,
        phone,
        primaryGoal: brief.dna.primaryGoal || "Generate Leads",
        dnaCta: brief.dna.cta,
        trustSignals: brief.dna.trustSignals ?? [],
        hero: content.hero,
        aboutText: content.about.text,
        cta: content.cta ?? {
          headline: content.hero.primaryCTA,
          primaryCTA: content.hero.primaryCTA,
          secondaryCTA: content.hero.secondaryCTA,
        },
        hasRealReviews,
        demoReviewCount,
        serviceTitles: content.services.map((s) => s.title),
      }),
    });

    const scores = {
      willCall: clampCroScore(ai.willCall),
      willSubmitForm: clampCroScore(ai.willSubmitForm),
      trustEnough: clampCroScore(ai.trustEnough),
      overallConversion: clampCroScore(
        ai.overallConversion,
        Math.round(
          (clampCroScore(ai.willCall) +
            clampCroScore(ai.willSubmitForm) +
            clampCroScore(ai.trustEnough)) /
            3,
        ),
      ),
    };

    const blockers = (Array.isArray(ai.blockers) ? ai.blockers : [])
      .map(String)
      .map((b) => b.trim())
      .filter(Boolean)
      .slice(0, 8);

    let patches = sanitizePatches(ai.patches, phone);

    // Only apply patches when conversion is weak
    if (!croNeedsWork(scores)) {
      patches = {};
    }

    // Soft Crestis rule: if phone exists and secondary never mentions call/digits, force patch
    if (phone) {
      const sec = content.hero.secondaryCTA.toLowerCase();
      const digits = phone.replace(/\D/g, "").slice(-7);
      if (
        !sec.includes("call") &&
        !(digits && sec.replace(/\D/g, "").includes(digits))
      ) {
        patches = {
          ...patches,
          hero: {
            ...patches.hero,
            secondaryCTA: patches.hero?.secondaryCTA || `Call ${phone}`,
          },
        };
      }
    }

    const applied = applyCroPatches(content, patches);

    return {
      content: applied.content,
      cro: {
        ...scores,
        blockers,
        patched: applied.patched,
        patches,
        verdict:
          String(ai.verdict ?? "").trim() ||
          (scores.overallConversion >= 85
            ? "Conversion path is strong enough to publish"
            : "Conversion path needs stronger CTAs or trust"),
      },
    };
  } catch (error) {
    console.warn("CRO AI failed:", error);
    // Still apply phone secondary CTA soft rule
    const phonePatch: CroPatches =
      phone &&
      !content.hero.secondaryCTA.toLowerCase().includes("call") &&
      !content.hero.secondaryCTA.includes(phone)
        ? { hero: { secondaryCTA: `Call ${phone}` } }
        : {};
    const applied = applyCroPatches(content, phonePatch);
    const cro = fallback();
    return {
      content: applied.content,
      cro: { ...cro, patched: applied.patched, patches: phonePatch },
    };
  }
}
