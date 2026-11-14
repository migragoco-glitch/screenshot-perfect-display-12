import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { QUESTIONS, isAnswered } from "./questions";
import { questionScore } from "./scoring";

// Exercise the actual route-local rules without mounting the entire page.
const source = readFileSync(new URL("../routes/start.tsx", import.meta.url), "utf8");
const helper = source.match(/const isQuestionDone = \(id: number\): boolean => \{([\s\S]*?)\n  \};/);
const condition = source.match(/const hasUnansweredQuestions = ([^;]+);/);
const guard = source.match(/useEffect\(\(\) => \{\n    if \(!restored\) return;([\s\S]*?)\n  \}, \[restored, stage, hasUnansweredQuestions\]\);/);
if (!helper || !condition || !guard) throw new Error("Required question rules not found");
const done = new Function("id", "effectiveRoute", "QUESTIONS", "isAnswered", "state", helper[1]);
const incomplete = new Function("questionsDone", "questionsTotal", `return ${condition[1]};`);
const guardStage = new Function("restored", "stage", "hasUnansweredQuestions", "setStage", `if (!restored) return; ${guard[1]}`);

describe("Approved start question rules", () => {
  test("Q13 option 5 contributes the neutral 0.5 score and counts as answered", () => {
    const q = QUESTIONS.find((item) => item.id === 13);
    if (!q) throw new Error("Q13 missing");
    expect(q.options).toHaveLength(6);
    expect(questionScore(q, { 13: { value: 5 } })).toBe(0.5);
    expect(done(13, undefined, QUESTIONS, isAnswered, { answers: { 13: { value: 5 } } })).toBe(true);
  });
  test("Q2 completion requires an effective route, including a route without a country answer", () => {
    for (const route of ["eu", "nordic", "noneu"]) {
      expect(done(2, route, QUESTIONS, isAnswered, { answers: {} })).toBe(true);
    }
    expect(done(2, undefined, QUESTIONS, isAnswered, { answers: {} })).toBe(false);
  });
  test("all other shared questions reuse isAnswered", () => {
    for (const id of [7, 8, 13, 36, 37]) {
      expect(done(id, undefined, QUESTIONS, isAnswered, { answers: {} })).toBe(false);
      expect(done(id, undefined, QUESTIONS, isAnswered, { answers: { [id]: { value: id === 8 ? [4] : 0 } } })).toBe(true);
    }
  });
  test("Continue is blocked only while applicable questions remain", () => {
    expect(incomplete(0, 6)).toBe(true);
    expect(incomplete(5, 6)).toBe(true);
    expect(incomplete(6, 6)).toBe(false);
    expect(incomplete(0, 0)).toBe(false);
  });
  test("restored later stages return to questions only when incomplete", () => {
    for (const stage of ["choose", "info", "road"]) {
      let next = stage;
      guardStage(true, stage, true, (value) => { next = value; });
      expect(next).toBe("questions");
      next = stage;
      guardStage(true, stage, false, (value) => { next = value; });
      expect(next).toBe(stage);
      guardStage(false, stage, true, (value) => { next = value; });
      expect(next).toBe(stage);
    }
    let next = "questions";
    guardStage(true, next, true, (value) => { next = value; });
    expect(next).toBe("questions");
  });
});