import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { navigatorCheckoutDestination, trackEvent, useAppState } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { next?: "start" } => ({
    ...(search["next"] === "start" ? { next: "start" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Checkout — MigraGo" },
      {
        name: "description",
        content:
          "Activate Premium to unlock the full readiness profile and 12-week roadmap.",
      },
      { property: "og:title", content: "Checkout — MigraGo" },
      {
        property: "og:description",
        content: "Unlock the full Integration Profile and your 12-week Finland roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

type PlanDuration = "30" | "90";
const PLAN_PRICES: Record<PlanDuration, number> = { "30": 9.99, "90": 24.99 };
const DISCOUNT = 0.7;

function CheckoutPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { state: appState, hydrated, update } = useAppState();
  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [plan, setPlan] = useState<PlanDuration>("30");

  useEffect(() => {
    setCode(window.localStorage.getItem("migrago.discountCode"));
    setEmail(window.localStorage.getItem("migrago.earlyAccessEmail"));
  }, []);

  useEffect(() => {
    if (hydrated && !appState.consent) void navigate({ to: "/consent", search: { upgrade: true, ...(next ? { next } : {}) } });
  }, [hydrated, appState.consent, navigate, next]);

  const basePrice = PLAN_PRICES[plan];
  const total = code ? basePrice * (1 - DISCOUNT) : basePrice;
  const price = (v: number) =>
    lang === "fa"
      ? `${localizeNumber(v.toFixed(2), lang).replace(".", "٫")} یورو`
      : `€${localizeNumber(v.toFixed(2), lang)}`;

  const pay = () => {
    if (!hydrated || !appState.consent || state !== "idle") return;
    setState("busy");
    trackEvent({ type: "checkout_started" });
    window.setTimeout(() => {
      trackEvent({ type: "checkout_completed" });
      update({ tier: "navigator" });
      if (appState.completed) window.localStorage.setItem("migrago.justUpgraded", "1");
      setState("done");
      window.setTimeout(() => void navigate({ to: next === "start" ? "/start" : navigatorCheckoutDestination(appState.completed) }), 700);
    }, 1200);
  };

  if (!hydrated || !appState.consent) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-14 md:px-8">
        <div className="glass-card rise-in rounded-3xl p-7 md:p-9">
          <Lock className="size-7 text-secondary" aria-hidden />
          <h1 className="mt-5 text-2xl">{t("checkout.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t(next === "start" ? "checkout.start.sub" : "checkout.sub")}</p>
          <p className="mt-5 rounded-2xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
            {t("checkout.testMode")}
          </p>

          <p id="checkout-plan-label" className="mt-6 text-sm font-semibold">{t("checkout.planChoose")}</p>
          <div role="radiogroup" aria-labelledby="checkout-plan-label" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(["30", "90"] as const).map((duration) => (
              <Button
                key={duration}
                type="button"
                variant="outline"
                role="radio"
                aria-checked={plan === duration}
                disabled={state !== "idle"}
                onClick={() => setPlan(duration)}
                onKeyDown={(event) => {
                  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
                    event.preventDefault();
                    const other = duration === "30" ? "90" : "30";
                    setPlan(other);
                    document.getElementById(`checkout-plan-${other}`)?.focus();
                  }
                }}
                id={`checkout-plan-${duration}`}
                tabIndex={plan === duration ? 0 : -1}
                className={`relative h-auto min-h-32 flex-col items-start gap-2 whitespace-normal rounded-lg p-4 text-start text-foreground hover:text-foreground ${plan === duration ? "border-2 border-navy bg-navy/10 hover:bg-navy/10" : "border border-border bg-card hover:border-navy/40 hover:bg-card"}`}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span>{t(duration === "30" ? "checkout.plan30Label" : "checkout.plan90Label")}</span>
                  <CheckCircle2 className={`size-4 shrink-0 text-navy ${plan === duration ? "visible" : "invisible"}`} aria-hidden />
                </span>
                <span className="text-lg font-bold">{t(duration === "30" ? "checkout.plan30Price" : "checkout.plan90Price")}</span>
                <span className="text-xs font-normal">{t(duration === "30" ? "checkout.plan30Note" : "checkout.plan90Note")}</span>
              </Button>
            ))}
          </div>

          <dl className="mt-7 space-y-3 border-y border-border py-5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt>{t(plan === "30" ? "checkout.plan30" : "checkout.plan90")}</dt>
              <dd className="tabular-nums font-semibold">{price(basePrice)}</dd>
            </div>
            {code ? (
              <div className="flex items-center justify-between gap-4 text-secondary">
                <dt className="font-semibold">
                  {t("checkout.discountLabel")} · {code}
                </dt>
                <dd className="tabular-nums font-semibold">
                  {lang === "fa" ? (
                    <><bdi dir="ltr">−{localizeNumber((basePrice - total).toFixed(2), lang).replace(".", "٫")}</bdi>{" یورو"}</>
                  ) : (
                    <bdi dir="ltr">−€{localizeNumber((basePrice - total).toFixed(2), lang)}</bdi>
                  )}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 pt-1 text-base font-bold">
              <dt>{t("checkout.total")}</dt>
              <dd className="tabular-nums">{price(total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-foreground">{t("checkout.oneTime")}</p>

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
            onClick={() => void navigate({ to: next === "start" ? "/start" : appState.completed ? "/dashboard" : "/quick-check" })}
            className="mt-3 w-full text-xs font-semibold text-muted-foreground underline underline-offset-4"
          >
            {t("checkout.cancel")}
          </button>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
