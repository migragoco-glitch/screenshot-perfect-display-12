import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Baby,
  Compass,
  FileText,
  Info,
  Languages,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { InstitutionBadge } from "@/components/FeedbackWidgets";
import { QuestionField } from "@/components/QuestionField";
import { useI18n, type TKey } from "@/lib/i18n";
import { isAnswered } from "@/lib/questions";
import { computePreliminary, QUICK_CHECK_QUESTIONS, type PreliminaryBand } from "@/lib/preliminary";
import { OFFICIAL_SOURCE, type Institution } from "@/lib/roadmap";
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
        content: "Six questions, under a minute: a preliminary profile and indicative first steps for your Finland integration pathway.",
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

/** Thematic icon per quick-check question, keyed by the existing question ID. */
const QUESTION_ICONS: Record<number, typeof Compass> = {
  36: Compass,
  8: Users,
  7: Baby,
  34: FileText,
  15: Languages,
  22: Wallet,
};

/** Per-question brand colors (same palette as the landing product card and dashboard levels). */
const QUESTION_COLORS = [
  "var(--navigator-light-teal)",
  "var(--navigator-teal)",
  "var(--plum)",
  "var(--navigator-olive)",
  "var(--navigator-olive-gold)",
  "var(--navigator-gold)",
];

function QuickCheckRing({ done, count, lang }: { done: boolean[]; count: number; lang: string }) {
  const size = 236;
  const stroke = 16;
  const r = 68;
  const iconR = 100;
  const c = 2 * Math.PI * r;
  const gap = 8;
  const n = done.length;
  const seg = (c - gap * n) / n;
  const fmt = (v: number) => (lang === "fa" ? v.toLocaleString("fa-IR") : String(v));
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size}>
        {done.map((d, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={QUESTION_COLORS[i]}
            strokeOpacity={d ? 1 : 0.16}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${seg} ${c - seg}`}
            strokeDashoffset={-(i * (seg + gap) + gap / 2)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-opacity 300ms ease-out" }}
          />
        ))}
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-foreground text-2xl font-bold" direction="ltr">
          {lang === "fa" ? `${fmt(n)}/${fmt(count)}` : `${count}/${n}`}
        </text>
      </svg>
      {QUICK_CHECK_QUESTIONS.map((q, i) => {
        const StepIcon = QUESTION_ICONS[q.id] ?? Compass;
        const angle = ((-90 + (i + 0.5) * (360 / n)) * Math.PI) / 180;
        const x = size / 2 + iconR * Math.cos(angle);
        const y = size / 2 + iconR * Math.sin(angle);
        return (
          <span
            key={q.id}
            className="absolute flex size-9 items-center justify-center rounded-full text-white shadow-sm transition-opacity duration-300"
            style={{ left: x - 18, top: y - 18, backgroundColor: QUESTION_COLORS[i], opacity: done[i] ? 1 : 0.4 }}
          >
            <StepIcon className="size-4" />
          </span>
        );
      })}
    </div>
  );
}

const RESOURCES: { institution: Institution; descKey: TKey }[] = [
  { institution: "Migri", descKey: "qc.resMigriDesc" },
  { institution: "Study in Finland", descKey: "qc.resStudyDesc" },
  { institution: "InfoFinland", descKey: "qc.resInfoDesc" },
  { institution: "Valvira / OPH", descKey: "qc.resEdufiDesc" },
];

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
    { labelKey: "qc.dimDocuments", band: result.documents, Icon: FileText },
    { labelKey: "qc.dimLanguage", band: result.language, Icon: Languages },
    { labelKey: "qc.dimFinances", band: result.finances, Icon: Wallet },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader registered={QUICK_CHECK_QUESTIONS.some((q) => isAnswered(q, state.answers[q.id]))} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
        {view === "questions" ? (
          <>
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                <Compass className="size-6 text-secondary" aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl">{t("qc.title")}</h1>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {answeredCount} / {QUICK_CHECK_QUESTIONS.length} {t("qc.answered")} ·{" "}
                  {QUICK_CHECK_QUESTIONS.length - answeredCount} {t("qc.remaining")}
                </p>
              </div>
            </div>
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
              <div className="mt-4 flex justify-center">
                <QuickCheckRing
                  done={QUICK_CHECK_QUESTIONS.map((q) => isAnswered(q, state.answers[q.id]))}
                  count={answeredCount}
                  lang={lang}
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {QUICK_CHECK_QUESTIONS.map((q, i) => {
                const StepIcon = QUESTION_ICONS[q.id] ?? Compass;
                return (
                  <div key={q.id}>
                    <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <StepIcon className="size-3.5" style={{ color: QUESTION_COLORS[i] }} aria-hidden />
                      {t("qc.question")} {i + 1} / {QUICK_CHECK_QUESTIONS.length}
                    </p>
                    <QuestionField
                      question={q}
                      index={i + 1}
                      answer={state.answers[q.id]}
                      levelColor={QUESTION_COLORS[i]!}
                      onChange={(v) => {
                        setAnswer(q.id, v);
                        setShowRequired(false);
                      }}
                    />
                  </div>
                );
              })}
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
            </div>
          </>
        ) : (
          <>
            {/* Hero — Migration Compass */}
            <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-center gap-4">
                <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                  <Compass className="size-7 text-secondary" aria-hidden />
                  <span
                    className="absolute -bottom-0.5 -end-0.5 flex size-5 items-center justify-center rounded-full bg-[var(--navigator-gold)] text-[10px] font-bold text-[var(--navigator-navy)]"
                    aria-hidden
                  >
                    6
                  </span>
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl">{t("qc.resultTitle")}</h1>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("qc.indicative")}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                    <Sparkles className="size-3.5" aria-hidden />
                    {t("qc.assessedLabel")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("qc.pathway")} · {t("qc.dimDocuments")} · {t("qc.dimLanguage")} · {t("qc.dimFinances")}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Info className="size-3.5" aria-hidden />
                    {t("qc.unknownTitle")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("qc.unknownLegal")} · {t("qc.unknownProfessional")} · {t("qc.unknownPsychological")}
                  </p>
                </div>
              </div>
            </section>

            {/* Readiness overview */}
            <section className="mt-5 rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("qc.prelimProfile")}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{t("qc.pathway")}:</span>{" "}
                {result.pathwayIndex === null
                  ? t("qc.band.unknown")
                  : (QUICK_CHECK_QUESTIONS[0]?.options?.[result.pathwayIndex]?.[lang] ?? "")}
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {bands.map(({ labelKey, band, Icon }) => (
                  <li
                    key={labelKey}
                    className={cn("rounded-2xl border p-4", BAND_STYLE[band])}
                  >
                    <Icon className="size-5" aria-hidden />
                    <p className="mt-2 text-sm font-semibold">{t(labelKey)}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider">{t(BAND_LABEL[band])}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Recommended next steps */}
            {result.actionKeys.length > 0 ? (
              <section className="mt-5 rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("qc.actionsTitle")}</h2>
                <ol className="mt-4 space-y-3">
                  {result.actionKeys.map((key, i) => (
                    <li key={key} className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                        {i + 1}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{t(key)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {/* Official resources */}
            <section className="mt-5 rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("qc.resourcesTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("qc.resourcesSub")}</p>
              <ul className="mt-4 space-y-3">
                {RESOURCES.map(({ institution, descKey }) => (
                  <li
                    key={institution}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <p className="max-w-md text-sm text-muted-foreground">{t(descKey)}</p>
                    <InstitutionBadge institution={institution} href={OFFICIAL_SOURCE[institution]} />
                  </li>
                ))}
              </ul>
            </section>

            <p className="mt-5 rounded-2xl border border-accent/50 bg-accent/10 p-4 text-xs leading-relaxed text-muted-foreground">
              {t("qc.disclaimer")}
            </p>

            <p className="mt-3 rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
              {t("qc.storageNote")}
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
