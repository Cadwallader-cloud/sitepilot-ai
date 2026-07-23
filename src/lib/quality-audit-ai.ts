import type { BusinessFormInput } from "./business-form";
import { getOpenAIClient } from "./generate-site-ai";
import {
  auditWebsiteWithRules,
  mergeQualityAudits,
  parseAiQualityAudit,
  type QualityAuditResult,
} from "./quality-audit";
import type { GeneratedSite } from "./site-types";
import { getHero } from "./site-types";
import { logOpenAiUsage } from "./usage";

const CRITIC_SYSTEM = `You wrote this local-business website. Now audit YOUR OWN work honestly.

Score 0–100 and return ONLY valid JSON:
{
  "score": 92,
  "summary": "one short sentence",
  "checks": [
    { "id": "seo", "label": "SEO", "status": "pass|warn|fail", "message": "optional short note" },
    { "id": "cta", "label": "CTA", "status": "pass|warn|fail", "message": "..." },
    { "id": "images", "label": "Images", "status": "pass|warn|fail" },
    { "id": "mobile", "label": "Mobile", "status": "pass|warn|fail" },
    { "id": "faq", "label": "FAQ", "status": "pass|warn|fail" },
    { "id": "hero", "label": "Hero", "status": "pass|warn|fail", "message": "..." },
    { "id": "about", "label": "About", "status": "pass|warn|fail" },
    { "id": "services", "label": "Services", "status": "pass|warn|fail" },
    { "id": "local", "label": "Local", "status": "pass|warn|fail" },
    { "id": "contact", "label": "Contact", "status": "pass|warn|fail" },
    { "id": "testimonials", "label": "Reviews", "status": "pass|warn|fail" }
  ]
}

Be strict about:
- Generic heroes like "Professional … Services"
- Missing city / local mentions
- Thin about/service copy
- Weak CTAs like "Contact Us Today"
- Incomplete SEO or contact
- Duplicate-sounding service or review text
- FAQ that ignores the niche

Mobile: pass if the site has a normal multi-section layout (it does).
Images: pass if hero + gallery URLs exist.
Use warn for improvements, fail for missing essentials.
Messages should be short and actionable (e.g. "Hero could be more specific").`;

export async function runQualityAudit(options: {
  site: GeneratedSite;
  location: string;
  category?: string;
  services?: string;
  userEmail?: string | null;
}): Promise<QualityAuditResult> {
  const location = options.location.trim();
  const rules = auditWebsiteWithRules(options.site, location, {
    category: options.category,
  });

  const openai = getOpenAIClient();
  if (!openai) {
    return { ...rules, summary: `${rules.summary} (rules only — OpenAI not configured)` };
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const payload = {
    businessName: options.site.businessName,
    location,
    services: options.services ?? "",
    hero: getHero(options.site),
    about: options.site.about,
    servicesList: options.site.services,
    faq: options.site.faq,
    seo: options.site.seo,
    contact: options.site.contact,
    testimonials: options.site.testimonials.map((t) => ({
      name: t.name,
      text: t.text,
      demo: t.demo,
    })),
    hasImages: Boolean(options.site.images.hero && options.site.images.gallery?.length),
    theme: options.site.theme,
  };

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CRITIC_SYSTEM },
        {
          role: "user",
          content: `Audit this website you generated:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    await logOpenAiUsage({
      userEmail: options.userEmail ?? null,
      model,
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return { ...rules, source: "rules" };

    const ai = parseAiQualityAudit(JSON.parse(raw));
    if (!ai) return { ...rules, source: "rules" };

    return mergeQualityAudits(rules, ai);
  } catch (error) {
    console.warn("AI quality audit failed, using rules:", error);
    return {
      ...rules,
      summary: `${rules.summary} (AI critique unavailable)`,
    };
  }
}

export type QualityAuditRequest = {
  site: GeneratedSite;
  input?: Pick<BusinessFormInput, "location" | "services">;
  location?: string;
};
