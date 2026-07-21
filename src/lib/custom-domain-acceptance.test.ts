/**
 * Sprint 1 — Task 6: Custom Domain acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  CUSTOM_DOMAIN_CNAME,
  CUSTOM_DOMAIN_FLOW_STEPS,
  customDomainFlowStep,
} from "./domain-constants";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — Custom Domain Acceptance Gate", () => {
  it("✅ Connect Domain button and example.com placeholder", () => {
    const panel = readFileSync(
      join(repoRoot, "src/components/custom-domain-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /Connect Domain/);
    assert.match(panel, /example\.com/);
  });

  it("✅ Flow steps: Domain → DNS Instructions → Verify → SSL → Connected", () => {
    assert.deepEqual(CUSTOM_DOMAIN_FLOW_STEPS, [
      "Domain",
      "DNS Instructions",
      "Verify",
      "SSL",
      "Connected",
    ]);

    const panel = readFileSync(
      join(repoRoot, "src/components/custom-domain-panel.tsx"),
      "utf8",
    );
    for (const step of CUSTOM_DOMAIN_FLOW_STEPS) {
      assert.match(panel, new RegExp(step.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("✅ PATCH /api/projects/[id]/domain saves domain + DNS instructions", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/projects/[id]/domain/route.ts"),
      "utf8",
    );
    assert.match(route, /setProjectCustomDomain/);
    assert.match(route, /CUSTOM_DOMAIN_CNAME/);
    assert.match(route, /waiting_dns/);
  });

  it("✅ POST verify runs DNS → Vercel → SSL stages", () => {
    const verify = readFileSync(
      join(repoRoot, "src/app/api/projects/[id]/domain/verify/route.ts"),
      "utf8",
    );
    assert.match(verify, /verifyCustomDomainCname/);
    assert.match(verify, /attachDomainToVercel/);
    assert.match(verify, /getSslStatusForApex/);
    assert.match(verify, /ssl_active/);
  });

  it("✅ DNS verify checks www CNAME to cname.vercel-dns.com", () => {
    const dns = readFileSync(
      join(repoRoot, "src/lib/dns-verify.ts"),
      "utf8",
    );
    assert.match(dns, /resolveCname/);
    assert.equal(CUSTOM_DOMAIN_CNAME.value, "cname.vercel-dns.com");
    assert.equal(CUSTOM_DOMAIN_CNAME.host, "www");
  });

  it("✅ Flow step mapping reaches Connected on ssl_active", () => {
    assert.equal(customDomainFlowStep("none"), 1);
    assert.equal(customDomainFlowStep("waiting_dns"), 2);
    assert.equal(customDomainFlowStep("dns_connected"), 3);
    assert.equal(customDomainFlowStep("ssl_pending"), 4);
    assert.equal(customDomainFlowStep("ssl_active"), 5);
  });

  it("✅ Domain page wires CustomDomainPanel for published sites", () => {
    const page = readFileSync(
      join(repoRoot, "src/app/dashboard/domain/page.tsx"),
      "utf8",
    );
    assert.match(page, /CustomDomainPanel/);
    assert.match(page, /canUseCustomDomain/);
  });
});
