/**
 * Agent ownership acceptance tests.
 * Run: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_WEBSITE_OWNERSHIP,
  CRESTIS_OWNED_PATHS,
  agentOwns,
  assertAgentMayWrite,
  ownershipTableMarkdown,
} from "./website-ownership";

describe("AI Website ownership", () => {
  it("maps every listed agent to exactly one primary surface", () => {
    assert.deepEqual([...AI_WEBSITE_OWNERSHIP.business_analyzer], ["business"]);
    assert.deepEqual([...AI_WEBSITE_OWNERSHIP.brand_personality], ["branding"]);
    assert.deepEqual([...AI_WEBSITE_OWNERSHIP.website_planner], ["pages"]);
    assert.deepEqual([...AI_WEBSITE_OWNERSHIP.seo_generator], ["seo"]);
    assert.deepEqual([...AI_WEBSITE_OWNERSHIP.theme_engine], ["theme"]);
    assert.ok(
      AI_WEBSITE_OWNERSHIP.hero_generator[0]?.includes("hero"),
    );
  });

  it("Crestis-owned paths are not AI-owned", () => {
    for (const path of CRESTIS_OWNED_PATHS) {
      assert.equal(agentOwns("business_analyzer", path), false);
      assert.equal(agentOwns("seo_generator", path), false);
      assert.equal(agentOwns("theme_engine", path), false);
    }
  });

  it("assertAgentMayWrite enforces boundaries", () => {
    assert.doesNotThrow(() =>
      assertAgentMayWrite("hero_generator", "pages.sections[type=hero].data"),
    );
    assert.throws(() =>
      assertAgentMayWrite("hero_generator", "seo"),
    );
  });

  it("ownership table markdown is non-empty", () => {
    const md = ownershipTableMarkdown();
    assert.match(md, /Business Analyzer/);
    assert.match(md, /Theme Engine/);
  });
});
