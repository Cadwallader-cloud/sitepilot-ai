#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];

const PAGES = [
  { id: "home", url: "https://crestis.app/" },
  { id: "demos", url: "https://crestis.app/demos" },
  { id: "create", url: "https://crestis.app/create" },
];

const WATCH_AUDITS = new Set([
  "color-contrast",
  "label-content-name-mismatch",
  "link-in-text-block",
  "document-title",
  "meta-description",
  "html-has-lang",
  "is-crawlable",
  "robots-txt",
  "hreflang",
  "crawlable-anchors",
]);

export function summarizeLighthouseReport(report) {
  const scores = Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Math.round((report.categories[category]?.score ?? 0) * 100),
    ]),
  );

  const issues = Object.values(report.audits ?? {})
    .filter(
      (audit) =>
        audit.score !== null &&
        audit.score < 1 &&
        (audit.scoreDisplayMode === "binary" ||
          audit.scoreDisplayMode === "numeric"),
    )
    .map((audit) => ({
      id: audit.id,
      title: audit.title,
      score: audit.score,
      displayValue: audit.displayValue ?? "",
      snippets: (audit.details?.items ?? [])
        .slice(0, 3)
        .map((item) => item.node?.snippet ?? item.node?.label ?? "")
        .filter(Boolean),
    }))
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1));

  return {
    url: report.requestedUrl,
    scores,
    issues,
    criticalIssues: issues.filter(
      (issue) =>
        WATCH_AUDITS.has(issue.id) ||
        issue.score === 0 ||
        (typeof issue.score === "number" && issue.score < 0.5),
    ),
  };
}

export function printLighthouseSummary(summaries) {
  console.log("Lighthouse summary\n");

  for (const summary of summaries) {
    console.log(`=== ${summary.id} (${summary.url}) ===`);
    for (const category of CATEGORIES) {
      console.log(`${category}: ${summary.scores[category]}`);
    }

    if (summary.criticalIssues.length === 0) {
      console.log("Critical issues: none");
    } else {
      console.log(`Issues to review (${summary.criticalIssues.length}):`);
      for (const issue of summary.criticalIssues) {
        console.log(`- ${issue.id}: ${issue.title}`);
        for (const snippet of issue.snippets) {
          console.log(`    ${snippet}`);
        }
      }
    }
    console.log("");
  }
}

function main() {
  const reportDir = path.resolve("runs/lighthouse");
  if (!existsSync(reportDir)) {
    console.error(`Missing ${reportDir}. Run npm run audit:lighthouse first.`);
    process.exit(1);
  }

  const summaries = PAGES.map((page) => {
    const file = path.join(reportDir, `${page.id}.json`);
    if (!existsSync(file)) {
      return {
        id: page.id,
        url: page.url,
        scores: Object.fromEntries(CATEGORIES.map((category) => [category, 0])),
        issues: [],
        criticalIssues: [{ id: "missing-report", title: `Missing ${file}` }],
      };
    }

    const report = JSON.parse(readFileSync(file, "utf8"));
    return { id: page.id, ...summarizeLighthouseReport(report) };
  });

  printLighthouseSummary(summaries);

  const failed = summaries.some((summary) =>
    summary.criticalIssues.some((issue) => issue.id === "missing-report"),
  );
  process.exit(failed ? 1 : 0);
}

if (
  path.resolve(process.argv[1] ?? "") ===
  path.resolve(fileURLToPath(import.meta.url))
) {
  main();
}
