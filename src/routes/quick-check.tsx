import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, Info, Sparkles } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { QuestionField } from "@/components/QuestionField";
import { useI18n } from "@/lib/i18n";
import { isAnswered } from "@/lib/questions";
import { computePreliminary, QUICK_CHECK_QUESTIONS, type PreliminaryBand } from "@/lib/preliminary";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quick-check")({
  head: () => ({
    meta: [
      { title: "Quick check — MigraGo" },
      {
        name: "description",
        content:
          "A short 6-question quick check that gives you a preliminary profile and first action recommendations for your Finland move — before the full assessment.",
      },
      { property: "og:title", content: "Quick check — MigraGo" },
      {
        property: "og:description",
        content: "Six questions, two minutes: a preliminary profile and indicative first steps for your Finland integration pathway.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuickCheck,
});

const BAND_STYLE: Record<PreliminaryBand, string> = {
  ready: "border-secondary/50 bg-secondary/10 text-secondary",
  partial: "border-accent/60 bg-accent/10 text-foreground",
  unknown: "border-border bg-muted text-muted-foreground",
};

const BAND_LABEL = {
  ready: "qc.band.ready",
  partial: "qc.band.partial",
  unknown: "qc.band.unknown",
} as const;

function QuickCheck() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { state, hydrated, setAnswer } = useAppState();
  const [view, setView] = useState<"questions" | "result">("questions");
  const [showRequired, setShowRequired] = useState(false);

  useEffect(() => {
    if (hydrated && !state.consent) void navigate({ to: "/consent" });
  }, [hydrated, state.consent, navigate]);

  const allAnswered = QUICK_CHECK_QUESTIONS.every((q) => isAnswered(q, state.answers[q.id]));
  const answeredCount = QUICK_CHECK_QUESTIONS.filter((q) => isAnswered(q, state.answers[q.id])).length;
  const result = computePreliminary(state.answers);

  const bands = [
    { labelKey: "qc.dimDocuments", band: result.documents },
    { labelKey: "qc.dimLanguage", band: result.language },
    { labelKey: "qc.dimFinances", band: result.finances },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader registered={QUICK_CHECK_QUESTIONS.some((q) => isAnswered(q, state.answers[q.id]))} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
        {view === "questions" ? (
          <>
            <Compass className="size-7 text-secondary" aria-hidden />
            <h1 className="mt-4 text-2xl md:text-3xl">{t("qc.title")}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("qc.sub")}
            </p>

            <div className="mt-6" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={QUICK_CHECK_QUESTIONS.length} aria-label={t("qc.progressLabel")}>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{t("qc.progressLabel")}</span>
                <span>
                  {answeredCount} / {QUICK_CHECK_QUESTIONS.length}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-300 ease-out"
                  style={{ width: `${(answeredCount / QUICK_CHECK_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {QUICK_CHECK_QUESTIONS.map((q, i) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  index={i + 1}
                  answer={state.answers[q.id]}
                  levelColor="var(--navigator-teal)"
                  onChange={(v) => {
                    setAnswer(q.id, v);
                    setShowRequired(false);
                  }}
                />
              ))}
            </div>

            {showRequired ? (
              <p className="rise-in mt-5 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {t("q.required")}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!allAnswered) {
                    setShowRequired(true);
                    return;
                  }
                  setView("result");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90"
              >
                {t("qc.submit")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </button>
              <Link
                to="/assessment"
                className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("qc.skipToFull")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <Sparkles className="size-7 text-secondary" aria-hidden />
            <h1 className="mt-4 text-2xl md:text-3xl">{t("qc.resultTitle")}</h1>
            <p className="mt-2 inline-flex items-start gap-2 rounded-2xl border border-secondary/25 bg-secondary/8 px-3.5 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden />
              {t("qc.indicative")}
            </p>

            <section className="mt-7 rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("qc.prelimProfile")}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{t("qc.pathway")}:</span>{" "}
                {result.pathwayIndex === null
                  ? t("qc.band.unknown")
                  : (QUICK_CHECK_QUESTIONS[0]?.options?.[result.pathwayIndex]?.[lang] ?? "")}
              </p>
              <ul className="mt-4 space-y-2">
                {bands.map(({ labelKey, band }) => (
                  <li
                    key={labelKey}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-2.5 text-sm font-semibold",
                      BAND_STYLE[band],
                    )}
                  >
                    <span>{t(labelKey)}</span>
                    <span>{t(BAND_LABEL[band])}</span>
                  </li>
                ))}
              </ul>
            </section>

            {result.actionKeys.length > 0 ? (
              <section className="mt-5 rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("qc.actionsTitle")}</h2>
                <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed text-muted-foreground">
                  {result.actionKeys.map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-5 rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("qc.unknownTitle")}</h2>
              <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed text-muted-foreground">
                <li>{t("qc.unknownLegal")}</li>
                <li>{t("qc.unknownProfessional")}</li>
                <li>{t("qc.unknownPsychological")}</li>
              </ul>
            </section>

            <p className="mt-5 rounded-2xl border border-accent/50 bg-accent/10 p-4 text-xs leading-relaxed text-muted-foreground">
              {t("qc.disclaimer")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90"
              >
                {t("qc.continueFull")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
              <Link
                to="/"
                className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("qc.backHome")}
              </Link>
            </div>

            <section className="mt-6 rounded-3xl border-2 border-secondary/40 bg-card p-6">
              <h2 className="text-lg">{t("qc.upgradeTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("qc.upgradeDesc")}</p>
              <p className="mt-3 text-sm font-semibold text-foreground">
                €9.99<span className="text-xs font-medium text-muted-foreground">{t("pricing.perMonth")}</span>
              </p>
              <Link
                to="/checkout"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90"
              >
                {t("qc.upgradeCta")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </section>

            <p className="mt-6 text-xs text-muted-foreground">
              {t("qc.signInNote")}{" "}
              <Link to="/auth" className="font-semibold text-secondary underline underline-offset-4">
                {t("qc.signIn")}
              </Link>
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

