import type { PaymentPlan } from "./payments";

type PaymentEvent = {
  type: "paid" | "refunded" | "ignored";
  orderId: string;
  userId: string | null;
  plan: PaymentPlan | null;
  currency: string | null;
  amount: number | null;
  raw: unknown;
};

function unavailable(): never { throw new Error("Could not start the payment."); }

function required(name: string, value: string | undefined): string {
  if (!value) { console.error("Missing payment setting:", name); return unavailable(); }
  return value;
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function equal(a: string, b: string): boolean {
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return difference === 0;
}

export async function createCheckoutSession({ plan, userId, email, origin, earlyAccess }: {
  plan: PaymentPlan; userId: string; email: string; origin: string; earlyAccess: boolean;
}): Promise<{ url: string }> {
  const environment = required("POLAR_ENV", process.env['POLAR_ENV']);
  const token = required("POLAR_ACCESS_TOKEN", process.env['POLAR_ACCESS_TOKEN']);
  const product = plan === "30" ? required("POLAR_PRODUCT_30_ID", process.env['POLAR_PRODUCT_30_ID']) : required("POLAR_PRODUCT_90_ID", process.env['POLAR_PRODUCT_90_ID']);
  const discount = process.env['POLAR_DISCOUNT_EARLY_ID'];
  if (environment !== "sandbox" && environment !== "production") return unavailable();
  const base = environment === "sandbox" ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";
  let response: Response;
  try {
    response = await fetch(`${base}/v1/checkouts/`, {
      method: "POST", redirect: "manual",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        products: [product], external_customer_id: userId, customer_email: email,
        success_url: `${origin}/payment-success?checkout_id={CHECKOUT_ID}`,
        ...(earlyAccess && discount ? { discount_id: discount } : {}),
      }),
    });
  } catch { console.error("Payment checkout request failed"); return unavailable(); }
  if (!response.ok) { console.error("Payment checkout rejected", response.status); return unavailable(); }
  const body = object(await response.json().catch(() => null));
  if (typeof body['url'] !== "string") { console.error("Payment checkout missing URL", response.status); return unavailable(); }
  try {
    const url = new URL(body['url']);
    if (url.protocol !== "https:" || url.username || url.password ||
      !(url.hostname === "polar.sh" || url.hostname.endsWith(".polar.sh"))) return unavailable();
  } catch { return unavailable(); }
  return { url: body['url'] };
}

export function isEarlyDiscountAvailable(): boolean {
  return Boolean(process.env['POLAR_DISCOUNT_EARLY_ID']);
}

export async function verifyAndParseWebhook(request: Request): Promise<{ ok: false } | { ok: true; event: PaymentEvent }> {
  const rawBody = await request.text();
  const secret = process.env['POLAR_WEBHOOK_SECRET'];
  if (!secret) { console.error("Missing payment setting:", "POLAR_WEBHOOK_SECRET"); return { ok: false }; }
  const id = request.headers.get("webhook-id");
  const timestamp = request.headers.get("webhook-timestamp");
  const signatures = request.headers.get("webhook-signature");
  if (!id || !timestamp || !/^\d+$/.test(timestamp) || !signatures || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return { ok: false };
  try {
    // The provider SDK base64-encodes the UTF-8 secret before Standard Webhooks decodes it.
    const encodedSecret = btoa(String.fromCharCode(...new TextEncoder().encode(secret)));
    const keyBytes = Uint8Array.from(atob(encodedSecret), (character) => character.charCodeAt(0));
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`));
    const expected = btoa(String.fromCharCode(...new Uint8Array(digest)));
    let verified = false;
    for (const entry of signatures.split(/\s+/)) {
      if (entry.startsWith("v1,")) verified = equal(expected, entry.slice(3)) || verified;
    }
    if (!verified) return { ok: false };
    const raw: unknown = JSON.parse(rawBody);
    const payload = object(raw);
    const data = object(payload['data']);
    const type = payload['type'] === "order.paid" ? "paid" : payload['type'] === "order.refunded" ? "refunded" : "ignored";
    const customer = object(data['customer']);
    const product = object(data['product']);
    const productId = data['product_id'] ?? product['id'];
    const product30 = process.env['POLAR_PRODUCT_30_ID'];
    const product90 = process.env['POLAR_PRODUCT_90_ID'];
    if (type === "paid" && (!product30 || !product90)) {
      if (!product30) console.error("Missing payment setting:", "POLAR_PRODUCT_30_ID");
      if (!product90) console.error("Missing payment setting:", "POLAR_PRODUCT_90_ID");
      return { ok: false };
    }
    const plan = product30 && productId === product30 ? "30" : product90 && productId === product90 ? "90" : null;
    const userId = typeof customer['external_id'] === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customer['external_id']) ? customer['external_id'] : null;
    const amount = data['total_amount'] ?? data['amount'];
    return { ok: true, event: {
      type, orderId: typeof data['id'] === "string" ? data['id'] : "", userId, plan,
      currency: typeof data['currency'] === "string" ? data['currency'] : null,
      amount: typeof amount === "number" && Number.isSafeInteger(amount) && amount >= -2147483648 && amount <= 2147483647 ? amount : null,
      raw,
    } };
  } catch { return { ok: false }; }
}