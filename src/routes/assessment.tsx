import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { QuestionField } from "@/components/QuestionField";
import { LiveProgressPanel } from "@/components/LiveProgressPanel";
import { AssessmentGuideMoment } from "@/components/AssessmentGuideMoment";
import { localizeNumber, useI18n } from "@/lib/i18n";
import {
  COUNTRIES,
  QUESTIONS,
  SECTIONS,
  SECTION_DIMENSION,
  isAnswered,
  questionsForSection,
  type Answers,
} from "@/lib/questions";
import { BUCKETS, computeProfile } from "@/lib/scoring";
import { storedAnswersAreConsistent, trackEvent, useAppState } from "@/lib/store";
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

const LEVEL_DESCRIPTION_KEYS = [
  "q.levelDescription.1",
  "q.levelDescription.2",
  "q.levelDescription.3",
  "q.levelDescription.4",
  "q.levelDescription.5",
  "q.levelDescription.6",
  "q.levelDescription.7",
] as const;

const LEVEL_COLORS = [
  "var(--navigator-light-teal)",
  "var(--navigator-teal)",
  "var(--navigator-dark-teal)",
  "var(--navigator-olive)",
  "var(--navigator-navy)",
  "var(--navigator-olive-gold)",
  "var(--navigator-gold)",
] as const;

type GuidedView = "companion" | "intro" | "questions" | "complete";

const DIMENSION_PROGRESS_COLORS = [
  "var(--navigator-teal)",
  "var(--navigator-light-teal)",
  "var(--navigator-gold)",
] as const;

function dimensionCompletion(ids: readonly number[], answers: Answers) {
  const applicable = QUESTIONS.filter((question) => ids.includes(question.id) && (!question.showIf || question.showIf(answers)));
  if (!applicable.length) return 0;
  return applicable.filter((question) => isAnswered(question, answers[question.id])).length / applicable.length;
}

function CompactProgressRing({ pct, answers }: { pct: number; answers: Answers }) {
  const size = 54;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 3;
  const segmentLength = (circumference - gap * 3) / 3;
  const dimensionProgress = [
    dimensionCompletion(BUCKETS.legal.ids, answers),
    dimensionCompletion(BUCKETS.professional.ids, answers),
    dimensionCompletion(BUCKETS.psychological.ids, answers),
  ];
  return (
    <svg width={size} height={size} role="img" aria-label={`${pct}%`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      {dimensionProgress.map((completion, index) => {
        const paintedLength = segmentLength * completion;
        const segmentOffset = index * (segmentLength + gap);
        return (
          <circle
            key={DIMENSION_PROGRESS_COLORS[index]}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={DIMENSION_PROGRESS_COLORS[index]}
            strokeWidth={stroke}
            strokeLinecap={completion > 0 ? "round" : "butt"}
            strokeDasharray={`${paintedLength} ${circumference - paintedLength}`}
            strokeDashoffset={-segmentOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-[stroke-dasharray] duration-500 ease-out"
          />
        );
      })}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        {pct}%
      </text>
    </svg>
  );
}

function Assessment() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { state, hydrated, setAnswer, update, pushSnapshot, resetAnswers } = useAppState();
  const [section, setSection] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRequired, setShowRequired] = useState(false);
  const [corrupted, setCorrupted] = useState(false);
  const [inconsistencyDismissed, setInconsistencyDismissed] = useState(false);
  const [guidedView, setGuidedView] = useState<GuidedView>("companion");
  const [companionMoment, setCompanionMoment] = useState<"start" | "mid" | "near">("start");
  const seenLevels = useRef(new Set<number>());
  // Opt-in gate for the Founder & Talent questions (Q39–41). Derived straight from
  // the (already sanitized) stored state so it is final before Step 7 first renders.
  const founderTrack = state.founderTrack ?? null;

  useEffect(() => {
    if (hydrated && !state.consent) void navigate({ to: "/consent" });
  }, [hydrated, state.consent, navigate]);

  // Validate stored answers whenever Step 7 loads; safely reset instead of crashing.
  useEffect(() => {
    if (!hydrated || section !== 7) return;
    if (storedAnswersAreConsistent()) return;
    resetAnswers();
    setCorrupted(true);
    setSection(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hydrated, section, resetAnswers]);

  const visible = useMemo(
    () => questionsForSection(section, state.answers, { founderTrack }),
    [section, state.answers, founderTrack],
  );
  const meta = SECTIONS.find((s) => s.id === section);
  const answeredCount = QUESTIONS.filter((q) => isAnswered(q, state.answers[q.id])).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);
  const sectionComplete = meta?.optional
    ? true
    : visible.every((q) => isAnswered(q, state.answers[q.id]));

  // Gentle, non-blocking consistency flags shown on Step 7 only. Never alters
  // answers or scores — purely a review prompt for the user.
  const visaInconsistent = state.answers[30]?.value === 1 && state.answers[31]?.value === 1;
  const childrenInconsistent =
    state.answers[7]?.value === 0 &&
    Array.isArray(state.answers[8]?.value) &&
    (state.answers[8]?.value as number[]).includes(2);

  const dimensionKey = DIMENSION_KEY[SECTION_DIMENSION[section] ?? "legal"];

  const completedLevels = useMemo(
    () =>
      SECTIONS.map((level) => {
        const questions = questionsForSection(level.id, state.answers, { founderTrack });
        return questions.length > 0 && questions.every((q) => isAnswered(q, state.answers[q.id]));
      }),
    [state.answers, founderTrack],
  );

  useEffect(() => {
    if (guidedView !== "companion") return;
    const id = window.setTimeout(() => {
      setGuidedView("intro");
      seenLevels.current.add(section);
    }, 1800);
    return () => window.clearTimeout(id);
  }, [guidedView, section]);

  useEffect(() => {
    if (guidedView !== "complete") return;
    if (section === 7) return;
    const id = window.setTimeout(() => {
      const next = Math.min(7, section + 1);
      setSection(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (section === 4) {
        setCompanionMoment("mid");
        setGuidedView("companion");
      } else if (section === 6) {
        setCompanionMoment("near");
        setGuidedView("companion");
      } else {
        seenLevels.current.add(next);
        setGuidedView("intro");
      }
    }, 1400);
    return () => window.clearTimeout(id);
  }, [guidedView, section]);

  if (analyzing) {
    return (
      <div className="assessment-complete flex min-h-screen items-center justify-center px-4 text-center" role="status" aria-live="polite">
        <h2 className="max-w-2xl text-xl font-bold md:text-2xl">{t("loading.analyzing")}</h2>
      </div>
    );
  }

  const submit = () => {
    if (!sectionComplete) {
      setShowRequired(true);
      return;
    }
    setGuidedView("complete");
    window.setTimeout(() => {
      setAnalyzing(true);
      const profile = computeProfile(state.answers, founderTrack === true, state.region ?? "undecided");
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
    }, 1400);
  };

  const goNext = () => {
    if (!sectionComplete) {
      setShowRequired(true);
      return;
    }
    setShowRequired(false);
    setGuidedView("complete");
  };

  const moveToSection = (next: number) => {
    setSection(next);
    setShowRequired(false);
    setGuidedView(seenLevels.current.has(next) ? "questions" : "intro");
    seenLevels.current.add(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <AppHeader registered={answeredCount > 0} />

      <div className="lg:sticky top-[68px] z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3 md:px-8">
          <div className="hidden flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground md:flex">
            <span>
              {t("q.section")} {localizeNumber(section, lang)} {t("q.of")} {localizeNumber(7, lang)} —{" "}
              {meta?.title[lang]}
            </span>
            <span>
              {t("q.estimate")}: {localizeNumber(meta?.minutes ?? 2, lang)} {t("q.min")} —{" "}
              {t("q.progress")} {localizeNumber(progress, lang)}%
            </span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <CompactProgressRing pct={progress} answers={state.answers} />
            <p className="text-sm font-bold leading-snug">
              {t("q.level")} {localizeNumber(section, lang)} {t("q.of")} {localizeNumber(7, lang)} — {meta?.title[lang]}
            </p>
          </div>
          <ol className="mt-3 flex gap-1.5" aria-label={t("q.levelProgress")}>
            {SECTIONS.map((s) => {
              const Icon = SECTION_ICONS[s.id - 1] ?? Star;
              const status = s.id < section ? "done" : s.id === section ? "current" : "todo";
              const reached = completedLevels[s.id - 1] || status === "current";
              const levelColor = LEVEL_COLORS[s.id - 1] ?? "var(--navigator-teal)";
              return (
                <li key={s.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => moveToSection(s.id)}
                    aria-current={status === "current" ? "step" : undefined}
                    aria-label={`${t("q.section")} ${s.id}: ${s.title[lang]}`}
                    className="flex w-full flex-col items-center gap-1"
                  >
                    <Icon
                      className="size-3.5 transition-colors duration-200 ease-out"
                      style={{ color: reached ? levelColor : "color-mix(in oklab, var(--muted-foreground) 50%, transparent)" }}
                      aria-hidden
                    />
                    <span
                      className="h-1.5 w-full rounded-full transition-colors duration-200 ease-out"
                      style={{ backgroundColor: reached ? levelColor : "color-mix(in oklab, var(--muted-foreground) 25%, transparent)" }}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-[11px] font-medium text-muted-foreground">
            {localizeNumber(section - 1, lang)} {t("q.of")} {localizeNumber(7, lang)}{" "}
            {t("q.sectionsDone")}
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 md:px-8 lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <main className="min-w-0">
        {guidedView === "companion" ? (
          <AssessmentGuideMoment message={t(`q.companion.${companionMoment}`)} />
        ) : guidedView === "complete" ? (
          <div className="assessment-complete flex min-h-[52vh] items-center justify-center text-center" role="status" aria-live="polite">
            <p className="text-xl font-bold text-secondary md:text-2xl">
              ✓ {meta?.title[lang]} {t("q.levelComplete")}
            </p>
          </div>
        ) : guidedView === "intro" ? (
          <section className="assessment-intro flex min-h-[52vh] flex-col items-center justify-center text-center">
            {(() => {
              const Icon = SECTION_ICONS[section - 1] ?? Star;
               return <Icon className="size-10" style={{ color: LEVEL_COLORS[section - 1] }} strokeWidth={1.7} aria-hidden />;
            })()}
            <p className="mt-5 text-xs font-bold uppercase" style={{ color: LEVEL_COLORS[section - 1] }}>
              {t("q.level")} {localizeNumber(section, lang)} {t("q.of")} {localizeNumber(7, lang)}
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl">{meta?.title[lang]}</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {t(LEVEL_DESCRIPTION_KEYS[section - 1] ?? "q.levelDescription.1")}
            </p>
            <button
              type="button"
              onClick={() => setGuidedView("questions")}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-colors duration-200 hover:bg-secondary/90"
            >
              {t("q.beginLevel")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </button>
          </section>
        ) : (
        <>
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

        {section === 7 ? (
          <div className="mt-7 rounded-2xl border border-border bg-card p-4">
            <p className="text-[15px] font-semibold leading-relaxed">{t("q.founderTrack")}</p>
            <div className="mt-3 flex gap-2">
              {[
                { label: t("q.founderYes"), value: true },
                { label: t("q.founderNo"), value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  aria-pressed={founderTrack === opt.value}
                  onClick={() => {
                    // One write resolves the opt-in and the pruning of Q39–41 together.
                    update({ founderTrack: opt.value });
                  }}
                  className={cn(
                    "rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out",
                    founderTrack === opt.value
                      ? "border-secondary bg-secondary/12 ring-1 ring-secondary/40"
                      : "border-border bg-background hover:border-secondary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-7 space-y-4">
          {visible.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              index={q.id}
              answer={state.answers[q.id]}
              levelColor={LEVEL_COLORS[section - 1] ?? "var(--navigator-teal)"}
              onChange={(v) => {
                setAnswer(q.id, v);
                setShowRequired(false);
              }}
            />
          ))}
        </div>

        {section === 7 && (visaInconsistent || childrenInconsistent) && !inconsistencyDismissed ? (
          <div className="rise-in mt-5 rounded-2xl border border-accent/50 bg-accent/10 p-4">
            {visaInconsistent ? (
              <p className="text-sm font-semibold">{t("q.inconsistencyVisa")}</p>
            ) : null}
            {childrenInconsistent ? (
              <p className={cn("text-sm font-semibold", visaInconsistent ? "mt-2" : undefined)}>
                {t("q.inconsistencyChildren")}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setInconsistencyDismissed(true)}
              className="mt-3 text-xs font-semibold text-secondary underline underline-offset-4"
            >
              {t("q.inconsistencyOk")}
            </button>
          </div>
        ) : null}

        {corrupted ? (
          <p className="rise-in mt-5 rounded-xl bg-accent/15 p-3 text-sm font-semibold">
            {t("q.corrupted")}
          </p>
        ) : null}

        {showRequired ? (
          <p className="rise-in mt-5 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {t("q.required")}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={section === 1}
            onClick={() => moveToSection(Math.max(1, section - 1))}
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
        </>
        )}
        </main>
        <div className="sticky top-[20rem] z-30 order-first lg:static lg:order-none">
          <LiveProgressPanel answers={state.answers} />
        </div>
      </div>
    </div>
  );
}
