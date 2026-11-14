import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowRightLeft,
  Briefcase,
  Check,
  ClipboardList,
  Compass,
  FileText,
  Flag,
  HelpCircle,
  House,
  Info,
  Lock,
  LogIn,
  Mail,
  Map as MapIcon,
  MapPin,
  Pencil,
  Puzzle,
  Route as RouteIcon,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  ListChecks,
  UserCircle,
  Users,
} from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { PenguinLoader } from "@/components/PenguinLoader";
import {
  CsatWidget,
  FoundersCircleModal,
  InstitutionBadge,
  NpsSurvey,
} from "@/components/FeedbackWidgets";
import { ProfilePreview, RoadmapSummary } from "@/components/RoadmapSummary";
import { SupportChannels } from "@/components/SupportChannels";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { TOP_BAND_THRESHOLD, analysisSummary, computeProfile, weakestDimension, type GapFlag } from "@/lib/scoring";
import { KNOWLEDGE_TABLE, PHASE_TITLE_KEYS, type Phase } from "@/lib/roadmap";
import { buildGapAnalysis } from "@/lib/pathways";
import { FOUNDER_TRACK_IDS, QUESTIONS, assessmentProgress, isAnswered } from "@/lib/questions";
import { useSession } from "@/lib/session";
import { hasNavigatorAccess, trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AREAS, buildAreaSteps, documentsForSteps, suggestRoute, type AreaId } from "@/lib/area-flow";
import { formatScoreDelta, getProfileSteps, getRelatedStepsForGap, getStepWeek } from "@/lib/profile-link";


export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: "profile" } => search["tab"] === "profile" ? { tab: "profile" } : {},
  head: () => ({
    meta: [
      { title: "Integration Profile — MigraGo dashboard" },
      {
        name: "description",
        content:
          "Your Legal / Status Readiness, Economic & Professional Capacity and Soft Skills & Psychological Readiness scores plus your evidence-based 12-week Finland roadmap.",
      },
      { property: "og:title", content: "Integration Profile — MigraGo dashboard" },
      {
        property: "og:description",
        content:
          "Live-recalculated readiness scores and a 12-week roadmap traced to Finnish institutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const DIM_COLORS = [
  "var(--navigator-teal)",
  "var(--navigator-light-teal)",
  "var(--navigator-gold)",
];

const ROADMAP_PHASES = [
  {
    label: "hero.roadmapWeeks1",
    height: "h-1/4",
    color: "bg-[var(--navigator-light-teal)] text-[var(--navigator-light-teal)]",
    value: "var(--navigator-light-teal)",
    icon: Scale,
  },
  {
    label: "hero.roadmapWeeks2",
    height: "h-[45%]",
    color: "bg-[var(--navigator-teal)] text-[var(--navigator-teal)]",
    value: "var(--navigator-teal)",
    icon: House,
  },
  {
    label: "hero.roadmapWeeks3",
    height: "h-[65%]",
    color: "bg-[var(--navigator-olive)] text-[var(--navigator-olive)]",
    value: "var(--navigator-olive)",
    icon: Briefcase,
  },
  {
    label: "hero.roadmapWeeks4",
    height: "h-full",
    color: "bg-[var(--navigator-gold)] text-[var(--navigator-gold)]",
    value: "var(--navigator-gold)",
    icon: Users,
  },
] as const;

type Tab = "dashboard" | "assessment" | "profile" | "progress" | "account";

function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { state, hydrated, update, ensureBaselineSnapshot, reset } = useAppState();
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(search.tab === "profile" ? "profile" : "dashboard");
  const [buildingRoadmap, setBuildingRoadmap] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [expandedGaps, setExpandedGaps] = useState<string[]>([]);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [startAreas, setStartAreas] = useState<AreaId[]>([]);
  const [startDoneIds, setStartDoneIds] = useState<string[]>([]);
  const [startDocIds, setStartDocIds] = useState<string[]>([]);
  const { user } = useSession();

  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem("migrago.start.v1") ?? "null");
      if (Array.isArray(saved?.areas)) setStartAreas(saved.areas.filter((id: unknown): id is AreaId => AREAS.some((area) => area.id === id)));
      const ids: unknown = JSON.parse(window.localStorage.getItem("migrago.start.done") ?? window.sessionStorage.getItem("migrago.start.done") ?? "[]");
      if (Array.isArray(ids)) setStartDoneIds(ids.filter((id): id is string => typeof id === "string"));
      const docs: unknown = JSON.parse(window.localStorage.getItem("migrago.start.docs") ?? "[]");
      if (Array.isArray(docs)) setStartDocIds(docs.filter((id): id is string => typeof id === "string"));
    } catch { /* Storage may be unavailable or invalid. */ }
  }, []);

  // Returning from the Founder's Circle email capture + consent step.
  useEffect(() => {
    if (!hydrated) return;
    if (window.localStorage.getItem("migrago.justUpgraded") !== "1") return;
    window.localStorage.removeItem("migrago.justUpgraded");
    setTab("dashboard");
    setBuildingRoadmap(true);
    const id = window.setTimeout(() => setBuildingRoadmap(false), 4000);
    return () => window.clearTimeout(id);
  }, [hydrated]);


  // Locked views read only the submitted round; an in-progress re-assessment
  // never changes the displayed profile.
  const displayAnswers = state.assessmentStatus === "editing" ? (state.submittedAnswers ?? {}) : (state.submittedAnswers ?? state.answers);
  const profile = useMemo(
    () => computeProfile(displayAnswers, state.founderTrack === true, state.region ?? "undecided"),
    [displayAnswers, state.founderTrack, state.region],
  );
  const gapList = useMemo(() => buildGapAnalysis(profile), [profile]);
  const locked = state.tier !== "navigator";
  const hasStartPlan = hasNavigatorAccess(state.tier) && Boolean(state.municipality) && startAreas.length > 0;
  // The home card and the /start roadmap share this exact step set: the
  // area-flow steps only. The 7 profile steps stay in the /start profile
  // section and the progress tab, counted separately.
  const roadmapSteps = hasStartPlan
    ? buildAreaSteps(startAreas, state.answers, state.route ?? suggestRoute(state.answers[2]?.value), state.region)
    : [];
  const allItems = hasStartPlan ? [
    ...roadmapSteps,
    ...(state.completed ? getProfileSteps(profile.gaps) : []),
  ] : [];
  const startPlanStepIds = allItems.map((step) => step.id);
  const done = new Set(startDoneIds);
  const roadmap = [1, 2, 3, 4].map((phase) => ({ phase, items: allItems.filter((step) => step.phase === phase) }));
  const roadmapDoneCount = roadmapSteps.filter((step) => done.has(step.id)).length;
  const roadmapPhases = [1, 2, 3, 4].map((phase) => ({
    color: ROADMAP_PHASES[phase - 1]?.value ?? "var(--navigator-teal)",
    total: roadmapSteps.filter((step) => step.phase === phase).length,
    done: roadmapSteps.filter((step) => step.phase === phase && done.has(step.id)).length,
  }));
  const openStartRoadmap = () => {
    if (hasStartPlan) {
      try {
        const saved = JSON.parse(window.sessionStorage.getItem("migrago.start.v1") ?? "null");
        if (saved && typeof saved === "object" && Array.isArray(saved.areas)) window.sessionStorage.setItem("migrago.start.v1", JSON.stringify({ ...saved, stage: "road" }));
      } catch { /* Fall back to the normal /start entry. */ }
    }
    void navigate({ to: "/start" });
  };

  useEffect(() => {
    if (hydrated && !hasNavigatorAccess(state.tier) && !deleted) void navigate({ to: "/assessment" });
  }, [hydrated, state.completed, state.tier, deleted, navigate]);

  // One-time migration: completed users without any snapshot get exactly one
  // baseline snapshot; afterwards snapshots are created only on explicit submit.
  useEffect(() => {
    if (!hydrated || !state.completed || !hasNavigatorAccess(state.tier)) return;
    ensureBaselineSnapshot({
      overall: profile.overall,
      legal: profile.legal,
      professional: profile.professional,
      psychological: profile.psychological,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, state.completed, state.tier]);

  useEffect(() => {
    if (hydrated && locked && state.completed) trackEvent({ type: "paywall_view" });
  }, [hydrated, locked, state.completed]);

  if (!hydrated || (!hasNavigatorAccess(state.tier) && !deleted)) return null;

  if (buildingRoadmap) {
    return (
      <PenguinLoader
        messages={[t("loading.roadmapSub"), t("loading.roadmap")]}
        durationMs={4000}
      />
    );
  }

  const dims = [
    { key: "dim1", label: t("dash.dim1"), value: profile.legal, weight: 30, color: DIM_COLORS[0] },
    { key: "dim2", label: t("dash.dim2"), value: profile.professional, weight: 40, color: DIM_COLORS[1] },
    { key: "dim3", label: t("dash.dim3"), value: profile.psychological, weight: 30, color: DIM_COLORS[2] },
  ];

  const historyData = state.history.map((h, i) => ({
    n: `${t("dash.snapshot")} ${localizeNumber(i + 1, lang)} — ${new Date(h.at).toLocaleDateString(
      lang === "fa" ? "fa-IR" : "en-GB",
      { day: "numeric", month: "short" },
    )}`,
    overall: h.overall,
    legal: h.legal,
    professional: h.professional,
    psychological: h.psychological,
  }));
  const bonusAnswered =
    state.founderTrack === true &&
    FOUNDER_TRACK_IDS.every((id) => {
      const question = QUESTIONS.find((candidate) => candidate.id === id);
      return question ? isAnswered(question, state.answers[id]) : false;
    });

  const openPaywall = () => {
    trackEvent({ type: "upgrade_click" });
    setPayModal(true);
  };

  // Email captured (or skipped) → checkout. Consent was already collected before assessment.
  const afterEmailCapture = () => {
    setPayModal(false);
    void navigate({ to: "/checkout" });
  };

  const docKeys = documentsForSteps(allItems).flatMap((item) => item.documents.map((_, index) => `${item.id}:${index}`));
  const docsDone = docKeys.filter((id) => startDocIds.includes(id)).length;
  const totalTasks = allItems.length;
  const doneCount = allItems.filter((i) => done.has(i.id)).length;
  const assessmentCounts = assessmentProgress(displayAnswers, { founderTrack: state.founderTrack ?? null }, state.section7Skipped === true);
  const latestSnapshot = state.history[state.history.length - 1];
  const snapshotDate = latestSnapshot
    ? new Date(latestSnapshot.at).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const readinessLabel =
    profile.overall >= 75
      ? t("readiness.high")
      : profile.overall >= 55
        ? t("readiness.moderate")
        : t("readiness.developing");

  const priorityLabel = (p: "high" | "medium" | "normal" | "low") =>
    p === "high" ? t("prio.high") : p === "medium" ? t("prio.medium") : t("prio.low");

  const remainingPriorities = allItems
    .filter((i) => !done.has(i.id) && KNOWLEDGE_TABLE.find((entry) => entry.id === i.id)?.priority === "high")
    .slice(0, 3);

  const weeklyProgress = Array.from({ length: 12 }, (_, idx) => {
    const week = idx + 1;
    const items = allItems.filter((i) => getStepWeek(i) === week);
    const completed = items.filter((i) => done.has(i.id)).length;
    return { week, total: items.length, completed };
  });

  const tabs: [Tab, string][] = [
    ["dashboard", t("tab.dashboard")],
    ["assessment", t("tab.assessment")],
    ["profile", t("tab.profile")],
    ["progress", t("tab.progress")],
    ["account", t("tab.account")],
  ];



  return (
    <div className="min-h-screen">
      <AppHeader registered />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl">{t("journey.title")}</h1>
            <p className="mt-2 text-xs text-muted-foreground">{t("dash.recalc").replace("{date}", snapshotDate)}</p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out hover:bg-muted"
          >
            <Pencil className="size-4" aria-hidden />
            {t("dash.editAnswers")}
          </Link>
        </div>

        <nav className="mt-7 flex flex-wrap gap-2" role="tablist">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out",
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── Dashboard tab ───────────────────────────── */}
        {tab === "dashboard" ? (
          <div className="rise-in mt-7 space-y-5">
            <section className="border-b border-border py-6">
              <h2 className="text-lg">{t("dash.homeRoadmapTitle")}</h2>
              <RoadmapSummary done={roadmapDoneCount} total={roadmapSteps.length} phases={roadmapPhases} />
              {state.completed ? <p className="text-sm font-semibold">{t("dash.readinessScore").replace("{overall}", localizeNumber(profile.overall, lang))}</p> : null}
              <Button type="button" variant="secondary" className="mt-4 rounded-full" onClick={openStartRoadmap}>{t("dash.homeRoadmapCta")}<ArrowRight className="size-4 rtl:rotate-180" /></Button>
            </section>
            {!state.completed ? <ProfilePreview onOpen={() => { void navigate({ to: "/assessment" }); }} /> : null}

            <div>
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("dash.engineHowTitle")}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("dash.engineHowBody")}</p>

              </section>
            </div>
          </div>
        ) : null}

        {/* ── My Assessment tab ───────────────────────── */}
        {tab === "assessment" ? (
          <div className="rise-in mt-7 max-w-3xl space-y-5">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("assess.title")}</h2>
              <p className="mt-2 text-sm font-semibold">{t("assess.structure")}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {localizeNumber(assessmentCounts.answered, lang)} {t("assess.answeredOf")}{" "}
                {localizeNumber(assessmentCounts.total, lang)}
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
                  style={{ width: `${assessmentCounts.total ? Math.round((assessmentCounts.answered / assessmentCounts.total) * 100) : 0}%` }}
                />
              </div>
              <p
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold",
                  state.completed ? "bg-secondary/12 text-secondary" : "bg-accent/25 text-accent-foreground",
                )}
              >
                {state.completed ? t("assess.completed") : t("assess.notCompleted")}
              </p>
              {state.completed ? (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  <Lock className="size-3" aria-hidden />
                  {t("assess.locked")}
                  {snapshotDate ? ` — ${snapshotDate}` : ""}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                >
                  {state.completed ? t("dash.editAnswers") : t("assess.open")}
                </Link>
                {state.completed && !locked ? (
                  reassessConfirm ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold">{t("assess.reassessConfirm")}</span>
                      <Button type="button" variant="secondary" className="rounded-full" onClick={() => { update({ assessmentStatus: "editing" }); setReassessConfirm(false); void navigate({ to: "/assessment" }); }}>{t("assess.reassess")}</Button>
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => setReassessConfirm(false)}>{t("common.back")}</Button>
                    </span>
                  ) : (
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setReassessConfirm(true)}>{t("assess.reassess")}</Button>
                  )
                ) : null}
              </div>
            </section>
          </div>
        ) : null}

        {/* ── My Profile tab ──────────────────────────── */}
        {tab === "profile" && !state.completed ? <ProfilePreview onOpen={() => { void navigate({ to: "/assessment" }); }} /> : null}
        {tab === "profile" && state.completed ? (
          <div className="rise-in mt-7 grid gap-5 lg:grid-cols-3">
            {/* Overall + donut */}
            <section className="glass-card rounded-3xl p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg">{t("dash.title")}</h2>
                {locked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
                    <Lock className="size-3" aria-hidden />
                    {t("pay.teaser")}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="relative mx-auto size-44">
                  <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--muted)" strokeWidth="9" />
                    <circle className="roadmap-progress-transition" cx="60" cy="60" r="50" fill="none" stroke="var(--navigator-teal)" strokeWidth="9" strokeLinecap="round" strokeDasharray={Math.PI * 100} strokeDashoffset={Math.PI * 100 * (1 - profile.overall / 100)} transform="rotate(-90 60 60)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold tabular-nums">{localizeNumber(profile.overall, lang)}</span><span className="text-xs text-muted-foreground">{t("q.of")} {localizeNumber(100, lang)}</span></div>
                </div>
                <ul className="space-y-5">{dims.map((d, index) => <li key={d.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm font-semibold"><span>{d.label}</span><span className="shrink-0 tabular-nums">{localizeNumber(d.value, lang)}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="roadmap-progress-transition h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: ["var(--navigator-teal)", "var(--navigator-olive)", "var(--navigator-gold)"][index] }} /></div>
                  <p className="mt-1 text-xs text-muted-foreground">{t("dash.weight")} {localizeNumber(d.weight, lang)}%</p>
                </li>)}</ul>
              </div>
              {state.history.length >= 2 ? <p className="mt-4 text-xs text-muted-foreground">{t("dash.historyChange").split("{delta}")[0]}<bdi dir="ltr">{formatScoreDelta(state.history, lang)}</bdi>{t("dash.historyChange").split("{delta}")[1]}</p> : null}
              <p className="mt-4 text-xs text-muted-foreground">{t("dash.dim3Note")}</p>
              <Button type="button" variant="secondary" className="mt-5 rounded-full" onClick={openStartRoadmap}>{t("dash.homeRoadmapCta")}<ArrowRight className="size-4 rtl:rotate-180" /></Button>
            </section>

            {/* Analysis + paywall */}
            <div className="space-y-5">
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("dash.analysis")}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {analysisSummary(profile)[lang]}
                </p>
                {(() => {
                  const weakest = weakestDimension(profile);
                  const weakestValue = profile[weakest];
                  if (weakestValue >= TOP_BAND_THRESHOLD) return null;
                  const dimensionLabel = t(weakest === "legal" ? "dash.dim1" : weakest === "professional" ? "dash.dim2" : "dash.dim3");
                  return (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {t("dash.analysis.weakest").replace("{dimension}", dimensionLabel)}{" "}
                      {t(`dash.analysis.weakest.${weakest}` as "dash.analysis.weakest.legal")}
                    </p>
                  );
                })()}
                {profile.strengths.length ? (
                  <>
                    <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-secondary">
                      {t("dash.strengths")}
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {profile.strengths.slice(0, 3).map((s) => (
                        <li key={s.en}>• {s[lang]}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

              </section>




              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("dash.bonus")}</h2>
                <p className="mt-2 text-4xl font-bold text-[var(--navigator-teal)] tabular-nums">
                  {bonusAnswered
                    ? `${localizeNumber(profile.bonus, lang)}%`
                    : t("dash.bonusNotAnswered")}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{t("dash.bonusNote")}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("dash.bonusNotCore")}</p>
              </section>

              {locked ? (
                <section
                  className="rounded-3xl p-6"
                  style={{ background: "var(--plum)", color: "oklch(0.97 0.006 85)" }}
                >
                  <h2 className="text-lg">{t("pay.title")}</h2>
                  <p className="mt-2 text-sm opacity-85">{t("pay.sub")}</p>
                  <button
                    type="button"
                    onClick={openPaywall}

                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-opacity duration-200 ease-out hover:opacity-90"
                  >
                    <Sparkles className="size-4" aria-hidden />
                    {t("pay.unlock")}
                  </button>
                  <p className="mt-3 text-center text-[11px] opacity-70">{t("pay.demoNote")}</p>
                </section>
              ) : null}
            </div>

            {/* Gap analysis — What Needs Attention? */}
            <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
              <h2 className="text-lg">{t("gap.title")}</h2>
              {gapList.length ? <>
                <ul className="mt-4 space-y-3">{(showAllGaps ? gapList : gapList.slice(0, 3)).map((g) => {
                  const relatedSteps = getRelatedStepsForGap(g.flag, startPlanStepIds);
                  const expanded = expandedGaps.includes(g.flag);
                  return <li key={g.flag} className="rounded-lg border border-border p-4">
                    <Button type="button" variant="ghost" aria-expanded={expanded} aria-controls={`gap-${g.flag}`} className="h-auto w-full flex-wrap justify-start gap-2 whitespace-normal p-0 text-start hover:bg-transparent" onClick={() => setExpandedGaps((current) => expanded ? current.filter((id) => id !== g.flag) : [...current, g.flag])}>
                      <span className="me-auto text-sm font-bold">{g.gap[lang]}</span>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", g.priority === "high" ? "bg-destructive text-destructive-foreground" : g.priority === "medium" ? "bg-[var(--navigator-gold)] text-[var(--navigator-navy)]" : "bg-[var(--chart-5)] text-[var(--navigator-navy)]")}>{priorityLabel(g.priority)}</span>
                      {g.institution === "Valvira / OPH" ? <><InstitutionBadge institution={g.institution} displayName={t("start.authority.Valvira")} compact /><InstitutionBadge institution={g.institution} displayName={t("start.authority.OPH")} compact /></> : <InstitutionBadge institution={g.institution} compact />}
                      {relatedSteps.length > 0 ? <span className="w-full text-xs font-normal text-muted-foreground">{t("dash.gap.relatedSteps").replace("{done}", localizeNumber(relatedSteps.filter((id) => done.has(id)).length, lang)).replace("{total}", localizeNumber(relatedSteps.length, lang))}</span> : null}
                    </Button>
                    {expanded ? <div id={`gap-${g.flag}`} className="mt-3 space-y-2 text-sm text-muted-foreground"><p className="font-semibold">{t("gap.why")}</p><p>{g.why[lang]}</p><p className="font-semibold">{t("gap.action")}</p><p>{g.action[lang]}</p>{relatedSteps.length > 0 ? <Button type="button" variant="link" className="h-auto p-0 text-xs text-secondary" onClick={openStartRoadmap}>{t("dash.gap.viewInRoadmap")}<ArrowRight className="size-3.5 rtl:rotate-180" /></Button> : null}</div> : null}
                  </li>;
                })}</ul>
                {!showAllGaps && gapList.length > 3 ? <Button type="button" variant="link" className="mt-3 h-auto p-0" onClick={() => setShowAllGaps(true)}>{t("dash.showAll")}</Button> : null}
              </> : <p className="mt-3 text-sm text-muted-foreground">{t("gap.none")}</p>}
            </section>

            <div className="lg:col-span-3"><CsatWidget /></div>

            {/* Trend — score history over time */}
            <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
              <h2 className="text-lg">{t("dash.history")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t("dash.historyNote")}</p>
              {historyData.length > 1 ? (
                <div className="mt-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData} margin={{ top: 8, right: 12, bottom: 18, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.35} />
                      <XAxis dataKey="n" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis domain={[0, 100]} width={30} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" }}
                        formatter={(v: number, name: string) => [`${v}%`, name]}
                      />
                      <Legend verticalAlign="bottom" height={30} iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        name={t("dash.overall")}
                        stroke="var(--plum)"
                        strokeWidth={3.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line type="monotone" dataKey="legal" name={t("dash.dim1")} stroke={DIM_COLORS[0]} strokeWidth={2.5} dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="professional" name={t("dash.dim2")} stroke={DIM_COLORS[1]} strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="psychological" name={t("dash.dim3")} stroke={DIM_COLORS[2]} strokeWidth={2.5} strokeDasharray="2 3" dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t("dash.noHistory")}</p>
              )}
            </section>
          </div>
        ) : null}

        {/* ── Progress tab ────────────────────────────── */}
        {tab === "progress" ? (
          <div className="navigator-entered rise-in mt-7 space-y-5">
            {doneCount >= 3 ? <NpsSurvey /> : null}
            {!locked ? <section className="rounded-lg border border-border bg-card p-4"><h2 className="text-sm font-semibold">{t("start.docs.counter").replace("{x}", localizeNumber(docsDone, lang)).replace("{y}", localizeNumber(docKeys.length, lang))}</h2></section> : null}
            {!hasStartPlan ? (
              <section className="border-b border-border py-6"><h2 className="text-lg">{t("prog.noSessionTitle")}</h2><Button type="button" variant="secondary" className="mt-4 rounded-full" onClick={openStartRoadmap}>{t("prog.noSessionCta")}</Button></section>
            ) : (
              <>
                <section className="rounded-3xl border border-border bg-card p-6 text-[var(--navigator-navy)]">
                  <h2 className="text-lg text-[var(--navigator-navy)]">{t("prog.overall")}</h2>
                  <p className="mt-3 text-4xl font-bold text-[var(--navigator-navy)] tabular-nums">
                    {localizeNumber(
                      totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0,
                      lang,
                    )}
                    %
                  </p>
                  <div
                    className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, color-mix(in oklab, var(--navigator-light-teal) 18%, var(--card)) 0 25%, color-mix(in oklab, var(--navigator-teal) 18%, var(--card)) 25% 50%, color-mix(in oklab, var(--navigator-olive) 18%, var(--card)) 50% 75%, color-mix(in oklab, var(--navigator-gold) 18%, var(--card)) 75% 100%)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${totalTasks ? (doneCount / totalTasks) * 100 : 0}%`,
                        background:
                          "linear-gradient(to right, var(--navigator-light-teal) 0 25%, var(--navigator-teal) 25% 50%, var(--navigator-olive) 50% 75%, var(--navigator-gold) 75% 100%)",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--navigator-navy)]">
                    {localizeNumber(doneCount, lang)} / {localizeNumber(totalTasks, lang)}{" "}
                    {t("road.progress")}
                  </p>
                </section>

                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="rounded-3xl border border-border bg-card p-6 text-[var(--navigator-navy)]">
                    <h2 className="text-lg text-[var(--navigator-navy)]">{t("prog.phase")}</h2>
                    <ul className="mt-4 space-y-4">
                      {roadmap.map((phase, i) => {
                        const total = phase.items.length;
                        const completed = phase.items.filter((it) => done.has(it.id)).length;
                        const pct = total ? Math.round((completed / total) * 100) : 0;
                        return (
                            <li
                              key={phase.phase}
                              className="rounded-xl p-2.5"
                              style={{
                                background: `color-mix(in oklab, ${ROADMAP_PHASES[i]?.value ?? "var(--navigator-teal)"} 9%, var(--card))`,
                              }}
                            >
                            <div className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                                <span style={{ color: ROADMAP_PHASES[i]?.value ?? "var(--navigator-teal)" }}>
                                  {t(PHASE_TITLE_KEYS[i] ?? "road.phase1")}
                                </span>
                              <span className="tabular-nums" style={{ color: ROADMAP_PHASES[i]?.value ?? "var(--navigator-teal)" }}>
                                {localizeNumber(completed, lang)}/{localizeNumber(total, lang)}
                              </span>
                            </div>
                            <div
                              className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
                              style={{
                                background: `color-mix(in oklab, ${ROADMAP_PHASES[i]?.value ?? "var(--navigator-teal)"} 20%, var(--card))`,
                              }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: ROADMAP_PHASES[i]?.value ?? "var(--navigator-teal)",
                                }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section className="rounded-3xl border border-border bg-card p-6">
                    <h2 className="text-lg text-[var(--navigator-navy)]">{t("prog.weekly")}</h2>
                    <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {weeklyProgress.map((w) => {
                        const phaseColor = ROADMAP_PHASES[Math.ceil(w.week / 3) - 1]?.value ?? "var(--navigator-teal)";
                        const completionRatio = w.total ? w.completed / w.total : 0;
                        const fillStrength = Math.round(10 + completionRatio * 90);
                        const empty = w.total === 0;
                        return (
                        <li
                          key={w.week}
                          className={cn(
                            "rounded-2xl border p-3 text-center",
                            empty ? "text-muted-foreground" : "text-[var(--navigator-navy)]",
                          )}
                          style={
                            empty
                              ? { borderColor: "var(--border)", background: "var(--muted)" }
                              : {
                                  borderColor: `color-mix(in oklab, ${phaseColor} 55%, var(--border))`,
                                  background: `color-mix(in oklab, ${phaseColor} ${fillStrength}%, var(--card))`,
                                }
                          }
                        >
                          <p className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide",
                            empty ? "text-muted-foreground" : "text-[var(--navigator-navy)]",
                          )}>
                            {t("road.week")} {localizeNumber(w.week, lang)}
                          </p>
                          <p className="mt-1 text-sm font-bold tabular-nums">
                            {empty
                              ? "—"
                              : `${localizeNumber(w.completed, lang)}/${localizeNumber(w.total, lang)}`}
                          </p>
                        </li>
                        );
                      })}

                    </ul>
                  </section>

                  <section className="rounded-3xl border border-[var(--navigator-teal)]/20 bg-[var(--navigator-teal)]/5 p-6">
                    <h2 className="text-lg text-[var(--navigator-teal)]">{t("prog.completedActions")}</h2>
                    {doneCount ? (
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {allItems
                          .filter((i) => done.has(i.id))
                          .slice(showAllCompleted ? 0 : -5)
                          .map((i) => (
                            <li key={i.id} className="flex items-start gap-2">
                              <Check className="mt-0.5 size-4 shrink-0 text-[var(--navigator-teal)]" aria-hidden />
                              {typeof i.title === "string" ? t(i.title) : i.title[lang]}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">{t("prog.none")}</p>
                    )}
                    {!showAllCompleted && doneCount > 5 ? <Button type="button" variant="link" className="mt-3 h-auto p-0" onClick={() => setShowAllCompleted(true)}>{t("dash.showAll")}</Button> : null}
                  </section>

                  <section className="rounded-3xl border border-border border-s-4 border-s-destructive bg-[var(--readiness-cream)] p-6 text-[var(--navigator-navy)]">
                    <h2 className="text-lg text-[var(--navigator-navy)]">{t("prog.remaining")}</h2>
                    {remainingPriorities.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-[var(--navigator-navy)]">
                        {remainingPriorities.map((i) => (
                          <li key={i.id} className="flex items-start gap-2">
                              <Target className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                            <span>
                              <span className="me-2 rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-semibold text-destructive-foreground">{t("prio.high")}</span>{typeof i.title === "string" ? t(i.title) : i.title[lang]} · {t("road.week")} {localizeNumber(getStepWeek(i), lang)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--navigator-navy)]">{t("prog.noRemaining")}</p>
                    )}
                  </section>
                </div>
              </>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer.responsible")}</p>
          </div>
        ) : null}

        {/* ── Account tab ─────────────────────────────── */}
        {tab === "account" ? (
          <div className="rise-in mt-7 max-w-2xl space-y-5">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("set.account")}</h2>
              {user ? (
                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground">{t("set.email")}: </span>
                  <span className="font-semibold">{user.email}</span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("set.notSignedIn")}
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("set.legal")}</h2>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                <Link to="/privacy" className="inline-flex items-center gap-1.5 text-secondary underline underline-offset-4">
                  <FileText className="size-4" aria-hidden />
                  {t("set.privacy")}
                </Link>
                <Link to="/terms" className="inline-flex items-center gap-1.5 text-secondary underline underline-offset-4">
                  <FileText className="size-4" aria-hidden />
                  {t("set.terms")}
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {t("disclaimer.responsible")}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("set.support")}</h2>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                <Link to="/faq" className="inline-flex items-center gap-1.5 text-secondary underline underline-offset-4">
                  <HelpCircle className="size-4" aria-hidden />
                  {t("nav.faq")}
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-1.5 text-secondary underline underline-offset-4">
                  <Mail className="size-4" aria-hidden />
                  {t("nav.contact")}
                </Link>
              </div>
              <div className="mt-4">
                <SupportChannels compact />
              </div>
            </section>

            <section className="rounded-3xl border border-destructive/30 bg-card p-6">
              <h2 className="text-lg">{t("dash.deleteData")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("dash.deleteBody")}</p>
              {deleted ? <p className="mt-4 text-sm font-semibold text-secondary">{t("dash.deleteDone")}</p> : confirmDelete ? <div className="mt-4">
                <p className="text-sm font-semibold text-destructive">{t("dash.deleteConfirmQuestion")}</p>
                <div className="mt-3 flex flex-wrap gap-3"><Button type="button" variant="destructive" onClick={() => {
                  reset();
                  for (const key of ["migrago.start.done", "migrago.start.docs", "migrago.inProgress"]) window.localStorage.removeItem(key);
                  for (const key of ["migrago.start.v1", "migrago.start.done"]) window.sessionStorage.removeItem(key);
                  setDeleted(true);
                  void navigate({ to: "/" });
                }}><Trash2 className="size-4" />{t("dash.deleteConfirmYes")}</Button><Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>{t("dash.deleteConfirmCancel")}</Button></div>
              </div> : <Button type="button" variant="destructive" className="mt-4 rounded-full" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" />{t("dash.deleteData")}</Button>}

            </section>
          </div>
        ) : null}
      </main>

      <FoundersCircleModal
        open={payModal}
        onClose={() => setPayModal(false)}
        onJoined={afterEmailCapture}
      />


      <SiteFooter />
    </div>
  );
}
