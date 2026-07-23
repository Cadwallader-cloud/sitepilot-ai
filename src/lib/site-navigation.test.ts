import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ADMIN_NAV_ENTRY,
  CREATE_CTA,
  FOOTER_ENTRIES,
  MAIN_NAV_ENTRIES,
} from "./site-navigation";

const appRoot = join(process.cwd(), "src", "app");

function routePageExists(href: string) {
  if (!href.startsWith("/") || href.includes("#")) return true;
  const segments = href.split("/").filter(Boolean);
  const pagePath = join(appRoot, ...segments, "page.tsx");
  return existsSync(pagePath);
}

describe("site navigation audit", () => {
  it("maps logo and CTA to home and create", () => {
    assert.equal(routePageExists("/"), true);
    assert.equal(CREATE_CTA.href, "/create");
    assert.equal(routePageExists(CREATE_CTA.href), true);
  });

  it("maps main nav routes to existing pages", () => {
    for (const entry of MAIN_NAV_ENTRIES) {
      if (entry.kind === "route") {
        assert.equal(routePageExists(entry.href), true, entry.href);
      }
    }
    assert.equal(routePageExists(ADMIN_NAV_ENTRY.href), true);
  });

  it("maps footer legal routes to existing pages", () => {
    for (const entry of FOOTER_ENTRIES) {
      if (entry.kind === "route") {
        assert.equal(routePageExists(entry.href), true, entry.href);
      }
      if (entry.kind === "external") {
        assert.equal(entry.href.startsWith("mailto:"), true);
      }
    }
  });

  it("anchors homepage sections used in navigation", () => {
    const anchorIds = [
      ...MAIN_NAV_ENTRIES.filter((entry) => entry.kind === "anchor").map(
        (entry) => entry.anchorId,
      ),
      ...FOOTER_ENTRIES.filter((entry) => entry.kind === "anchor").map(
        (entry) => entry.anchorId,
      ),
    ];

    const homepageSource = [
      "src/components/how-it-works.tsx",
      "src/components/pricing-flow.tsx",
    ]
      .map((file) => join(process.cwd(), file))
      .filter((file) => existsSync(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    for (const anchorId of anchorIds) {
      assert.match(homepageSource, new RegExp(`id="${anchorId}"`));
    }
  });
});
