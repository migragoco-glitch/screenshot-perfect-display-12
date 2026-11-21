import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { paymentOrigin, paymentPlan, premiumStatus } from "./payments";

const genericError = () => new Error("Could not start the payment.");

async function earlyEligibility(email: string | undefined, available: boolean, admin: SupabaseClient<Database>) {
  if (!available || !email) return false;
  const literalEmail = email.trim().toLowerCase().replace(/[\\%_]/g, "\\$&");
  const { data, error } = await admin.from("founders_circle_signups").select("id").ilike("email", literalEmail).limit(1);
  if (error) { console.error("Payment eligibility read failed"); throw genericError(); }
  return Boolean(data?.length);
}

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { plan: unknown; origin: unknown }) => ({ plan: paymentPlan(input.plan), origin: paymentOrigin(input.origin) }))
  .handler(async ({ data, context }) => {
    try {
      const { data: account, error } = await context.supabase.auth.getUser();
      if (error || !account.user?.email) throw genericError();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const provider = await import("./payment-provider.server");
      const earlyAccess = await earlyEligibility(account.user.email, provider.isEarlyDiscountAvailable(), supabaseAdmin);
      return await provider.createCheckoutSession({ ...data, userId: context.userId, email: account.user.email, earlyAccess });
    } catch { throw genericError(); }
  });

export const getPremiumStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("premium_passes")
      .select("status, plan, expires_at").eq("user_id", context.userId).eq("status", "active").gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false });
    if (error) { console.error("Premium status read failed"); throw genericError(); }
    return premiumStatus(data ?? []);
  });

export const getCheckoutEligibility = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { data: account, error } = await context.supabase.auth.getUser();
      if (error || !account.user) throw genericError();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const provider = await import("./payment-provider.server");
      return { earlyAccess: await earlyEligibility(account.user.email, provider.isEarlyDiscountAvailable(), supabaseAdmin) };
    } catch { throw genericError(); }
  });