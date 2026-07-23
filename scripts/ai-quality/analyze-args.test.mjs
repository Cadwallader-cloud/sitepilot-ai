import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { parseAnalyzeArgs } from "./analyze.mjs";

describe("analyze input paths", () => {
  it("defaults to ai-quality/output when no flags", () => {
    const { outDir } = parseAnalyzeArgs([]);
    assert.match(outDir, /ai-quality[\\/]output$/);
  });

  it("resolves --input relative to repo root", () => {
    const { outDir } = parseAnalyzeArgs(["--input=runs/2026-07-23-001"]);
    assert.match(outDir, /runs[\\/]2026-07-23-001$/);
    assert.ok(path.isAbsolute(outDir));
  });

  it("accepts --dir as alias for --input", () => {
    const a = parseAnalyzeArgs(["--input=runs/a"]);
    const b = parseAnalyzeArgs(["--dir=runs/a"]);
    assert.equal(a.outDir, b.outDir);
  });
});
