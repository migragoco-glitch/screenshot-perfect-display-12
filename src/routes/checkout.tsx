import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { trackEvent, useAppState } from "@/lib/store";
import { useSession } from "@/lib/session";
import { createCheckout, getCheckoutEligibility } from "@/lib/payments.functions";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { next?: "start"; plan?: "30" | "90" } => ({
    ...(search["next"] === "start" ? { next: "start" as const } : {}),
    ...(search["plan"] === "30" || search["plan"] === "90" ? { plan: search["plan"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Checkout — MigraGo" },
      {
        name: "description",
        content:
          "Activate Premium to unlock the full readiness profile and week-by-week plan.",
      },
      { property: "og:title", content: "Checkout — MigraGo" },
      {
        property: "og:description",
        content: "Unlock the full readiness profile and your week-by-week plan for Finland.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

type PlanDuration = "30" | "90";
export const PLAN_PRICES: Record<PlanDuration, number> = { "30": 9.99, "90": 24.99 };
export const DISCOUNT = 0.7;
export const formatEuro = (v: number, lang: "en" | "fa") =>
  lang === "fa"
    ? `${localizeNumber(v.toFixed(2), lang).replace(".", "٫")} یورو`
    : `€${localizeNumber(v.toFixed(2), lang)}`;

function CheckoutPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { next, plan: returnedPlan } = Route.useSearch();
  const { state: appState, hydrated } = useAppState();
  const { user, loading } = useSession();
  const [code, setCode] = useState(false);
  const email = code ? user?.email : null;
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [plan, setPlan] = useState<PlanDuration>(returnedPlan ?? "30");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(false);
  const [eligibilityReady, setEligibilityReady] = useState(false);

  useEffect(() => {
    let active = true;
    setCode(false);
    setAccepted(false);
    setEligibilityReady(false);
    if (!user) return () => { active = false; };
    void getCheckoutEligibility().then((result) => {
      if (active) { setCode(result.earlyAccess); setEligibilityReady(true); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (hydrated && !appState.consent) void navigate({ to: "/consent", search: { upgrade: true, ...(next ? { next } : {}) } });
  }, [hydrated, appState.consent, navigate, next]);

  const basePrice = PLAN_PRICES[plan];
  const total = code ? basePrice * (1 - DISCOUNT) : basePrice;
  const price = (v: number) => formatEuro(v, lang);

  const pay = async () => {
    if (!hydrated || !appState.consent || !user || !accepted || !eligibilityReady || state !== "idle") return;
    setState("busy");
    setError(false);
    trackEvent({ type: "checkout_started" });
    try {
      const result = await createCheckout({ data: { plan, origin: window.location.origin } });
      window.location.href = result.url;
    } catch { setError(true); setState("idle"); }
  };

  if (!hydrated || !appState.consent) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page visual-checkout mx-auto w-full max-w-lg flex-1 px-4 py-14 md:px-8">
        <div className="glass-card rise-in rounded-3xl p-7 md:p-9">
          <Lock className="size-7 text-secondary" aria-hidden />
          <h1 className="mt-5 text-2xl">{t("checkout.title")}</h1>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {(["checkout.feat1", "checkout.feat2", "checkout.feat3", "checkout.feat4"] as const).map((key) => <li key={key} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden /><span>{t(key)}</span></li>)}
          </ul>
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
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-bold">{price(code ? PLAN_PRICES[duration] * (1 - DISCOUNT) : PLAN_PRICES[duration])}</span>
                  {code ? <s className="text-xs font-normal text-muted-foreground">{price(PLAN_PRICES[duration])}</s> : null}
                </span>
                <span className="text-xs font-normal">{t("checkout.plan30Note")}</span>
              </Button>
            ))}
          </div>

          <dl className="mt-7 space-y-3 border-y border-border py-5 text-sm">
            <div className="flex items-center justify-between gap-4 pt-1 text-base font-bold">
              <dt>{t("checkout.total")}</dt>
              <dd className="tabular-nums">{price(total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-foreground">{t("checkout.oneTime")}</p>

          {email ? <p className="mt-4 text-xs text-muted-foreground">{t("checkout.reservedEmail")} {email}</p> : null}
          {code ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/12 px-3 py-1 text-xs font-semibold text-secondary">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t("checkout.codeApplied")}
            </p>
          ) : null}

          {user ? <>
            <div className="mt-5 flex items-start gap-3">
              <Checkbox id="checkout-consent" checked={accepted} disabled={state === "busy"} onCheckedChange={(checked) => setAccepted(checked === true)} className="mt-1" />
              <label htmlFor="checkout-consent" className="text-xs leading-relaxed text-muted-foreground">{t("checkout.consent")}</label>
            </div>
            <Link to="/terms" className="mt-2 inline-flex text-xs font-semibold text-secondary underline underline-offset-4">{t("checkout.consentLink")}</Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("checkout.viaProvider")}</p>
          </> : !loading ? <>
            <p className="mt-5 text-sm text-muted-foreground">{t("checkout.loginRequired")}</p>
            <Button className="mt-3 w-full" onClick={() => {
              const path = `/checkout?plan=${plan}${next === "start" ? "&next=start" : ""}`;
              window.sessionStorage.setItem("migrago.checkout.return", JSON.stringify({ plan, path }));
              void navigate({ to: "/auth" });
            }}>{t("checkout.loginButton")}</Button>
          </> : null}

          {error ? <p role="alert" className="mt-3 text-xs font-semibold text-destructive">{t("checkout.error")}</p> : null}

          {user ? <Button
            type="button"
            disabled={state !== "idle" || !accepted || !eligibilityReady}
            onClick={() => void pay()}
            className="mt-6 h-auto w-full gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/85 disabled:opacity-50"
          >
            <CreditCard className="size-4" aria-hidden />
            {state === "idle"
              ? t("checkout.pay")
              : t("checkout.redirecting")}
          </Button> : null}

          <button
            type="button"
            onClick={() => void navigate({ to: next === "start" ? "/start" : appState.completed ? "/dashboard" : "/quick-check" })}
            className="checkout-cancel mt-3 w-full text-xs font-semibold text-muted-foreground underline underline-offset-4"
          >
            {t("checkout.cancel")}
          </button>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
