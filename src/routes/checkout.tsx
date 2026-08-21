import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { trackEvent, useAppState } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MigraGo SettleSmart Navigator" },
      {
        name: "description",
        content:
          "Complete your SettleSmart Navigator subscription to unlock the full integration profile and 12-week roadmap.",
      },
      { property: "og:title", content: "Checkout — MigraGo SettleSmart Navigator" },
      {
        property: "og:description",
        content: "Unlock the full Smart Integration Profile and your 12-week Finland roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

const BASE_PRICE = 9.9;
const DISCOUNT = 0.5;

function CheckoutPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { update } = useAppState();
  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  useEffect(() => {
    setCode(window.localStorage.getItem("migrago.discountCode"));
    setEmail(window.localStorage.getItem("migrago.earlyAccessEmail"));
  }, []);

  const total = code ? BASE_PRICE * (1 - DISCOUNT) : BASE_PRICE;
  const price = (v: number) => `€${localizeNumber(Number(v.toFixed(2)), lang)}`;

  const pay = () => {
    setState("busy");
    trackEvent({ type: "checkout_started" });
    window.setTimeout(() => {
      trackEvent({ type: "checkout_completed" });
      update({ tier: "navigator" });
      window.localStorage.setItem("migrago.justUpgraded", "1");
      setState("done");
      window.setTimeout(() => void navigate({ to: "/dashboard" }), 700);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-14 md:px-8">
        <div className="glass-card rise-in rounded-3xl p-7 md:p-9">
          <Lock className="size-7 text-secondary" aria-hidden />
          <h1 className="mt-5 text-2xl">{t("checkout.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("checkout.sub")}</p>

          <dl className="mt-7 space-y-3 border-y border-border py-5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt>{t("checkout.plan")}</dt>
              <dd className="tabular-nums font-semibold">{price(BASE_PRICE)}</dd>
            </div>
            {code ? (
              <div className="flex items-center justify-between gap-4 text-secondary">
                <dt className="font-semibold">
                  {t("checkout.discountLabel")} · {code}
                </dt>
                <dd className="tabular-nums font-semibold">−{price(BASE_PRICE - total)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 pt-1 text-base font-bold">
              <dt>{t("checkout.total")}</dt>
              <dd className="tabular-nums">{price(total)}</dd>
            </div>
          </dl>

          {email ? <p className="mt-4 text-xs text-muted-foreground">{email}</p> : null}
          {code ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/12 px-3 py-1 text-xs font-semibold text-secondary">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t("checkout.codeApplied")}
            </p>
          ) : null}

          <button
            type="button"
            disabled={state !== "idle"}
            onClick={pay}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90 disabled:opacity-50"
          >
            <CreditCard className="size-4" aria-hidden />
            {state === "idle"
              ? t("checkout.pay")
              : state === "busy"
                ? t("checkout.processing")
                : t("checkout.done")}
          </button>

          <button
            type="button"
            onClick={() => void navigate({ to: "/dashboard" })}
            className="mt-3 w-full text-xs font-semibold text-muted-foreground underline underline-offset-4"
          >
            {t("checkout.cancel")}
          </button>

          <p className="mt-5 rounded-2xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
            {t("checkout.testMode")}
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
