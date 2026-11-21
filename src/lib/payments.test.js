import { afterEach, beforeEach, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { paymentOrigin, paymentPlan, premiumStatus } from "./payments";
import { createCheckoutSession, isEarlyDiscountAvailable, verifyAndParseWebhook } from "./payment-provider.server";

// Discover setting names from the isolated adapter; never read or print real values.
const source = readFileSync(new URL("./payment-provider.server.ts", import.meta.url), "utf8");
const names = [...new Set([...source.matchAll(/process\.env\['([^']+)'\]/g)].map((match) => match[1]))];
const originals = new Map();
const originalFetch = globalThis.fetch;
const originalError = console.error;
function setting(suffix) {
  const name = names.find((value) => value.endsWith(suffix));
  if (!name) throw new Error("Test setting name not found");
  return name;
}

beforeEach(() => {
  for (const name of names) {
    originals.set(name, process.env[name]);
    process.env[name] = crypto.randomUUID();
  }
  process.env[setting("_ENV")] = "sandbox";
  console.error = () => {};
});
afterEach(() => {
  for (const [name, value] of originals) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
  originals.clear();
  globalThis.fetch = originalFetch;
  console.error = originalError;
});

test("only the exact 30-day plan is accepted, not number-typed input", () => {
  expect(paymentPlan("30")).toBe("30");
  expect(() => paymentPlan(30)).toThrow();
});
test("only the exact 90-day plan is accepted, not arbitrary durations", () => {
  expect(paymentPlan("90")).toBe("90");
  expect(() => paymentPlan("365")).toThrow();
});
test("checkout origins are restricted to canonical and hosted HTTPS domains", () => {
  expect(paymentOrigin("https://app.migrago.fi/path")).toBe("https://app.migrago.fi");
  expect(paymentOrigin("https://sample.lovable.app")).toBe("https://sample.lovable.app");
  expect(paymentOrigin("https://lovable.app.evil.invalid")).toBe("https://app.migrago.fi");
  expect(paymentOrigin("http://app.migrago.fi")).toBe("https://app.migrago.fi");
  expect(paymentOrigin("https://user:password@app.migrago.fi")).toBe("https://app.migrago.fi");
});
test("30-day access ends exactly at the stored expiry, not afterwards", () => {
  const start = Date.UTC(2026, 10, 21);
  const expires = start + 30 * 86400000;
  const rows = [{ status: "active", plan: "30", expires_at: new Date(expires).toISOString() }];
  expect(premiumStatus(rows, expires - 1).active).toBe(true);
  expect(premiumStatus(rows, expires).active).toBe(false);
});
test("90-day access ends exactly at the stored expiry", () => {
  const start = Date.UTC(2026, 10, 21);
  const expires = start + 90 * 86400000;
  const rows = [{ status: "active", plan: "90", expires_at: new Date(expires).toISOString() }];
  expect(premiumStatus(rows, expires - 1).plan).toBe("90");
  expect(premiumStatus(rows, expires).active).toBe(false);
});
test("refunded passes never grant access", () => {
  expect(premiumStatus([{ status: "refunded", plan: "90", expires_at: "2027-12-01T00:00:00Z" }], Date.UTC(2026, 10, 21)).active).toBe(false);
});
test("status reports the latest active stacked expiry", () => {
  const rows = [
    { status: "active", plan: "30", expires_at: "2026-12-21T00:00:00Z" },
    { status: "active", plan: "90", expires_at: "2027-03-21T00:00:00Z" },
  ];
  expect(premiumStatus(rows, Date.UTC(2026, 10, 21))).toEqual({ active: true, plan: "90", expiresAt: "2027-03-21T00:00:00Z" });
});
test("absent optional discount means standard pricing and no discount field", async () => {
  delete process.env[setting("_DISCOUNT_EARLY_ID")];
  expect(isEarlyDiscountAvailable()).toBe(false);
  let body;
  const hostname = source.match(/"https:\/\/api\.([^"/]+)"/)?.[1];
  if (!hostname) throw new Error("Adapter hostname not found");
  globalThis.fetch = async (_input, init) => {
    body = JSON.parse(init.body);
    return Response.json({ url: `https://${hostname}/checkout/test` });
  };
  await createCheckoutSession({ plan: "30", userId: crypto.randomUUID(), email: "test@example.invalid", origin: "https://app.migrago.fi", earlyAccess: true });
  expect(body.discount_id).toBeUndefined();
  expect(body.products).toEqual([process.env[setting("_PRODUCT_30_ID")]]);
});
test("missing required checkout setting fails generically without a fetch", async () => {
  delete process.env[setting("_ACCESS_TOKEN")];
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response(null, { status: 500 }); };
  await expect(createCheckoutSession({ plan: "30", userId: crypto.randomUUID(), email: "test@example.invalid", origin: "https://app.migrago.fi", earlyAccess: false })).rejects.toThrow("Could not start the payment.");
  expect(calls).toBe(0);
});
test("discount rejection is not retried without the discount", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response(null, { status: 422 }); };
  await expect(createCheckoutSession({ plan: "90", userId: crypto.randomUUID(), email: "test@example.invalid", origin: "https://app.migrago.fi", earlyAccess: true })).rejects.toThrow("Could not start the payment.");
  expect(calls).toBe(1);
});

async function signedRequest(payload, age = 0, tamper = false) {
  const id = crypto.randomUUID();
  const timestamp = String(Math.floor(Date.now() / 1000) - age);
  const body = JSON.stringify(payload);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(process.env[setting("_WEBHOOK_SECRET")]), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return new Request("https://app.migrago.fi/api/public/payment-webhook", {
    method: "POST", body: tamper ? body + " " : body,
    headers: { "webhook-id": id, "webhook-timestamp": timestamp, "webhook-signature": `v1,invalid v1,${signature}` },
  });
}
function order(type = "order.paid") {
  return { type, data: { id: crypto.randomUUID(), customer: { external_id: crypto.randomUUID() }, product_id: process.env[setting("_PRODUCT_30_ID")], currency: "EUR", total_amount: 999 } };
}
test("a verified 30-day paid order maps the documented account and amount fields", async () => {
  const payload = order();
  const result = await verifyAndParseWebhook(await signedRequest(payload));
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.event.type).toBe("paid");
    expect(result.event.plan).toBe("30");
    expect(result.event.userId).toBe(payload.data.customer.external_id);
    expect(result.event.currency).toBe("EUR");
    expect(result.event.amount).toBe(999);
  }
});
test("a whsec_ secret accepts a signature made with its base64-decoded key without padding", async () => {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  process.env[setting("_WEBHOOK_SECRET")] = `whsec_${btoa(String.fromCharCode(...keyBytes)).replace(/=+$/, "")}`;
  const payload = order();
  const body = JSON.stringify(payload);
  const id = crypto.randomUUID();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(digest)));
  const result = await verifyAndParseWebhook(new Request("https://app.migrago.fi/api/public/payment-webhook", {
    method: "POST", body,
    headers: { "webhook-id": id, "webhook-timestamp": timestamp, "webhook-signature": `v1,invalid v1,${signature}` },
  }));
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.event.orderId).toBe(payload.data.id);
});
test("a verified 90-day paid order maps to 90-day access", async () => {
  const payload = order();
  payload.data.product_id = process.env[setting("_PRODUCT_90_ID")];
  const result = await verifyAndParseWebhook(await signedRequest(payload));
  expect(result.ok && result.event.plan).toBe("90");
});
test("a tampered raw body fails verification", async () => {
  expect(await verifyAndParseWebhook(await signedRequest(order(), 0, true))).toEqual({ ok: false });
});
test("timestamps older than five minutes are rejected", async () => {
  expect(await verifyAndParseWebhook(await signedRequest(order(), 301))).toEqual({ ok: false });
});
test("verified refunds are mapped without granting a new pass", async () => {
  const result = await verifyAndParseWebhook(await signedRequest(order("order.refunded")));
  expect(result.ok && result.event.type).toBe("refunded");
});
test("verified unknown events are ignored", async () => {
  const result = await verifyAndParseWebhook(await signedRequest(order("customer.updated")));
  expect(result.ok && result.event.type).toBe("ignored");
});
test("unrecognized account or product is left unmatched", async () => {
  const payload = order();
  payload.data.customer.external_id = "not-an-account";
  payload.data.product_id = crypto.randomUUID();
  const result = await verifyAndParseWebhook(await signedRequest(payload));
  expect(result.ok).toBe(true);
  if (result.ok) { expect(result.event.userId).toBeNull(); expect(result.event.plan).toBeNull(); }
});