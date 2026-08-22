import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Gavel,
  HeartHandshake,
  Info,
  Compass,
  Save,
  ScrollText,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { AppHeader } from "@/components/BrandHeader";
import { PenguinLoader } from "@/components/PenguinLoader";
import { QuestionField } from "@/components/QuestionField";
import { LiveProgressPanel } from "@/components/LiveProgressPanel";
import { localizeNumber, useI18n } from "@/lib/i18n";
import {
  COUNTRIES,
  QUESTIONS,
  SECTIONS,
  SECTION_DIMENSION,
  isAnswered,
  questionsForSection,
} from "@/lib/questions";
import { computeProfile } from "@/lib/scoring";
import { trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Integration readiness assessment — MigraGo" },
      {
        name: "description",
        content:
          "A 7-section, 42-question assessment covering legal status, career, finances, psychological readiness and your Finland strategy.",
      },
      { property: "og:title", content: "Integration readiness assessment — MigraGo" },
      {
        property: "og:description",
        content: "42 questions, autosaved, 9–12 minutes. Build your Smart Integration Profile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assessment,
});

const SECTION_ICONS = [Gavel, Briefcase, Wallet, HeartHandshake, ScrollText, Compass, Star] as const;

const DIMENSION_KEY = {
  legal: "dash.dim1",
  professional: "dash.dim2",
  psychological: "dash.dim3",
  bonus: "dash.bonus",
} as const;

function Assessment() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { state, hydrated, setAnswer, update, pushSnapshot } = useAppState();
  const [section, setSection] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRequired, setShowRequired] = useState(false);

  useEffect(() => {
    if (hydrated && !state.consent) void navigate({ to: "/consent" });
  }, [hydrated, state.consent, navigate]);

  const visible = useMemo(() => questionsForSection(section, state.answers), [section, state.answers]);
  const meta = SECTIONS.find((s) => s.id === section);
  const answeredCount = QUESTIONS.filter((q) => isAnswered(q, state.answers[q.id])).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);
  const sectionComplete = meta?.optional
    ? true
    : visible.every((q) => isAnswered(q, state.answers[q.id]));

  const encouragement =
    section <= 2 ? t("q.encourage1") : section <= 5 ? t("q.encourage2") : t("q.encourage3");
  const dimensionKey = DIMENSION_KEY[SECTION_DIMENSION[section] ?? "legal"];

  if (analyzing) {
    return <PenguinLoader title={t("loading.analyzing")} subtitle={t("loading.analyzingSub")} />;
  }

  const submit = () => {
    if (!sectionComplete) {
      setShowRequired(true);
      return;
    }
    setAnalyzing(true);
    const profile = computeProfile(state.answers);
    const nationality = state.answers[2]?.value;
    const pathwayIndex = state.answers[36]?.value;
    const pathway =
      typeof pathwayIndex === "number"
        ? QUESTIONS.find((q) => q.id === 36)?.options?.[pathwayIndex]?.en
        : undefined;
    trackEvent({
      type: "finish",
      ...(typeof nationality === "string" ? { nationality } : {}),
      ...(pathway ? { pathway } : {}),
    });
    trackEvent({ type: "paywall_view" });
    pushSnapshot({
      overall: profile.overall,
      legal: profile.legal,
      professional: profile.professional,
      psychological: profile.psychological,
    });
    update({ completed: true });
    window.setTimeout(() => {
      void navigate({ to: "/dashboard" });
    }, 2600);
  };

  const goNext = () => {
    if (!sectionComplete) {
      setShowRequired(true);
      return;
    }
    setShowRequired(false);
    setSection((s) => Math.min(7, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <AppHeader registered={answeredCount > 0} />

      <div className="sticky top-[68px] z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
            <span>
              {t("q.section")} {localizeNumber(section, lang)} {t("q.of")} {localizeNumber(7, lang)} —{" "}
              {meta?.title[lang]}
            </span>
            <span>
              {t("q.estimate")}: {localizeNumber(meta?.minutes ?? 2, lang)} {t("q.min")} —{" "}
              {t("q.progress")} {localizeNumber(progress, lang)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%`, backgroundColor: "var(--teal)" }}
            />
          </div>
          <ol className="mt-3 flex gap-1.5">
            {SECTIONS.map((s) => {
              const Icon = SECTION_ICONS[s.id - 1] ?? Star;
              const status = s.id < section ? "done" : s.id === section ? "current" : "todo";
              return (
                <li key={s.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setSection(s.id)}
                    aria-current={status === "current" ? "step" : undefined}
                    aria-label={`${t("q.section")} ${s.id}: ${s.title[lang]}`}
                    className="flex w-full flex-col items-center gap-1"
                  >
                    <Icon
                      className={cn(
                        "size-3.5 transition-colors duration-200 ease-out",
                        status === "done"
                          ? "text-secondary"
                          : status === "current"
                            ? "text-accent"
                            : "text-muted-foreground/50",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "h-1.5 w-full rounded-full transition-colors duration-200 ease-out",
                        status === "done"
                          ? "bg-secondary"
                          : status === "current"
                            ? "bg-accent"
                            : "bg-muted-foreground/25",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-[11px] font-medium text-muted-foreground">
            {localizeNumber(section - 1, lang)} {t("q.of")} {localizeNumber(7, lang)}{" "}
            {t("q.sectionsDone")} — {encouragement}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <main className="min-w-0">
        <h1 className="text-2xl md:text-3xl">{meta?.title[lang]}</h1>
        <p
          className="mt-3 inline-flex items-start gap-2 rounded-2xl border border-secondary/25 bg-secondary/8 px-3.5 py-2 text-xs text-muted-foreground"
          title={t("q.feedsInto")}
        >
          <Info className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden />
          <span>
            {SECTION_DIMENSION[section] === "bonus" ? (
              t("q.bonusNote2")
            ) : (
              <>
                {t("q.feedsInto")}{" "}
                <span className="font-semibold text-foreground">{t(dimensionKey)}</span>{" "}
                {t("q.scoreWord")}
              </>
            )}
          </span>
        </p>
        {meta?.optional ? (
          <div className="mt-4 rounded-2xl border border-accent/50 bg-accent/10 p-4">
            <p className="text-sm font-bold">{t("q.optionalSection")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("q.optionalNote")}</p>
          </div>
        ) : null}
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Save className="size-3.5" aria-hidden />
          {t("q.saveResume")}
        </p>

        <div className="mt-7 space-y-4">
          {visible.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              index={q.id}
              answer={state.answers[q.id]}
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={section === 1}
            onClick={() => setSection((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out hover:bg-muted disabled:opacity-40"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t("q.prev")}
          </button>

          {section < 7 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 ease-out hover:bg-primary/90 hover:shadow-[0_0_0_4px_rgba(42,144,143,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]"
            >
              {t("q.next")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90"
            >
              <Sparkles className="size-4" aria-hidden />
              {t("q.submit")}
            </button>
          )}
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5 text-secondary" aria-hidden />
          {t("q.saved")}{" "}
          {typeof state.answers[2]?.value === "string"
            ? COUNTRIES.find((c) => c.en === state.answers[2]?.value)?.[lang]
            : null}
        </p>
        </main>
        <div className="order-first lg:order-none">
          <LiveProgressPanel answers={state.answers} />
        </div>
      </div>
    </div>
  );
}
