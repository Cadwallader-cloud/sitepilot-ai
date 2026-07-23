import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import {
  parseAlphaBatchArgs,
  resolveRunOutputDir,
} from "./run-alpha.ts";

describe("alpha batch run paths", () => {
  it("defaults output to internal-alpha/output", () => {
    const args = parseAlphaBatchArgs([]);
    const outDir = resolveRunOutputDir(args.output);
    assert.match(outDir, /internal-alpha[\\/]output$/);
  });

  it("resolves --output relative to repo root", () => {
    const args = parseAlphaBatchArgs(["--output=runs/2026-07-23-001"]);
    const outDir = resolveRunOutputDir(args.output);
    assert.match(outDir, /runs[\\/]2026-07-23-001$/);
    assert.ok(path.isAbsolute(outDir));
  });

  it("parses limit, niche, concurrency, output", () => {
    const args = parseAlphaBatchArgs([
      "--limit=5",
      "--niche=roofing",
      "--concurrency=1",
      "--output=runs/test-run",
    ]);
    assert.equal(args.limit, 5);
    assert.equal(args.niche, "roofing");
    assert.equal(args.concurrency, 1);
    assert.equal(args.output, "runs/test-run");
  });
});
