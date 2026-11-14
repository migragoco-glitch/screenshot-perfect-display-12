import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

// Exercise the exact numeric declarations and total expression used by checkout,
// without importing the route's server/framework dependencies.
const source = readFileSync(new URL("../routes/checkout.tsx", import.meta.url), "utf8");
const prices = source.match(/const PLAN_PRICES[^=]*=\s*([^;]+);/)?.[1];
const discount = source.match(/const DISCOUNT\s*=\s*([^;]+);/)?.[1];
const formula = source.match(/const total\s*=\s*([^;]+);/)?.[1];
if (!prices || !discount || !formula) throw new Error("Checkout pricing declarations not found");
const calculate = new Function("plan", "code", `const PLAN_PRICES = ${prices}; const DISCOUNT = ${discount}; const basePrice = PLAN_PRICES[plan]; return (${formula}).toFixed(2);`);

test("30-day access costs €9.99 without a code", () => {
  expect(calculate("30", null)).toBe("9.99");
});
test("90-day access costs €24.99 without a code", () => {
  expect(calculate("90", null)).toBe("24.99");
});
test("EARLY100 gives 70% off 30-day access, totaling €3.00", () => {
  expect(calculate("30", "EARLY100")).toBe("3.00");
});
test("EARLY100 gives 70% off 90-day access, totaling €7.50", () => {
  expect(calculate("90", "EARLY100")).toBe("7.50");
});