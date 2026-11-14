import { describe, expect, test } from "bun:test";
import { QUESTIONS, applicableQuestions, assessmentProgress, detailInRange } from "./questions";
import { BUCKETS, weakestDimension, TOP_BAND_THRESHOLD } from "./scoring";

describe("BUILD 4 assessment rules", () => {
  test("Q1, Q3, Q10 and Q35 are removed; Q2, Q5, Q37 and Q42 remain", () => {
    const ids = QUESTIONS.map((q) => q.id);
    for (const removed of [1, 3, 10, 35]) expect(ids).not.toContain(removed);
    for (const kept of [2, 5, 37, 42]) expect(ids).toContain(kept);
    expect(BUCKETS.professional.ids).not.toContain(10);
  });
  test("the assessment has 38 questions, 39 when Q6 applies", () => {
    expect(QUESTIONS).toHaveLength(38);
    expect(applicableQuestions({ 5: { value: 1 } })).toHaveLength(39);
  });
  test("skipped section 7 is excluded from the shared totals", () => {
    const full = assessmentProgress({}, { founderTrack: true }, false);
    const skipped = assessmentProgress({}, { founderTrack: true }, true);
    expect(skipped.total).toBe(full.total - 4);
    expect(skipped.complete).toBe(false);
  });
  test("Q8 marks Alone and Not yet decided as exclusive", () => {
    const q8 = QUESTIONS.find((q) => q.id === 8);
    expect(q8.exclusiveIndexes).toEqual([0, 4]);
  });
  test("Q7 accepts 1–15 and Q39 accepts 1–50, integers only", () => {
    const q7 = QUESTIONS.find((q) => q.id === 7);
    const q39 = QUESTIONS.find((q) => q.id === 39);
    for (const ok of ["1", "15", " 3 "]) expect(detailInRange(q7, ok)).toBe(true);
    for (const bad of ["0", "16", "1.5", "abc", ""]) expect(detailInRange(q7, bad)).toBe(false);
    for (const ok of ["1", "50", "25"]) expect(detailInRange(q39, ok)).toBe(true);
    for (const bad of ["0", "51", "2.5", "abc"]) expect(detailInRange(q39, bad)).toBe(false);
  });
  test("weakest dimension resolves ties legal > professional > psychological", () => {
    expect(weakestDimension({ legal: 40, professional: 60, psychological: 80 })).toBe("legal");
    expect(weakestDimension({ legal: 60, professional: 40, psychological: 80 })).toBe("professional");
    expect(weakestDimension({ legal: 60, professional: 60, psychological: 40 })).toBe("psychological");
    expect(weakestDimension({ legal: 50, professional: 50, psychological: 50 })).toBe("legal");
    expect(weakestDimension({ legal: 70, professional: 50, psychological: 50 })).toBe("professional");
    expect(TOP_BAND_THRESHOLD).toBe(75);
  });
});
