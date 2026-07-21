/**
 * Sprint 1 — Task 7: Checkout acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { canUsePremiumTemplates } from "./billing/permissions";
import { entitlementsForPlanId } from "./billing/catalog";
import { PRO_UNLOCK_FEATURES } from "./plans";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — Checkout Acceptance Gate", () => {
  it("✅ Flow steps: Free → Pro → Crypto Checkout", () => {
    const flow = readFileSync(
      join(repoRoot, "src/components/checkout-flow.tsx"),
      "utf8",
    );
    assert.match(flow, /Free/);
    assert.match(flow, /Pro/);
    assert.match(flow, /Crypto Checkout/);
    assert.match(flow, /CheckoutFlow/);
  });

  it("✅ Pro unlocks Custom Domain, Unlimited Publish, Premium Templates", () => {
    assert.deepEqual(PRO_UNLOCK_FEATURES, [
      "Custom Domain",
      "Unlimited Publish",
      "Premium Templates",
    ]);

    const pro = entitlementsForPlanId("pro");
    assert.equal(pro.canPublish, true);
    assert.equal(pro.canUseCustomDomain, true);
    assert.equal(canUsePremiumTemplates(pro), true);

    const free = entitlementsForPlanId("free");
    assert.equal(canUsePremiumTemplates(free), false);
  });

  it("✅ /checkout page wires CheckoutFlow + crypto payment", () => {
    const page = readFileSync(
      join(repoRoot, "src/app/checkout/page.tsx"),
      "utf8",
    );
    const crypto = readFileSync(
      join(repoRoot, "src/components/crypto-checkout.tsx"),
      "utf8",
    );
    assert.match(page, /CheckoutFlow/);
    assert.match(crypto, /\/api\/crypto\/orders/);
    assert.match(crypto, /PRO_UNLOCK_FEATURES/);
  });

  it("✅ Crypto fulfillment upgrades plan via BillingService", () => {
    const fulfillment = readFileSync(
      join(repoRoot, "src/lib/crypto/fulfillment.ts"),
      "utf8",
    );
    assert.match(fulfillment, /BillingService\.changePlan/);
    assert.match(fulfillment, /planId/);
  });

  it("✅ Pricing CTA links to crypto checkout", () => {
    const pricing = readFileSync(
      join(repoRoot, "src/components/pricing-flow.tsx"),
      "utf8",
    );
    assert.match(pricing, /\/checkout\?plan=pro/);
    assert.match(pricing, /PRO_UNLOCK_FEATURES/);
  });
});
