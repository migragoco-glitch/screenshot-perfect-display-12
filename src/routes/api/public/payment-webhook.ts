import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payment-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyAndParseWebhook } = await import("@/lib/payment-provider.server");
        const verified = await verifyAndParseWebhook(request);
        if (!verified.ok) return new Response(null, { status: 401 });
        const { event } = verified;
        if (event.type === "ignored") return new Response(null, { status: 200 });
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          if (event.type === "refunded") {
            const { error } = await supabaseAdmin.from("premium_passes").update({ status: "refunded" }).eq("provider_order_id", event.orderId);
            if (error) throw new Error("Database write failed");
          } else if (!event.orderId || !event.userId || !event.plan) {
            const { error } = await supabaseAdmin.from("payment_unmatched_orders").upsert({
              provider_order_id: event.orderId || request.headers.get("webhook-id") || "",
              reason: !event.orderId ? "Missing order ID" : !event.userId ? "Missing or invalid account ID" : "Unknown product",
              payload: event.raw as import("@/integrations/supabase/types").Json,
            }, { onConflict: "provider_order_id", ignoreDuplicates: true });
            if (error) throw new Error("Database write failed");
          } else {
            const { error } = await supabaseAdmin.rpc("record_premium_payment", {
              p_user_id: event.userId, p_order_id: event.orderId, p_plan: event.plan,
              ...(event.currency !== null ? { p_currency: event.currency } : {}),
              ...(event.amount !== null ? { p_amount: event.amount } : {}),
            });
            if (error) throw new Error("Database write failed");
          }
          console.info("Payment webhook", event.type, event.orderId, "handled");
          return new Response(null, { status: 200 });
        } catch {
          console.error("Payment webhook", event.type, event.orderId, "database error");
          return new Response(null, { status: 500 });
        }
      },
    },
  },
});