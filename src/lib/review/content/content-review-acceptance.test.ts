/**
 * Content Review Engine — acceptance (Phase 3.1 gate)
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  CONTENT_REVIEW_ENGINE_RULE,
  CONTENT_REVIEW_THRESHOLD,
  computeFinalScore,
  contentReviewBrief,
  planContentReviewHealingTasks,
  reviewAbout,
  reviewContent,
  reviewCta,
  reviewFaq,
  reviewHero,
  reviewReadability,
  reviewServices,
  reviewUniqueness,
  CONTENT_REVIEWERS,
  heroReviewer,
  reviewWebsite,
  reviewWebsiteJson,
  SECTION_REVIEW_WEIGHTS,
  SECTION_SCORE_POINTS,
  type ContentReviewInput,
} from "@/lib/review/content/engine";
import type { WebsiteJson } from "@/lib/website-json";
import { websiteFromFlat } from "@/lib/website";

const here = dirname(fileURLToPath(import.meta.url));
const qaStepPath = join(here, "../../ai/orchestrator/steps/qa.step.ts");

function readContentReviewSources(): string[] {
  const root = here;
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
        files.push(readFileSync(fullPath, "utf8"));
      }
    }
  };
  walk(root);
  return files;
}

function strongInput(): ContentReviewInput {
  return {
    location: "Travis County, Austin, TX",
    category: "Roofing",
    hero: {
      headline: "Storm-tough roof repair for Austin, TX homeowners",
      subheadline:
        "Licensed Austin crew for leaks, shingles, and emergency tarping across Travis County with photo reports after every visit.",
      primaryCTA: "Get a free roof inspection",
      secondaryCTA: "Call now",
      trustBar: ["Licensed & insured", "Same-week slots", "Photo report included"],
    },
    about: {
      title: "Local Austin roofers who show their work",
      text: [
        "Since 2012, our crew has completed 850+ roof repairs across Travis County with photo reports on every job.",
        "We help Austin homeowners fix storm damage without surprise pricing or vague timelines.",
        "Every visit starts with photos, a written scope, and a clear quote before work begins — licensed, insured, and trusted by neighbors.",
      ].join("\n\n"),
      paragraphs: [
        "Since 2012, our crew has completed 850+ roof repairs across Travis County with photo reports on every job.",
        "We help Austin homeowners fix storm damage without surprise pricing or vague timelines.",
        "Every visit starts with photos, a written scope, and a clear quote before work begins — licensed, insured, and trusted by neighbors.",
      ],
      highlights: ["Photo reports every job", "Clear written quotes", "Storm response crew"],
    },
    services: [
      {
        title: "Emergency leak patch",
        description: "Same-day tarping and leak isolation to stop interior damage fast.",
        benefits: ["Fast dispatch", "Photo documentation", "Insurance-ready notes"],
        cta: "Book emergency patch",
        featured: true,
      },
      {
        title: "Shingle replacement",
        description: "Match existing shingles and replace damaged sections after hail or wind.",
        benefits: ["Color match check", "Vent inspection", "Cleanup included"],
        cta: "Get shingle quote",
      },
      {
        title: "Full roof replacement",
        description: "Complete tear-off and install with upgraded underlayment for Austin heat.",
        benefits: ["Material options", "Ventilation review", "Warranty guidance"],
        cta: "Schedule replacement consult",
      },
    ],
    faq: [
      {
        question: "How much does a roof inspection cost in Austin?",
        answer:
          "Inspections are free for most Austin homeowners and include photos plus a written scope before any work starts.",
      },
      {
        question: "Do you help with insurance claims after hail damage?",
        answer:
          "Yes. We document storm damage with photos and notes your adjuster can use during the claim review.",
      },
      {
        question: "How long does a shingle replacement usually take?",
        answer:
          "Most section replacements finish in one day, depending on roof size, access, and weather conditions.",
      },
      {
        question: "Can you tarp a roof leak the same day I call?",
        answer:
          "Same-day tarping is often available for active leaks when crew capacity allows in Travis County.",
      },
      {
        question: "What warranties come with a full roof replacement?",
        answer:
          "We walk through manufacturer material warranties and our workmanship coverage before you approve the scope.",
      },
      {
        question: "Do you serve Travis County for roof repairs and replacements?",
        answer:
          "Yes. We serve Austin, Travis County, and nearby neighborhoods shown in your project quote.",
      },
    ],
    cta: {
      headline: "Ready for a clear roof plan in Austin?",
      primaryCTA: "Book inspection",
      secondaryCTA: "Call the crew",
    },
    contact: {
      phone: "+1 512 555 0100",
      email: "hello@apexroof.example",
      address: "Austin, TX",
    },
  };
}

function weakInput(): ContentReviewInput {
  return {
    location: "Travis County, Austin, TX",
    hero: {
      headline: "Professional roofing services",
      subheadline: "",
      primaryCTA: "Contact us",
      secondaryCTA: "",
    },
    about: {
      title: "",
      text: "We are passionate about quality you can trust.",
    },
    services: [
      { title: "Service", description: "We help.", benefits: ["A", "B"] },
      { title: "Service", description: "We help.", benefits: ["A", "B"] },
    ],
    faq: [{ question: "Do you serve?", answer: "Yes." }],
    contact: {
      phone: "+1 512 555 0100",
      email: "hello@example.com",
      address: "Austin, TX",
    },
  };
}

function websiteJsonFromInput(input: ContentReviewInput): WebsiteJson {
  return {
    business: {
      name: "Apex Roofing",
      location: input.location,
      category: input.category,
    },
    theme: {
      primary: "#1e3a5f",
      accent: "#2563eb",
      style: "professional",
      theme: "Modern Premium",
      palette: "Dark Blue",
      font: "Geist",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Professional",
      sectionStyle: "Alternating",
      images: { hero: "https://example.com/h.jpg", gallery: [] },
    },
    seo: {
      title: "Apex Roofing Austin",
      description: "Roof repair in Austin with licensed crew and clear quotes.",
      keywords: ["roof repair", "Austin", "storm damage"],
      canonical: "/",
      slug: "/",
    },
    hero: input.hero,
    about: input.about,
    services: input.services,
    projects: [],
    faq: input.faq,
    testimonials: [],
    cta: input.cta,
    contact: input.contact,
  };
}

describe("Content Review Engine Acceptance Gate", () => {
  it("✅ Content Review Engine працює", () => {
    const report = reviewContent(strongInput());
    assert.ok(report.sections);
    assert.ok(report.final);
    assert.ok(report.report);
    assert.equal(typeof report.final.passed, "boolean");
    assert.ok(contentReviewBrief(report).includes("CONTENT REVIEW"));
    assert.equal(reviewWebsiteJson(websiteJsonFromInput(strongInput())).final.score, report.final.score);
  });

  it("✅ Hero оцінюється окремо", () => {
    const heroOnly = reviewHero(strongInput());
    const tweaked = reviewHero({
      ...strongInput(),
      hero: { ...strongInput().hero, headline: "Quality roofing services", subheadline: "" },
    });
    assert.equal(heroOnly.id, "hero");
    assert.ok(heroOnly.score >= 0 && heroOnly.score <= 100);
    assert.notEqual(heroOnly.score, tweaked.score);
    assert.ok(tweaked.score < heroOnly.score);
  });

  it("✅ About оцінюється окремо", () => {
    const aboutOnly = reviewAbout(strongInput());
    const weakAbout = reviewAbout(weakInput());
    assert.equal(aboutOnly.id, "about");
    assert.ok(aboutOnly.score >= 0 && aboutOnly.score <= 100);
    assert.notEqual(aboutOnly.score, weakAbout.score);
    assert.ok(weakAbout.score < aboutOnly.score);
  });

  it("✅ Services оцінюються окремо", () => {
    const servicesOnly = reviewServices(strongInput());
    const weakServices = reviewServices(weakInput());
    assert.equal(servicesOnly.id, "services");
    assert.ok(servicesOnly.score >= 0 && servicesOnly.score <= 100);
    assert.notEqual(servicesOnly.score, weakServices.score);
    assert.ok(weakServices.score < servicesOnly.score);
  });

  it("✅ FAQ оцінюється окремо", () => {
    const faqOnly = reviewFaq(strongInput());
    const weakFaq = reviewFaq(weakInput());
    assert.equal(faqOnly.id, "faq");
    assert.ok(faqOnly.score >= 0 && faqOnly.score <= 100);
    assert.notEqual(faqOnly.score, weakFaq.score);
    assert.ok(weakFaq.score < faqOnly.score);
  });

  it("✅ CTA перевіряється", () => {
    const cta = reviewCta(strongInput());
    const weakCta = reviewCta(weakInput());
    assert.equal(cta.id, "cta");
    assert.ok(cta.checks.some((check) => check.id === "cta_present"));
    assert.ok(cta.checks.some((check) => check.id === "cta_strength"));
    assert.ok(weakCta.checks.some((check) => check.id === "cta_strength" && check.status !== "pass"));
  });

  it("✅ Виявляються шаблонні AI-фрази", () => {
    const clean = reviewUniqueness(strongInput());
    const cliche = reviewUniqueness({
      ...strongInput(),
      about: {
        ...strongInput().about,
        text: "We are committed to customer satisfaction through professional solutions.",
        paragraphs: undefined,
      },
    });
    assert.ok(clean.checks.some((check) => check.id === "ai_phrases" && check.status === "pass"));
    assert.ok(
      cliche.checks.some((check) => check.id.startsWith("ai_phrase_") && check.status === "fail"),
    );
    assert.ok(cliche.score < clean.score);
  });

  it("✅ Повертається оцінка 0–100", () => {
    const report = reviewContent(weakInput());
    const scores = [
      report.final.score,
      report.report.overall,
      ...Object.values(report.sections).map((section) => section.score),
      ...Object.values(report.report).filter((value): value is number => typeof value === "number"),
    ];
    for (const score of scores) {
      assert.ok(score >= 0 && score <= 100, `score out of range: ${score}`);
    }
    assert.equal(
      Object.values(SECTION_SCORE_POINTS).reduce((sum, value) => sum + value, 0),
      100,
    );
  });

  it("✅ Проблемні секції можна автоматично перегенерувати", () => {
    const weak = reviewContent({
      ...strongInput(),
      hero: {
        headline: "Quality roofing services",
        subheadline: "",
        primaryCTA: "Learn More",
        secondaryCTA: "",
      },
    });
    const tasks = planContentReviewHealingTasks(weak);
    const heroTask = tasks.find((task) => task.section === "hero");
    assert.ok(heroTask);
    assert.equal(heroTask.action, "Regenerate Hero");
    assert.ok(heroTask.reasons.length > 0);

    const qaSrc = readFileSync(qaStepPath, "utf8");
    assert.match(qaSrc, /runContentReviewSelfHealing/);
    assert.equal(CONTENT_REVIEWERS.length, 7);
  });
});

describe("Content Review Engine Acceptance", () => {
  it("✅ Reviewer interface — async review(website) → ReviewResult", async () => {
    const website = websiteFromFlat(websiteJsonFromInput(strongInput()), { id: "rev-1" });
    const result = await heroReviewer.review(website);
    assert.equal(typeof result.score, "number");
    assert.equal(typeof result.passed, "boolean");
    assert.ok(Array.isArray(result.issues));
    assert.ok(Array.isArray(result.recommendations));
    assert.ok(result.passed);
    assert.equal(result.issues.length, 0);

    const weak = await heroReviewer.review(
      websiteFromFlat(websiteJsonFromInput(weakInput()), { id: "rev-2" }),
    );
    assert.ok(!weak.passed);
    assert.ok(weak.issues.length > 0);
    assert.ok(weak.recommendations.length > 0);

    const report = await reviewWebsite(website);
    assert.equal(Object.keys(report.sections).length, CONTENT_REVIEWERS.length);
    assert.equal(report.final.score, reviewContent(strongInput()).final.score);
  });

  it("✅ flags generic hero and AI-smell copy", () => {
    const weak = reviewContent(weakInput());
    assert.ok(weak.sections.hero.score < CONTENT_REVIEW_THRESHOLD);
    assert.ok(
      weak.sections.hero.checks.some(
        (entry) => entry.id === "headline_specificity" && entry.status === "fail",
      ),
    );
    assert.ok(
      weak.sections.uniqueness.checks.some((entry) => entry.id.startsWith("ai_phrase_")),
    );
  });

  it("✅ Hero Reviewer — headline length, specificity, geography, value", () => {
    const good = reviewHero({
      ...strongInput(),
      hero: {
        headline: "Roof repair in London, UK within 24 hours for homeowners",
        subheadline:
          "Licensed emergency crew for leaks, storm damage, and insurance-ready reports across Central London.",
        primaryCTA: "Book inspection",
        secondaryCTA: "Call now",
        trustBar: ["Licensed & insured", "24-hour response"],
      },
      location: "Central London, UK",
    });
    assert.ok(good.checks.find((entry) => entry.id === "headline_words")?.status === "pass");
    assert.ok(
      good.checks.find((entry) => entry.id === "headline_specificity")?.status === "pass",
    );
    assert.ok(good.checks.find((entry) => entry.id === "geo_city")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "geo_country")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "value_proposition")?.status === "pass");

    const short = reviewHero({
      ...strongInput(),
      hero: {
        ...strongInput().hero,
        headline: "Roof repair now",
      },
    });
    assert.ok(
      short.checks.find((entry) => entry.id === "headline_words")?.status === "fail",
    );

    const long = reviewHero({
      ...strongInput(),
      hero: {
        ...strongInput().hero,
        headline:
          "Emergency roof repair replacement inspection tarping and storm damage help for Austin Texas homeowners today now fast",
      },
    });
    assert.ok(long.checks.find((entry) => entry.id === "headline_words")?.status === "fail");

    const generic = reviewHero({
      ...strongInput(),
      hero: {
        ...strongInput().hero,
        headline: "Quality roofing services",
        subheadline: "",
        trustBar: [],
      },
    });
    assert.ok(
      generic.checks.find((entry) => entry.id === "headline_specificity")?.status === "fail",
    );
    assert.ok(
      generic.checks.find((entry) => entry.id === "value_proposition")?.status === "fail",
    );
  });

  it("✅ CTA Reviewer — present and starts with verb", () => {
    const good = reviewCta({
      ...strongInput(),
      hero: {
        ...strongInput().hero,
        primaryCTA: "Get Free Quote",
        secondaryCTA: "Call Now",
      },
      cta: {
        headline: "Ready to fix your roof?",
        primaryCTA: "Schedule Today",
        secondaryCTA: "Book Inspection",
      },
    });
    assert.ok(good.checks.find((entry) => entry.id === "cta_present")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "cta_strength")?.status === "pass");

    const strong = reviewCta({
      ...strongInput(),
      hero: { ...strongInput().hero, primaryCTA: "Book Free Estimate", secondaryCTA: "" },
    });
    assert.ok(strong.checks.find((entry) => entry.id === "cta_strength")?.status === "pass");

    const weakLabel = reviewCta({
      ...strongInput(),
      hero: { ...strongInput().hero, primaryCTA: "Learn More", secondaryCTA: "" },
    });
    assert.ok(weakLabel.checks.find((entry) => entry.id === "cta_strength")?.status === "warn");

    const missing = reviewCta({
      ...strongInput(),
      hero: { ...strongInput().hero, primaryCTA: "", secondaryCTA: "" },
    });
    assert.ok(missing.checks.find((entry) => entry.id === "cta_present")?.status === "fail");

    const weakVerb = reviewCta({
      ...strongInput(),
      hero: { ...strongInput().hero, primaryCTA: "Free Quote", secondaryCTA: "" },
    });
    assert.ok(weakVerb.checks.find((entry) => entry.id === "cta_strength")?.status === "fail");

    const generic = reviewCta({
      ...strongInput(),
      hero: { ...strongInput().hero, primaryCTA: "Contact us", secondaryCTA: "" },
    });
    assert.ok(generic.checks.find((entry) => entry.id === "cta_strength")?.status === "warn");
  });

  it("✅ FAQ Reviewer — natural, unique, niche-fit questions", () => {
    const good = reviewFaq(strongInput());
    assert.ok(good.checks.find((entry) => entry.id === "faq_natural")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "faq_unique")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "faq_niche")?.status === "pass");

    const weak = reviewFaq(weakInput());
    assert.ok(weak.checks.find((entry) => entry.id === "faq_natural")?.status !== "pass");
    assert.ok(weak.checks.find((entry) => entry.id === "faq_niche")?.status !== "pass");

    const duplicated = reviewFaq({
      ...strongInput(),
      faq: Array.from({ length: 6 }, () => ({
        question: "How much does a roof inspection cost in Austin?",
        answer: "Inspections are free and include photos plus a written scope.",
      })),
    });
    assert.ok(duplicated.checks.find((entry) => entry.id === "faq_unique")?.status === "fail");
  });

  it("✅ About Reviewer — no fluff, story, numbers, experience, trust", () => {
    const good = reviewAbout(strongInput());
    assert.ok(good.checks.find((entry) => entry.id === "no_fluff")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "story")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "numbers")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "experience")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "trust")?.status === "pass");

    const weak = reviewAbout(weakInput());
    assert.ok(weak.checks.find((entry) => entry.id === "no_fluff")?.status === "fail");
    assert.ok(weak.checks.find((entry) => entry.id === "story")?.status === "warn");
    assert.ok(weak.checks.find((entry) => entry.id === "numbers")?.status === "warn");
    assert.ok(weak.checks.find((entry) => entry.id === "experience")?.status === "warn");
    assert.ok(weak.checks.find((entry) => entry.id === "trust")?.status === "warn");
  });

  it("✅ Services Reviewer — Name → Description → Benefits → CTA per service", () => {
    const good = reviewServices(strongInput());
    assert.ok(good.checks.find((entry) => entry.id === "service_title")?.status === "pass");
    assert.ok(
      good.checks.find((entry) => entry.id === "service_description")?.status === "pass",
    );
    assert.ok(good.checks.find((entry) => entry.id === "service_benefits")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "service_cta")?.status === "pass");

    const weak = reviewServices(weakInput());
    assert.ok(weak.checks.find((entry) => entry.id === "service_title")?.status !== "pass");
    assert.ok(weak.checks.find((entry) => entry.id === "service_description")?.status !== "pass");
    assert.ok(weak.checks.find((entry) => entry.id === "service_benefits")?.status !== "pass");
    assert.ok(weak.checks.find((entry) => entry.id === "service_cta")?.status === "fail");
  });

  it("✅ Readability Reviewer — short sentences, paragraph lines, active voice, plain English", () => {
    const good = reviewReadability(strongInput());
    assert.ok(good.checks.find((entry) => entry.id === "short_sentences")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "paragraph_lines")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "passive_voice")?.status === "pass");
    assert.ok(good.checks.find((entry) => entry.id === "simple_english")?.status === "pass");

    const heavy = reviewReadability({
      ...strongInput(),
      about: {
        ...strongInput().about,
        paragraphs: [
          "Our comprehensive methodology is subsequently leveraged to facilitate multifaceted stakeholder deliverables that were handled by our team.",
          "Line two.\nLine three.\nLine four.\nLine five.\nLine six.\nLine seven.",
        ],
      },
    });
    assert.ok(heavy.checks.find((entry) => entry.id === "simple_english")?.status !== "pass");
    assert.ok(heavy.checks.find((entry) => entry.id === "paragraph_lines")?.status !== "pass");
  });

  it("✅ Uniqueness Reviewer — each AI cliché lowers the score", () => {
    const clean = reviewUniqueness(strongInput());
    assert.ok(clean.checks.find((entry) => entry.id === "ai_phrases")?.status === "pass");
    assert.equal(clean.score, 100);

    const cliche = reviewUniqueness({
      ...strongInput(),
      about: {
        ...strongInput().about,
        text: "We are committed to customer satisfaction through high-quality service and professional solutions.",
        paragraphs: undefined,
      },
    });
    assert.ok(cliche.score < 100);
    assert.ok(cliche.checks.filter((entry) => entry.id.startsWith("ai_phrase_")).length >= 4);
  });

  it("✅ AI Self-Healing — weak section creates Regenerate task with reasons", () => {
    const weakHero = reviewContent({
      ...strongInput(),
      hero: {
        headline: "Quality roofing services",
        subheadline: "Professional solutions for everyone.",
        primaryCTA: "Learn More",
        secondaryCTA: "",
      },
    });

    const tasks = planContentReviewHealingTasks(weakHero);
    const heroTask = tasks.find((task) => task.section === "hero");
    assert.ok(heroTask);
    assert.equal(heroTask.action, "Regenerate Hero");
    assert.ok(heroTask.score < CONTENT_REVIEW_THRESHOLD);
    assert.ok(heroTask.reasons.includes("Headline too generic"));
    assert.ok(heroTask.reasons.includes("No location"));
    assert.ok(heroTask.reasons.includes("Weak CTA"));
    assert.equal(heroTask.status, "pending");
  });

  it("✅ Final Report — overall, section scores, structured issues", () => {
    const genericHero = reviewContent({
      ...strongInput(),
      hero: {
        ...strongInput().hero,
        headline: "Quality roofing services",
        subheadline: "",
      },
    });

    assert.equal(genericHero.report.overall, genericHero.final.score);
    assert.equal(genericHero.report.hero, genericHero.sections.hero.score);
    assert.ok(
      genericHero.report.issues.some(
        (issue) =>
          issue.section === "hero" &&
          issue.severity === "error" &&
          issue.message === "Headline too generic." &&
          issue.suggestion === "Mention location and primary service.",
      ),
    );
  });

  it("✅ rewards distinct services and FAQ depth", () => {
    const strong = reviewContent(strongInput());
    assert.ok(strong.sections.services.score >= CONTENT_REVIEW_THRESHOLD);
    assert.ok(strong.sections.faq.score >= CONTENT_REVIEW_THRESHOLD);
  });
});
