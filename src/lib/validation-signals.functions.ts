import { createServerFn } from "@tanstack/react-start";

export const getValidationSignals = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("validation_signals");
  if (error) {
    console.error("[validation_signals]", error);
    return null;
  }
  return data as unknown;
});
