import { createServerFn } from "@tanstack/react-start";

export type DemoAccount = {
  id: string;
  label: string;
  email: string;
  access_code: string;
  active: boolean;
  created_at: string;
};

const PRIMARY = "migrago2026";

/** Verify the founder gate. Returns the granted role, or null. */
export const verifyFounderAccess = createServerFn({ method: "POST" })
  .inputValidator((d: { email?: string; password: string }) => d)
  .handler(async ({ data }) => {
    if (data.password === PRIMARY) return { role: "primary" as const };
    const email = (data.email ?? "").trim().toLowerCase();
    if (!email) return { role: null };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("founder_demo_access")
      .select("id, active, access_code")
      .eq("email", email)
      .eq("access_code", data.password)
      .eq("active", true)
      .maybeSingle();
    return { role: row ? ("demo" as const) : null };
  });

export const listDemoAccounts = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (data.password !== PRIMARY) return [] as DemoAccount[];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("founder_demo_access")
      .select("*")
      .order("created_at", { ascending: false });
    return (rows ?? []) as DemoAccount[];
  });

export const createDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; label: string; email: string }) => d)
  .handler(async ({ data }) => {
    if (data.password !== PRIMARY) return null;
    const code = `demo-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("founder_demo_access")
      .insert({
        label: data.label,
        email: data.email.trim().toLowerCase(),
        access_code: code,
      })
      .select("*")
      .single();
    if (error) {
      console.error("[createDemoAccount]", error);
      return null;
    }
    return row as DemoAccount;
  });

export const setDemoAccountActive = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string; active: boolean }) => d)
  .handler(async ({ data }) => {
    if (data.password !== PRIMARY) return false;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("founder_demo_access")
      .update({ active: data.active })
      .eq("id", data.id);
    return !error;
  });

export const deleteDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    if (data.password !== PRIMARY) return false;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("founder_demo_access").delete().eq("id", data.id);
    return !error;
  });
