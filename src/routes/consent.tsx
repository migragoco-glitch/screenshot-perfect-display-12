import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";
import { trackEvent, useAppState } from "@/lib/store";

export const Route = createFileRoute("/consent")({
  validateSearch: (search: Record<string, unknown>): { upgrade?: boolean } =>
    search['upgrade'] === true || search['upgrade'] === "true" ? { upgrade: true } : {},
  head: () => ({
    meta: [
      { title: "Data & consent — MigraGo assessment" },
      {
        name: "description",
        content:
          "What MigraGo collects, why, and the GDPR lawful basis for your integration-readiness assessment.",
      },
      { property: "og:title", content: "Data & consent — MigraGo assessment" },
      {
        property: "og:description",
        content: "Plain-language explanation of the data used to build your Finland integration roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsentScreen,
});

function ConsentScreen() {
  const { t } = useI18n();
  const { update } = useAppState();
  const navigate = useNavigate();
  const { upgrade } = Route.useSearch();
  const [checked, setChecked] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="glass-card rise-in rounded-3xl p-7 md:p-10">
          <ShieldCheck className="size-7 text-secondary" aria-hidden />
          <h1 className="mt-5 text-2xl md:text-3xl">{t("consent.title")}</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>{t("consent.p1")}</p>
            <p className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-foreground">
              {t("consent.p2")}
            </p>
            <p>{t("consent.p3")}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowPrivacy((v) => !v)}
            className="mt-5 text-sm font-semibold text-secondary underline underline-offset-4"
          >
            {t("consent.privacy")}
          </button>
          {showPrivacy ? (
            <p className="rise-in mt-3 rounded-2xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
              {t("consent.privacyBody")}
            </p>
          ) : null}

          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 size-4 accent-[var(--teal)]"
            />
            <span className="text-sm leading-relaxed">{t("consent.check")}</span>
          </label>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!checked}
              onClick={() => {
                if (upgrade) {
                  // Consent step of the upgrade flow → continue to checkout.
                  // The roadmap only unlocks after a completed checkout.
                  update({ consent: true });
                  void navigate({ to: "/checkout" });
                  return;
                }
                update({ consent: true });
                trackEvent({ type: "start" });
                void navigate({ to: "/assessment" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("consent.continue")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </button>
            <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              {t("consent.back")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
