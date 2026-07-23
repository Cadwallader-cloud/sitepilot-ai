import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fallbackServicePriority,
  parseServiceList,
  servicePriorityFromPlanner,
  shouldSkipServicePrioritizer,
} from "./service-prioritizer";

describe("Service Prioritizer skip", () => {
  it("shouldSkipServicePrioritizer is true for 1–3 explicit services", () => {
    assert.equal(shouldSkipServicePrioritizer(["Roof Repair"]), true);
    assert.equal(
      shouldSkipServicePrioritizer(["Roof Repair", "Gutter Cleaning"]),
      true,
    );
    assert.equal(
      shouldSkipServicePrioritizer([
        "Roof Repair",
        "Gutter Cleaning",
        "Inspection",
      ]),
      true,
    );
  });

  it("shouldSkipServicePrioritizer is true when planner serviceFocus is set", () => {
    assert.equal(
      shouldSkipServicePrioritizer(
        ["A", "B", "C", "D"],
        ["Roof Repair", "Gutter Cleaning", "Inspection", "Storm Damage"],
      ),
      true,
    );
    assert.equal(
      shouldSkipServicePrioritizer([], ["Roof Repair", "Gutter Cleaning"]),
      true,
    );
  });

  it("shouldSkipServicePrioritizer is false for 4+ services without planner focus", () => {
    assert.equal(
      shouldSkipServicePrioritizer([
        "A",
        "B",
        "C",
        "D",
      ]),
      false,
    );
    assert.equal(shouldSkipServicePrioritizer([]), false);
  });

  it("servicePriorityFromPlanner mirrors Planner serviceFocus order", () => {
    const plan = servicePriorityFromPlanner([
      "Roof Repair",
      "Storm Damage",
      "Inspection",
    ]);

    assert.equal(plan.featured, "Roof Repair");
    assert.deepEqual(plan.secondary, ["Storm Damage", "Inspection"]);
    assert.deepEqual(plan.optional, []);
    assert.deepEqual(plan.orderedTitles, [
      "Roof Repair",
      "Storm Damage",
      "Inspection",
    ]);
  });

  it("parseServiceList splits comma-separated input", () => {
    assert.deepEqual(parseServiceList("Repair, Gutter, Inspection"), [
      "Repair",
      "Gutter",
      "Inspection",
    ]);
  });

  it("fallbackServicePriority pads single-service businesses", () => {
    const plan = fallbackServicePriority(["Roof Repair"]);
    assert.equal(plan.featured, "Roof Repair");
    assert.ok(plan.secondary.length >= 1);
    assert.ok(plan.orderedTitles.includes("Roof Repair"));
  });
});
