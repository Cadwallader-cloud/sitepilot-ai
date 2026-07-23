#!/usr/bin/env node
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { printLighthouseSummary, summarizeLighthouseReport } from "./lighthouse-summarize.mjs";

const PAGES = [
  { id: "home", path: "/" },
  { id: "demos", path: "/demos" },
  { id: "create", path: "/create" },
];

function parseArgs(argv) {
  let baseUrl = process.env.AUDIT_BASE_URL ?? "https://crestis.app";
  for (const arg of argv) {
    if (arg.startsWith("--base=")) {
      baseUrl = arg.slice("--base=".length).replace(/\/$/, "");
    }
  }
  return { baseUrl };
}

function runLighthouse(url, outputPath) {
  const tmpDir = path.resolve(".lighthouse-tmp");
  mkdirSync(tmpDir, { recursive: true });

  const args = [
    "lighthouse",
    url,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--output=json",
    `--output-path=${outputPath}`,
    '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
    "--quiet",
  ];

  const result = spawnSync("npx", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      TEMP: tmpDir,
      TMP: tmpDir,
    },
    shell: process.platform === "win32",
  });

  return result.status ?? 1;
}

function main() {
  const { baseUrl } = parseArgs(process.argv.slice(2));
  const reportDir = path.resolve("runs/lighthouse");
  mkdirSync(reportDir, { recursive: true });

  let hadFailure = false;
  const summaries = [];

  for (const page of PAGES) {
    const url = `${baseUrl}${page.path === "/" ? "" : page.path}`;
    const outputPath = path.join(reportDir, `${page.id}.json`);
    const exitCode = runLighthouse(url, outputPath);
    if (exitCode !== 0) {
      hadFailure = true;
    }

    try {
      const report = JSON.parse(readFileSync(outputPath, "utf8"));
      summaries.push({ id: page.id, ...summarizeLighthouseReport(report) });
    } catch {
      summaries.push({
        id: page.id,
        url,
        scores: {},
        issues: [],
        criticalIssues: [{ id: "missing-report", title: `Missing ${outputPath}` }],
      });
      hadFailure = true;
    }
  }

  printLighthouseSummary(summaries);
  process.exit(hadFailure ? 1 : 0);
}

if (
  path.resolve(process.argv[1] ?? "") ===
  path.resolve(fileURLToPath(import.meta.url))
) {
  main();
}
