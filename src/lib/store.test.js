import { describe, expect, test } from "bun:test";
import { assessmentQuestionNumbers, assessmentView, hasNavigatorAccess, navigatorCheckoutDestination, recordStartAnswer, startAnswerIds, restoredSubmittedRound, sanitizeAnswers } from "./store";
import { sharedQuestionAreas } from "./area-flow";

describe("Navigator assessment access", () => {
  test("sequential numbers remain 1..N with and without Q6 and skipped section 7", () => {
    for (const married of [false, true]) for (const skipped of [false, true]) {
      const numbers = assessmentQuestionNumbers({ 5: { value: married ? 1 : 0 } }, { founderTrack: true }, skipped);
      expect([...numbers.values()]).toEqual(Array.from({ length: numbers.size }, (_, i) => i + 1));
      expect(numbers.has(6)).toBe(married);
      expect(numbers.has(42)).toBe(!skipped);
      expect(numbers.size).toBe(38 - (married ? 0 : 1) - (skipped ? 4 : 0));
    }
  });
  test("start answer provenance is explicit, deduplicated and absent for old data", () => {
    expect(startAnswerIds(undefined)).toEqual([]);
    expect(recordStartAnswer(undefined, 7)).toEqual([7]);
    expect(recordStartAnswer([7], 7)).toEqual([7]);
    expect(recordStartAnswer([7], 8)).toEqual([7, 8]);
    expect(recordStartAnswer(undefined, 15)).toEqual([]);
  });
  test("return to roadmap questions restores owning cards even without a saved selection", () => {
    expect(sharedQuestionAreas([], [7, 8])).toEqual(["kela", "family"]);
    expect(sharedQuestionAreas(["bank"], [13])).toEqual(["bank", "work"]);
    expect(sharedQuestionAreas([], [])).toContain("status");
  });
  test("editing wins over recorded view and modes select at most one top bar", () => {
    for (const view of [undefined, "recorded"]) {
      expect(assessmentView({ completed: false }, view)).toEqual({ mode: "initial", readOnly: false, topBar: null });
      expect(assessmentView({ completed: true, assessmentStatus: "submitted" }, view)).toEqual({ mode: "submitted", readOnly: true, topBar: "submitted" });
      expect(assessmentView({ completed: true, assessmentStatus: "editing" }, view)).toEqual({ mode: "editing", readOnly: false, topBar: "editing" });
    }
  });
  test("the free tier cannot access the full assessment", () => {
    expect(hasNavigatorAccess("free")).toBe(false);
  });
  test("Navigator can access the full assessment", () => {
    expect(hasNavigatorAccess("navigator")).toBe(true);
  });
  test("checkout before assessment leads to assessment, not premature results", () => {
    expect(navigatorCheckoutDestination(false)).toBe("/assessment");
  });
  test("checkout with an existing completed assessment preserves results access", () => {
    expect(navigatorCheckoutDestination(true)).toBe("/dashboard");
  });
  test("all six shared Quick Check answers carry over unchanged", () => {
    const answers = { 36: { value: 1 }, 8: { value: [0] }, 7: { value: 0 }, 34: { value: 3 }, 15: { value: 1, detail: "0" }, 22: { value: 1 } };
    expect(sanitizeAnswers(answers)).toEqual(answers);
  });
});

describe("Cancel re-assessment", () => {
  const submittedAnswers = { 7: { value: 1, detail: "2" }, 39: { value: 1, detail: "3" } };
  const history = [{ at: "2026-11-14T14:59:00Z", overall: 60 }];
  const draft = {
    answers: { 7: { value: 0 } }, submittedAnswers, history,
    tier: "navigator", consent: true, completed: true, assessmentStatus: "editing",
    section7Skipped: false, submittedSection7Skipped: true,
    founderTrack: false, submittedFounderTrack: true,
  };
  test("cancel restores the last submitted answers and submitted status", () => {
    const restored = { ...draft, ...restoredSubmittedRound(draft) };
    expect(restored.answers).toEqual(submittedAnswers);
    expect(restored.assessmentStatus).toBe("submitted");
  });
  test("cancel restores the submitted section-7 skip flag", () => {
    expect(restoredSubmittedRound(draft).section7Skipped).toBe(true);
  });
  test("cancel restores founder applicability and preserves dated score history", () => {
    const restored = { ...draft, ...restoredSubmittedRound(draft) };
    expect(restored.founderTrack).toBe(true);
    expect(restored.history).toEqual(history);
    expect(sanitizeAnswers(restored.answers, true, { founderTrack: restored.founderTrack })[39]).toEqual(submittedAnswers[39]);
  });
  test("shared-answer edits do not replace the submitted copy", () => {
    const changed = { ...draft, answers: { 7: { value: 1, detail: "5" } } };
    expect(changed.submittedAnswers[7].detail).toBe("2");
    expect(restoredSubmittedRound(changed).answers[7].detail).toBe("2");
  });
});