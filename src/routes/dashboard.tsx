import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
import { AppHeader, LanguageSwitch, SiteFooter } from "@/components/BrandHeader";
import { PenguinLoader } from "@/components/PenguinLoader";
import {
  CsatWidget,
  FoundersCircleModal,
  InstitutionBadge,
  NpsSurvey,
} from "@/components/FeedbackWidgets";
import { SupportChannels } from "@/components/SupportChannels";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { analysisSummary, computeProfile, type GapFlag } from "@/lib/scoring";
import { KNOWLEDGE_TABLE, PHASE_TITLE_KEYS, generateRoadmap, type Phase } from "@/lib/roadmap";
import { buildGapAnalysis, buildPathways, whyRecommended } from "@/lib/pathways";
import { FOUNDER_TRACK_IDS, QUESTIONS, isAnswered } from "@/lib/questions";
import { fetchRoadmapProgress, setRoadmapTask } from "@/lib/feedback";
import { useSession } from "@/lib/session";
import { trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Smart Integration Profile — MigraGo dashboard" },
      {
        name: "description",
        content:
          "Your Legal / Status Readiness, Economic & Professional Capacity and Soft Skills & Psychological Readiness scores plus your evidence-based 12-week Finland roadmap.",
      },
      { property: "og:title", content: "Smart Integration Profile — MigraGo dashboard" },
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

function phaseForGap(flag: GapFlag): Phase | undefined {
  if (flag === "urgent_timeline") return 1;
  return KNOWLEDGE_TABLE.find((entry) => entry.requires?.includes(flag))?.phase;
}

function phaseColorForTiming(from: number, to: number) {
  const fromPhase = Math.min(4, Math.max(1, Math.ceil(from / 3)));
  const toPhase = Math.min(4, Math.max(1, Math.ceil(to / 3)));
  if (fromPhase === 4 && toPhase === 4) return "var(--navigator-olive)";
  return fromPhase === toPhase
    ? ROADMAP_PHASES[fromPhase - 1]?.value ?? "var(--navigator-teal)"
    : "var(--navigator-teal)";
}

function PhaseCard({
  children,
  phase,
  timing,
  hoverTint = false,
}: {
  children: ReactNode;
  phase?: Phase | undefined;
  timing?: { from: number; to: number };
  hoverTint?: boolean;
}) {
  const phaseColor = phase
    ? ROADMAP_PHASES[phase - 1]?.value ?? "var(--navigator-teal)"
    : timing
      ? phaseColorForTiming(timing.from, timing.to)
      : "var(--navigator-teal)";

  return (
    <li
      className="rounded-2xl border border-border p-5 transition-colors duration-200 ease-out"
      style={{
        borderLeftColor: phaseColor,
        borderLeftWidth: "4px",
        background: `color-mix(in oklab, ${phaseColor} 7%, var(--card))`,
      }}
      onMouseEnter={
        hoverTint
          ? (event) => {
              event.currentTarget.style.background = `color-mix(in oklab, ${phaseColor} 10%, var(--card))`;
            }
          : undefined
      }
      onMouseLeave={
        hoverTint
          ? (event) => {
              event.currentTarget.style.background = `color-mix(in oklab, ${phaseColor} 7%, var(--card))`;
            }
          : undefined
      }
    >
      {children}
    </li>
  );
}

const IN_PROGRESS_KEY = "migrago.inProgress";

type Tab = "dashboard" | "assessment" | "profile" | "roadmap" | "progress" | "account";

function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { state, hydrated, pushSnapshot, reset } = useAppState();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [buildingRoadmap, setBuildingRoadmap] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [inProgress, setInProgress] = useState<Set<string>>(new Set());
  const [openWhy, setOpenWhy] = useState<string | null>(null);
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      setDone(new Set());
      return;
    }
    void fetchRoadmapProgress().then(setDone);
  }, [user]);

  useEffect(() => {
    const raw = window.localStorage.getItem(IN_PROGRESS_KEY);
    if (raw) {
      try {
        setInProgress(new Set(JSON.parse(raw) as string[]));
      } catch {
        /* ignore malformed local state */
      }
    }
  }, []);

  // Returning from the Founder's Circle email capture + consent step.
  useEffect(() => {
    if (!hydrated) return;
    if (window.localStorage.getItem("migrago.justUpgraded") !== "1") return;
    window.localStorage.removeItem("migrago.justUpgraded");
    setTab("roadmap");
    setBuildingRoadmap(true);
    const id = window.setTimeout(() => setBuildingRoadmap(false), 4000);
    return () => window.clearTimeout(id);
  }, [hydrated]);


  const profile = useMemo(
    () => computeProfile(state.answers, state.founderTrack === true, state.region ?? "undecided"),
    [state.answers, state.founderTrack, state.region],
  );
  const roadmap = useMemo(() => generateRoadmap(profile), [profile]);
  const allItems = useMemo(() => roadmap.flatMap((p) => p.items), [roadmap]);
  const gapList = useMemo(() => buildGapAnalysis(profile), [profile]);
  const pathways = useMemo(() => buildPathways(profile, allItems), [profile, allItems]);
  const locked = state.tier !== "navigator";

  useEffect(() => {
    if (hydrated && !state.completed && !deleted) void navigate({ to: "/assessment" });
  }, [hydrated, state.completed, deleted, navigate]);

  // Live recalculation: every answer edit produces a new snapshot.
  useEffect(() => {
    if (!hydrated || !state.completed) return;
    pushSnapshot({
      overall: profile.overall,
      legal: profile.legal,
      professional: profile.professional,
      psychological: profile.psychological,
    });
  }, [hydrated, state.completed, profile, pushSnapshot]);

  useEffect(() => {
    if (hydrated && locked && state.completed) trackEvent({ type: "paywall_view" });
  }, [hydrated, locked, state.completed]);

  if (!hydrated) return null;

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

  const donutData = dims.map((d) => ({ name: d.label, value: d.value }));
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

  const totalTasks = allItems.length;
  const doneCount = allItems.filter((i) => done.has(i.id)).length;
  const answeredCount = QUESTIONS.filter((q) => state.answers[q.id] !== undefined).length;

  const readinessLabel =
    profile.overall >= 75
      ? t("readiness.high")
      : profile.overall >= 55
        ? t("readiness.moderate")
        : t("readiness.developing");

  const statusOf = (id: string): "completed" | "inProgress" | "notStarted" =>
    done.has(id) ? "completed" : inProgress.has(id) ? "inProgress" : "notStarted";

  const persistInProgress = (next: Set<string>) => {
    setInProgress(next);
    window.localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify([...next]));
  };

  const setStatus = (id: string, status: "completed" | "inProgress" | "notStarted") => {
    const nextDone = new Set(done);
    const nextProgress = new Set(inProgress);
    if (status === "completed") {
      nextDone.add(id);
      nextProgress.delete(id);
    } else if (status === "inProgress") {
      nextDone.delete(id);
      nextProgress.add(id);
    } else {
      nextDone.delete(id);
      nextProgress.delete(id);
    }
    setDone(nextDone);
    persistInProgress(nextProgress);
    if (user) void setRoadmapTask(user.id, id, status === "completed");
  };

  const priorityLabel = (p: "high" | "medium" | "normal" | "low") =>
    p === "high" ? t("prio.high") : p === "medium" ? t("prio.medium") : t("prio.low");

  const remainingPriorities = allItems
    .filter((i) => !done.has(i.id) && i.priority === "high")
    .slice(0, 6);

  const weeklyProgress = Array.from({ length: 12 }, (_, idx) => {
    const week = idx + 1;
    const items = allItems.filter((i) => i.week === week);
    const completed = items.filter((i) => done.has(i.id)).length;
    return { week, total: items.length, completed };
  });

  const tabs: [Tab, string][] = [
    ["dashboard", t("tab.dashboard")],
    ["assessment", t("tab.assessment")],
    ["profile", t("tab.profile")],
    ["roadmap", t("tab.roadmap")],
    ["progress", t("tab.progress")],
    ["account", t("tab.account")],
  ];

  const journeySteps = [
    { icon: ClipboardList, label: t("journey.s1"), reached: state.completed, color: "var(--navigator-light-teal)" },
    { icon: Target, label: t("journey.s2"), reached: state.completed, color: "var(--navigator-teal)" },
    { icon: Compass, label: t("journey.s3"), reached: state.completed, color: "var(--navigator-olive)" },
    { icon: MapIcon, label: t("journey.s4"), reached: !locked, color: "var(--navigator-gold)" },
    { icon: TrendingUp, label: t("journey.s5"), reached: !locked && doneCount > 0, color: "var(--navigator-navy)" },
  ];

  const roadmapBuildSteps = [
    { key: "engine.s1", icon: Puzzle, color: "var(--navigator-teal)" },
    { key: "engine.s2", icon: MapPin, color: "var(--navigator-light-teal)" },
    { key: "engine.s3", icon: ListChecks, color: "var(--navigator-olive-gold)" },
    { key: "engine.s4", icon: UserCircle, color: "var(--navigator-teal)" },
    { key: "engine.s5", icon: ArrowRightLeft, color: "var(--navigator-teal)" },
    { key: "engine.s6", icon: Flag, color: "var(--navigator-light-teal)" },
  ] as const;

  const ReportSection = () => (
    <section id="integration-report" className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg text-[var(--navigator-teal)]">{t("report.title")}</h2>

      <h3 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--navigator-teal)]">
        <ClipboardList className="size-4" aria-hidden />
        {t("report.summaryTitle")}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {localizeNumber(answeredCount, lang)} {t("report.answered")} ·{" "}
        <span className="font-semibold text-[var(--navigator-gold)]">
          {t("readiness.title")}: {localizeNumber(profile.overall, lang)}% — {readinessLabel}
        </span>
      </p>
      <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-3">
        {dims.map((d) => (
          <li key={d.key}>
            {d.label}:{" "}
            <span className="font-semibold tabular-nums" style={{ color: d.color }}>
              {localizeNumber(d.value, lang)}%
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--navigator-teal)]">
        <ShieldCheck className="size-4" aria-hidden />
        {t("report.strengths")}
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {profile.strengths.length ? (
          profile.strengths.map((s) => <li key={s.en}>• {s[lang]}</li>)
        ) : (
          <li>—</li>
        )}
      </ul>

      <h3 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--navigator-teal)]">
        <ListChecks className="size-4" aria-hidden />
        {t("report.gaps")} · {t("report.priorities")}
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {gapList.length ? (
          gapList.map((g) => (
            <li key={g.flag} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-2 size-1.5 shrink-0 rounded-full",
                  g.priority === "high" ? "bg-destructive" : "bg-[var(--navigator-teal)]",
                )}
                aria-hidden
              />
              <span>{g.gap[lang]} — {priorityLabel(g.priority)}</span>
            </li>
          ))
        ) : (
          <li>{t("gap.none")}</li>
        )}
      </ul>

      <h3 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--navigator-teal)]">
        <Compass className="size-4" aria-hidden />
        {t("report.pathways")}
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {pathways.map((p) => (
          <li key={p.institution}>
            • {p.title[lang]} — {t("path.weeks")} {localizeNumber(p.timing.from, lang)}–
            {localizeNumber(p.timing.to, lang)}
          </li>
        ))}
      </ul>

      <h3 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--navigator-teal)]">
        <RouteIcon className="size-4" aria-hidden />
        {t("report.roadmap")}
      </h3>
      {locked ? (
        <p className="mt-2 text-sm text-muted-foreground">{t("road.locked")}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {roadmap.map((phase, i) => (
            <li key={phase.phase}>
              • {t(PHASE_TITLE_KEYS[i] ?? "road.phase1")} —{" "}
              {localizeNumber(phase.items.filter((it) => done.has(it.id)).length, lang)} /{" "}
              {localizeNumber(phase.items.length, lang)} {t("status.completed")}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--navigator-teal)]">
        <Info className="size-4" aria-hidden />
        {t("report.disclaimer")}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("disclaimer.responsible")}
      </p>
    </section>
  );

  return (
    <div className="min-h-screen">
      <AppHeader registered />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl">{t("journey.title")}</h1>
            <p className="mt-2 text-xs text-muted-foreground">{t("dash.recalc")}</p>
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
            <section className="glass-card rounded-3xl p-6">
              <h2 className="text-lg">{t("journey.title")}</h2>
              <ol className="mt-4 flex flex-wrap items-stretch gap-3">
                {journeySteps.map((s, i) => (
                  <li
                    key={s.label}
                    className="flex min-w-[140px] flex-1 items-center gap-3 rounded-2xl border p-3 text-[var(--journey-pill-foreground)]"
                    style={{
                      borderColor: s.color,
                      background:
                        i === journeySteps.length - 1 && !s.reached
                          ? `color-mix(in oklab, ${s.color} 58%, var(--card))`
                          : s.color,
                    }}
                  >
                    <s.icon
                      className="size-4 shrink-0"
                      aria-hidden
                    />
                    <span className="text-sm font-semibold">{s.label}</span>
                    {i < journeySteps.length - 1 ? (
                      <ArrowRight className="ms-auto size-3.5 opacity-75 rtl:rotate-180" aria-hidden />
                    ) : null}
                  </li>
                ))}
              </ol>

              <div className="mt-6 grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center">
                <div
                  className="rounded-2xl border border-[color-mix(in_oklab,var(--navigator-navy)_12%,transparent)] bg-[var(--readiness-cream)] p-5 text-center"
                  style={{
                    boxShadow:
                      "4px 4px 10px color-mix(in oklab, var(--navigator-navy) 16%, transparent), -3px -3px 8px color-mix(in oklab, var(--readiness-highlight) 80%, transparent)",
                  }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("readiness.title")}
                  </p>
                  <p className="mt-2 text-4xl font-bold tabular-nums">
                    {localizeNumber(profile.overall, lang)}%
                  </p>
                  <p className="mt-1 text-sm font-semibold text-secondary">{readinessLabel}</p>
                </div>
                <div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t("readiness.note")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {!state.completed ? (
                      <Link
                        to="/assessment"
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground"
                      >
                        {t("journey.ctaAssessment")}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTab("roadmap")}
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground"
                      >
                        {t("journey.ctaRoadmap")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setTab("progress")}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold"
                    >
                      <FileText className="size-4" aria-hidden />
                      {t("report.open")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("engine.title")}</h2>
                <ol className="mt-4 space-y-2 text-sm">
                  {roadmapBuildSteps.map((step) => (
                      <li key={step.key} className="flex items-center gap-3">
                        <span
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full"
                          style={{
                            color: step.color,
                            background: `color-mix(in oklab, ${step.color} 12%, var(--card))`,
                          }}
                        >
                          <step.icon className="size-4" strokeWidth={1.8} aria-hidden />
                        </span>
                        <span className="font-semibold">{t(step.key)}</span>
                      </li>
                    ))}
                </ol>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("engine.note")}</p>
              </section>

              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("ai.title")}</h2>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--navigator-teal)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--navigator-teal)]">
                  <Sparkles className="size-3.5 text-[var(--navigator-teal)]" aria-hidden />
                  {t("ai.label")}
                </p>
                <p className="mt-4 rounded-2xl bg-[var(--navigator-teal)]/8 p-4 text-sm leading-relaxed text-muted-foreground">{t("ai.body")}</p>
                <p className="mt-6 rounded-2xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
                  {t("disclaimer.responsible")}
                </p>
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
                {localizeNumber(answeredCount, lang)} {t("assess.answeredOf")}{" "}
                {localizeNumber(QUESTIONS.length, lang)}
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
                  style={{ width: `${Math.round((answeredCount / QUESTIONS.length) * 100)}%` }}
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
              <div className="mt-5">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                >
                  {state.completed ? t("dash.editAnswers") : t("assess.open")}
                </Link>
              </div>
            </section>
          </div>
        ) : null}

        {/* ── My Profile tab ──────────────────────────── */}
        {tab === "profile" ? (
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

              <p className="mt-1 text-xs text-muted-foreground">{t("dash.compositionNote")}</p>

              <div className="mt-4 grid gap-6 sm:grid-cols-2 sm:items-center">
                {/* Composition — donut */}
                <div className={cn("relative h-[240px]", locked && "blur-md")} aria-hidden={locked}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        innerRadius={62}
                        outerRadius={95}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {donutData.map((_, i) => (
                          <Cell key={i} fill={DIM_COLORS[i % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tabular-nums">
                      {localizeNumber(profile.overall, lang)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      / {localizeNumber(100, lang)}
                    </span>
                  </div>
                </div>

                {/* Balance — radar, directly beside the donut */}
                <div>
                  <h3 className="text-sm font-bold">{t("dash.balance")}</h3>
                  <div className={cn("mt-1 h-[210px]", locked && "blur-md")}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={dims.map((d) => ({ name: d.label, value: locked ? 60 : d.value }))}
                        outerRadius="70%"
                      >
                        <defs>
                          <linearGradient id="dimGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={DIM_COLORS[0]} stopOpacity={0.55} />
                            <stop offset="50%" stopColor={DIM_COLORS[1]} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={DIM_COLORS[2]} stopOpacity={0.55} />
                          </linearGradient>
                        </defs>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          dataKey="value"
                          stroke="var(--navigator-teal)"
                          strokeWidth={2}
                          fill="url(#dimGradient)"
                          fillOpacity={1}
                          isAnimationActive
                          animationDuration={900}
                          dot={(props: { cx?: number; cy?: number; index?: number }) => (
                            <circle
                              key={props.index}
                              cx={props.cx}
                              cy={props.cy}
                              r={4}
                              fill={DIM_COLORS[(props.index ?? 0) % 3]}
                              stroke="var(--background)"
                              strokeWidth={1.5}
                            />
                          )}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{t("dash.balanceNote")}</p>
                </div>
              </div>

              <ul className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                {dims.map((d) => (
                  <li key={d.key}>
                    <div className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.label}
                      </span>
                      <span className={cn("tabular-nums", locked && "select-none blur-[6px]")}>
                        {localizeNumber(d.value, lang)}%
                      </span>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dash.weight")} {localizeNumber(d.weight, lang)}
                    </span>
                    {d.key === "dim3" ? (
                      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                        {t("dash.dim3Note")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            {/* Analysis + paywall */}
            <div className="space-y-5">
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("dash.analysis")}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {analysisSummary(profile)[lang]}
                </p>
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
                {profile.weaknesses.length ? (
                  <>
                    <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                      {t("dash.gaps")}
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {profile.weaknesses.slice(0, 3).map((s) => (
                        <li key={s.en}>• {s[lang]}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>

              <CsatWidget />


              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg">{t("dash.bonus")}</h2>
                <p className="mt-2 text-4xl font-bold text-[var(--navigator-teal)] tabular-nums">
                  {bonusAnswered
                    ? `${localizeNumber(profile.bonus, lang)}%`
                    : t("dash.bonusNotAnswered")}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{t("dash.bonusNote")}</p>
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
              {gapList.length ? (
                <ul className="mt-4 grid gap-4 md:grid-cols-2">
                  {gapList.map((g) => {
                    const phase = phaseForGap(g.flag);
                    return (
                    <PhaseCard key={g.flag} phase={phase} hoverTint>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5",
                            g.priority === "high"
                              ? "bg-destructive/12 text-destructive"
                              : g.priority === "medium"
                                ? "bg-[var(--navigator-olive)]/20 text-[var(--navigator-navy)]"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {t("gap.priority")}: {priorityLabel(g.priority)}
                        </span>
                        <InstitutionBadge institution={g.institution} />
                      </div>
                      <h3 className="mt-3 text-sm font-bold">{g.gap[lang]}</h3>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("gap.why")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.why[lang]}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("gap.action")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.action[lang]}</p>
                    </PhaseCard>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t("gap.none")}</p>
              )}
            </section>

            {/* Relevant pathways */}
            <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
              <h2 className="text-lg">
                {profile.gaps.includes("pathway_unconfirmed") ? t("path.titleExplore") : t("path.title")}
              </h2>
              {profile.gaps.includes("pathway_unconfirmed") ? (
                <p className="mt-2 text-xs text-muted-foreground">{t("path.exploreNote")}</p>
              ) : null}
              <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pathways.map((p) => {
                  return (
                  <PhaseCard key={p.institution} timing={p.timing}>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5",
                          p.priority === "high"
                            ? "bg-destructive/12 text-destructive"
                            : p.priority === "medium"
                              ? "bg-[var(--navigator-olive)]/20 text-[var(--navigator-navy)]"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {t("gap.priority")}: {priorityLabel(p.priority)}
                      </span>
                      <InstitutionBadge institution={p.institution} />
                    </div>
                    <h3 className="mt-3 text-sm font-bold">{p.title[lang]}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("path.relevance")}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.relevance[lang]}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("path.action")}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.action[lang]}</p>
                    <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
                      {t("path.timing")}: {t("path.weeks")} {localizeNumber(p.timing.from, lang)}–
                      {localizeNumber(p.timing.to, lang)}
                    </p>
                  </PhaseCard>
                  );
                })}
              </ul>
              <p className="mt-4 inline-flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {t("path.disclaimer")}
              </p>
            </section>

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

        {/* ── My Roadmap tab ──────────────────────────── */}
        {tab === "roadmap" ? (
          <div className="navigator-entered rise-in mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl">{t("road.title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("road.sub")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!locked ? (
                  <span className="rounded-full bg-secondary/12 px-3 py-1 text-[11px] font-semibold text-secondary">
                    {localizeNumber(doneCount, lang)} / {localizeNumber(totalTasks, lang)}{" "}
                    {t("road.progress")}
                  </span>
                ) : null}
                <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  {t("road.knowledgeVersion")}
                </span>
              </div>
            </div>
            {!locked && !user ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
                <LogIn className="size-3.5" aria-hidden />
                {t("road.signInToSave")}
                <Link to="/auth" className="font-semibold text-secondary underline underline-offset-4">
                  {t("nav.signIn")}
                </Link>
              </p>
            ) : null}


            {locked ? (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
                <Lock className="mx-auto size-6 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-sm font-semibold">{t("road.locked")}</p>
                <button
                  type="button"
                  onClick={openPaywall}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground"
                >
                  {t("pay.unlock")}
                </button>
              </div>
            ) : (
              <>
                <section className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
                  <div className="rounded-2xl bg-[var(--navigator-navy)] px-4 pb-5 pt-4">
                    <h3 className="text-center text-xs font-semibold text-[var(--navigator-cream)]">{t("road.composition")}</h3>
                    <div className="mt-5 grid h-44 grid-cols-4 gap-2 sm:gap-3">
                      {ROADMAP_PHASES.map((phase, index) => {
                        const PhaseIcon = phase.icon;
                        return (
                          <div key={phase.label} className="grid min-w-0 grid-rows-[1fr_auto] gap-2">
                            <div className="flex min-h-0 flex-col items-center justify-end">
                              <PhaseIcon className={`mb-2 size-4 shrink-0 ${phase.color.split(" ")[1]}`} aria-hidden />
                              <div
                                className={`roadmap-bar w-full rounded-t-lg ${phase.height} ${phase.color.split(" ")[0]}`}
                                style={{ animationDelay: `${(lang === "fa" ? ROADMAP_PHASES.length - 1 - index : index) * 100}ms` }}
                                aria-hidden
                              />
                            </div>
                            <span className={`text-center text-[9px] leading-tight text-[var(--navigator-cream)] sm:text-[10px] ${index === 3 ? "font-bold" : "font-medium opacity-80"}`}>
                              {t(phase.label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {roadmap.map((phase, i) => (
                      <article
                        key={phase.phase}
                        className="rounded-3xl border p-6"
                        style={{
                          borderColor: `color-mix(in oklab, ${ROADMAP_PHASES[i]?.value ?? "var(--navigator-light-teal)"} 35%, transparent)`,
                          background: `color-mix(in oklab, ${ROADMAP_PHASES[i]?.value ?? "var(--navigator-light-teal)"} 7%, var(--card))`,
                        }}
                      >
                        <header className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-bold">
                            {t(PHASE_TITLE_KEYS[i] ?? "road.phase1")}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {localizeNumber(phase.items.length, lang)} {t("road.steps")}
                          </span>
                        </header>
                        <ol className="mt-4 space-y-3">
                          {phase.items.map((item) => {
                            const status = statusOf(item.id);
                            const checked = status === "completed";
                            return (
                              <li
                                key={item.id}
                                className={cn(
                                  "rounded-2xl border border-border/70 p-4 transition-opacity duration-200 ease-out",
                                  checked && "opacity-70",
                                )}
                                style={{
                                  borderLeftColor: i === 3 ? "var(--navigator-olive)" : ROADMAP_PHASES[i]?.value ?? "var(--navigator-light-teal)",
                                  borderLeftWidth: "4px",
                                  background: `color-mix(in oklab, ${i === 3 ? "var(--navigator-olive)" : ROADMAP_PHASES[i]?.value ?? "var(--navigator-light-teal)"} 7%, var(--card))`,
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <label className="relative mt-0.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        setStatus(item.id, checked ? "notStarted" : "completed")
                                      }
                                      aria-label={`${t("road.done")}: ${item.title[lang]}`}
                                      className="peer size-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-colors duration-200 ease-out checked:border-[var(--navigator-teal)] checked:bg-[var(--navigator-teal)]"
                                    />
                                    {checked ? (
                                      <Check
                                        className="check-pop pointer-events-none absolute size-3.5 text-secondary-foreground"
                                        aria-hidden
                                      />
                                    ) : null}
                                  </label>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                                      <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-primary">
                                        {t("road.timing")}: {t("road.week")}{" "}
                                        {localizeNumber(item.week, lang)}
                                      </span>
                                      <span
                                        className={cn(
                                          "rounded-full px-2.5 py-0.5",
                                          item.priority === "high"
                                            ? "bg-destructive/12 text-destructive"
                                            : item.priority === "medium"
                                              ? "bg-[var(--navigator-olive)] text-[var(--navigator-navy)]"
                                              : "bg-muted text-muted-foreground",
                                        )}
                                      >
                                        {t("road.priority")}: {priorityLabel(item.priority)}
                                      </span>
                                    </div>
                                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t("road.action")}
                                    </p>
                                    <h4
                                      className={cn(
                                        "mt-1 text-sm font-bold leading-snug",
                                        checked && "line-through",
                                      )}
                                    >
                                      {item.title[lang]}
                                    </h4>
                                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t("road.whyMatters")}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                      {item.detail[lang]}
                                    </p>

                                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t("road.relevantAuthority")}
                                    </p>
                                    <div className="mt-1">
                                      <InstitutionBadge
                                        institution={item.institution}
                                        href={item.officialSource}
                                        displayName={item.institution}
                                      />
                                    </div>

                                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t("road.dependency")}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                      {item.dependency[lang]}
                                    </p>

                                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t("road.completionCondition")}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                      {item.completionCondition[lang]}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        {t("road.status")}
                                      </span>
                                      {(
                                        [
                                          ["notStarted", t("status.notStarted")],
                                          ["inProgress", t("status.inProgress")],
                                          ["completed", t("status.completed")],
                                        ] as const
                                      ).map(([value, label]) => (
                                        <button
                                          key={value}
                                          type="button"
                                          aria-pressed={status === value}
                                          onClick={() => setStatus(item.id, value)}
                                          className={cn(
                                            "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors duration-200 ease-out",
                                            status === value
                                              ? value === "inProgress"
                                                 ? "bg-[var(--navigator-olive)] text-[var(--navigator-navy)]"
                                                : value === "completed"
                                                  ? "bg-[var(--navigator-teal)] text-primary-foreground"
                                                  : "bg-primary text-primary-foreground"
                                              : "border border-border bg-card text-muted-foreground hover:text-foreground",
                                          )}
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setOpenWhy(openWhy === item.id ? null : item.id)}
                                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary underline underline-offset-4"
                                    >
                                      <Info className="size-3.5" aria-hidden />
                                      {t("road.why")}
                                    </button>
                                    {openWhy === item.id ? (
                                      <p className="mt-2 rounded-2xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                                        {whyRecommended(item, profile)[lang]}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </li>
                            );
                          })}

                        </ol>
                      </article>
                    ))}
                  </div>
                </section>

                <NpsSurvey />
              </>

            )}
          </div>
        ) : null}

        {/* ── Progress tab ────────────────────────────── */}
        {tab === "progress" ? (
          <div className="navigator-entered rise-in mt-7 space-y-5">
            {locked ? (
              <section className="rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
                <Lock className="mx-auto size-6 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-sm font-semibold">{t("prog.locked")}</p>
              </section>
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
                        return (
                        <li
                          key={w.week}
                          className={cn(
                            "rounded-2xl border p-3 text-center",
                            "text-[var(--navigator-navy)]",
                          )}
                          style={{
                            borderColor: `color-mix(in oklab, ${phaseColor} 55%, var(--border))`,
                            background: `color-mix(in oklab, ${phaseColor} ${fillStrength}%, var(--card))`,
                          }}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--navigator-navy)]">
                            {t("road.week")} {localizeNumber(w.week, lang)}
                          </p>
                          <p className="mt-1 text-sm font-bold tabular-nums">
                            {localizeNumber(w.completed, lang)}/{localizeNumber(w.total, lang)}
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
                          .map((i) => (
                            <li key={i.id} className="flex items-start gap-2">
                              <Check className="mt-0.5 size-4 shrink-0 text-[var(--navigator-teal)]" aria-hidden />
                              {i.title[lang]}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">{t("prog.none")}</p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-border border-s-4 border-s-destructive bg-[var(--readiness-cream)] p-6 text-[var(--navigator-navy)]">
                    <h2 className="text-lg text-[var(--navigator-navy)]">{t("prog.remaining")}</h2>
                    {remainingPriorities.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-[var(--navigator-navy)]">
                        {remainingPriorities.map((i) => (
                          <li key={i.id} className="flex items-start gap-2">
                              <Target className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                            <span>
                              {i.title[lang]} · {t("road.week")} {localizeNumber(i.week, lang)}
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

            <ReportSection />
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
                  {t("set.notSignedIn")}{" "}
                  <Link to="/auth" className="font-semibold text-secondary underline underline-offset-4">
                    {t("nav.signIn")}
                  </Link>
                </p>
              )}
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/12 px-3 py-1.5 text-[11px] font-semibold text-secondary">
                <ShieldCheck className="size-3.5" aria-hidden />
                {t("set.gdpr")}
              </p>
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

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg">{t("dash.langSection")}</h2>

              <div className="mt-4">
                <LanguageSwitch />
              </div>
            </section>
            <section className="rounded-3xl border border-destructive/30 bg-card p-6">
              <h2 className="text-lg">{t("dash.deleteData")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("consent.privacyBody")}</p>
              {deleted ? (
                <p className="mt-4 text-sm font-semibold text-secondary">{t("dash.deleteDone")}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setDeleted(true);
                    window.setTimeout(() => void navigate({ to: "/" }), 900);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground"
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("dash.deleteData")}
                </button>
              )}
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
