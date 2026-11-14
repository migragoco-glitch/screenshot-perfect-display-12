import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { adaptRoadmapStep, formatScoreDelta, getProfileSteps, getRelatedStepsForGap, isPriorityStep, PROFILE_STEP_IDS, WEAKNESS_GAP_FLAGS } from "./profile-link";
import { KNOWLEDGE_TABLE } from "./roadmap";

describe("Approved completed-Premium profile links", () => {
  test("only active weakness flags mark steps as priorities", () => {
    expect(isPriorityStep("te-jobseeker", ["employment_pathway"])).toBe(false);
    expect(isPriorityStep("te-jobseeker", ["employment_gap"])).toBe(true);
    expect(isPriorityStep("doc-legalization", [])).toBe(false);
    expect(WEAKNESS_GAP_FLAGS).toHaveLength(11);
  });
  test("the seven profile steps retain their knowledge text and have no invented check date", () => {
    const steps = getProfileSteps(WEAKNESS_GAP_FLAGS);
    expect(steps.map((step) => step.id)).toEqual(PROFILE_STEP_IDS);
    for (const step of steps) {
      const entry = KNOWLEDGE_TABLE.find((item) => item.id === step.id);
      if (!entry) throw new Error("Missing approved knowledge step");
      expect(adaptRoadmapStep(entry)).toMatchObject({ title: entry.title, detail: entry.detail, completion: entry.completionCondition, sourceUrl: entry.officialSource, phase: entry.phase, basedOnAnswers: true, addedFirst: false });
      expect(step.overlay.lastChecked).toBeUndefined();
    }
    expect(getProfileSteps([])).toEqual([]);
    expect(getProfileSteps(["finance_thin"]).map((step) => step.id)).toEqual(["finance-evidence", "budget-plan"]);
  });
  test("gap links count only related steps in the active start plan", () => {
    expect(getRelatedStepsForGap("finance_thin", ["finance-evidence", "bank-account"])).toEqual(["finance-evidence"]);
    expect(getRelatedStepsForGap("finance_thin", [])).toEqual([]);
  });
  test("English delta uses plus, real minus and unsigned zero", () => {
    for (const [score, expected] of [[54, "+4"], [46, "−4"], [50, "0"]]) expect(formatScoreDelta([{ overall: 50 }, { overall: score }], "en")).toBe(expected);
  });
  test("Persian delta uses Persian digits with plus, real minus and unsigned zero", () => {
    for (const [score, expected] of [[54, "+۴"], [46, "−۴"], [50, "۰"]]) expect(formatScoreDelta([{ overall: 50 }, { overall: score }], "fa")).toBe(expected);
    expect(formatScoreDelta([{ overall: 50 }], "fa")).toBe("");
  });
  test("dedupe preserves changes in either professional or psychological score", () => {
    const source = readFileSync(new URL("./store.ts", import.meta.url), "utf8");
    const match = source.match(/if \((last && last.overall === snap.overall[^\n]+)\) return;/);
    if (!match) throw new Error("Snapshot dedupe rule missing");
    const same = new Function("last", "snap", `return Boolean(${match[1]});`);
    const last = { overall: 50, legal: 50, professional: 50, psychological: 50 };
    expect(same(last, { ...last })).toBe(true);
    expect(same(last, { ...last, professional: 51 })).toBe(false);
    expect(same(last, { ...last, psychological: 51 })).toBe(false);
  });
});