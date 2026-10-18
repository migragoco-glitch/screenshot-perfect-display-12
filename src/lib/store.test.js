import { describe, expect, test } from "bun:test";
import { hasNavigatorAccess, navigatorCheckoutDestination, sanitizeAnswers } from "./store";

describe("Navigator assessment access", () => {
  test("the free tier cannot access the full 42-question assessment", () => {
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