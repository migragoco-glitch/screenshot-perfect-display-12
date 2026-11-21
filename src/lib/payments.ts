export type PaymentPlan = "30" | "90";

export function paymentPlan(value: unknown): PaymentPlan {
  if (value === "30" || value === "90") return value;
  throw new Error("Could not start the payment.");
}

export function paymentOrigin(value: unknown): string {
  if (typeof value === "string") {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" && !url.username && !url.password && !url.port &&
        (url.hostname === "app.migrago.fi" || url.hostname.endsWith(".lovable.app"))) return url.origin;
    } catch { /* Use the canonical origin for invalid input. */ }
  }
  return "https://app.migrago.fi";
}

export type PremiumStatus = { active: boolean; plan: string | null; expiresAt: string | null };

export function premiumStatus(rows: readonly { status: string; plan: string; expires_at: string }[], now = Date.now()): PremiumStatus {
  const latest = rows.filter((row) => row.status === "active" && Date.parse(row.expires_at) > now)
    .sort((a, b) => Date.parse(b.expires_at) - Date.parse(a.expires_at))[0];
  return latest ? { active: true, plan: latest.plan, expiresAt: latest.expires_at } : { active: false, plan: null, expiresAt: null };
}