import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeBusinessDna } from "../../business-dna";
import { estimateJsonTokens } from "../../ai/context/estimate-tokens";
import { getIndustryPack, industryPackBrief, industryServicesBrief } from "../../industries";
import {
  SERVICES_SYSTEM,
  servicesBrandProfileJson,
  servicesBrandProfileSlice,
  servicesPlanJson,
  servicesPlanSlice,
  servicesSystem,
  servicesUser,
} from "./services";
import { CRESTIS_SYSTEM } from "./system";

const sampleDna = normalizeBusinessDna(
  {
    industry: "Roofing",
    brandPosition: "Storm-ready local roofer",
    tone: "Direct",
    trustSignals: ["Licensed", "Insured", "Free Estimates"],
    cta: "Request Free Estimate",
  },
  { industry: "Roofing", location: "Austin", services: "Repair, Replace" },
);

const samplePlan = {
  serviceCount: 4,
  positioning: "Trusted local roofing for storm season",
  template: "construction-premium",
  variant: "A",
  goal: "Lead Generation",
  ctaStrategy: "Quote form primary",
} as const;

describe("services prompt slimming", () => {
  it("servicesBrandProfileSlice keeps validation-critical DNA fields only", () => {
    const slice = servicesBrandProfileSlice(sampleDna);
    assert.deepEqual(Object.keys(slice).sort(), [
      "brandPosition",
      "cta",
      "industry",
      "tone",
      "trustSignals",
    ]);
    assert.equal(slice.industry, "Roofing");
    assert.deepEqual(slice.trustSignals, ["Licensed", "Insured", "Free Estimates"]);
  });

  it("servicesPlanSlice keeps serviceCount and positioning only", () => {
    const slice = servicesPlanSlice(samplePlan);
    assert.deepEqual(slice, {
      serviceCount: 4,
      positioning: "Trusted local roofing for storm season",
    });
    assert.equal("template" in slice, false);
    assert.equal("ctaStrategy" in slice, false);
  });

  it("servicesUser omits serviceFocus when priorityJson is present", () => {
    const user = servicesUser({
      businessName: "Apex Roofing",
      city: "Austin",
      niche: "Roofing",
      tone: "Direct",
      serviceFocus: ["Roof Repair", "Storm Damage"],
      priorityJson: JSON.stringify({
        featured: "Roof Repair",
        secondary: ["Storm Damage"],
        optional: [],
      }),
      brandProfileJson: servicesBrandProfileJson(sampleDna),
      planJson: servicesPlanJson(samplePlan),
    });

    assert.match(user, /Service Prioritizer/);
    assert.doesNotMatch(user, /Service focus:/);
    assert.doesNotMatch(user, /Write service cards/);
    assert.doesNotMatch(user, /Exactly 3 outcome benefits/);
  });

  it("industryServicesBrief is smaller than full industryPackBrief", () => {
    const pack = getIndustryPack("roofing");
    const slim = industryServicesBrief(pack, "Austin");
    const full = industryPackBrief(pack, "Austin");
    assert.ok(slim.length < full.length * 0.5);
    assert.match(slim, /Services:/);
    assert.doesNotMatch(slim, /FAQ themes/);
    assert.doesNotMatch(slim, /SEO terms/);
  });

  it("SERVICES_SYSTEM no longer embeds full CRESTIS_SYSTEM", () => {
    assert.doesNotMatch(SERVICES_SYSTEM, /## FAQ/);
    assert.doesNotMatch(SERVICES_SYSTEM, /## Testimonials/);
    assert.ok(SERVICES_SYSTEM.length < CRESTIS_SYSTEM.length * 0.45);
  });

  it("slim services prompt reduces estimated input tokens vs legacy shape", () => {
    const pack = getIndustryPack("roofing");
    const priorityJson = JSON.stringify({
      featured: "Roof Repair",
      secondary: ["Storm Damage", "Inspection"],
      optional: [],
    });

    const slimUser = servicesUser({
      businessName: "Apex Roofing",
      city: "Austin",
      niche: "Roofing",
      tone: "Direct",
      serviceFocus: ["Roof Repair", "Storm Damage", "Inspection"],
      description: "Family-owned roofing crew serving Austin homeowners.",
      personalityBrief: "Voice: Direct · Energy: Bold",
      industryBrief: industryServicesBrief(pack, "Austin"),
      brandProfileJson: servicesBrandProfileJson(sampleDna),
      planJson: servicesPlanJson(samplePlan),
      priorityJson,
    });

    const legacyUser = servicesUser({
      businessName: "Apex Roofing",
      city: "Austin",
      niche: "Roofing",
      tone: "Direct",
      serviceFocus: ["Roof Repair", "Storm Damage", "Inspection"],
      description: "Family-owned roofing crew serving Austin homeowners.",
      personalityBrief: "Voice: Direct · Energy: Bold",
      industryBrief: industryPackBrief(pack, "Austin"),
      brandProfileJson: JSON.stringify(sampleDna, null, 2),
      planJson: JSON.stringify(
        {
          template: samplePlan.template,
          variant: samplePlan.variant,
          goal: samplePlan.goal,
          ctaStrategy: samplePlan.ctaStrategy,
          serviceCount: samplePlan.serviceCount,
          positioning: samplePlan.positioning,
        },
        null,
        2,
      ),
      priorityJson,
    });

    const slimTokens =
      estimateJsonTokens(servicesSystem()) + estimateJsonTokens(slimUser);
    const legacyUserTokens = estimateJsonTokens(legacyUser);
    const slimUserTokens = estimateJsonTokens(slimUser);

    assert.ok(slimUserTokens < legacyUserTokens);
    assert.ok(legacyUserTokens - slimUserTokens >= 200);
    assert.ok(slimTokens < legacyUserTokens + estimateJsonTokens(CRESTIS_SYSTEM));
  });
});
