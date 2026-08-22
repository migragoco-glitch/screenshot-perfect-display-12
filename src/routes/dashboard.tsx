import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
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
import { Check, FileText, HelpCircle, Lock, LogIn, Mail, Pencil, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
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
import { analysisSummary, computeProfile } from "@/lib/scoring";
import { KNOWLEDGE_TABLE_VERSION, PHASE_TITLE_KEYS, generateRoadmap } from "@/lib/roadmap";
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
          "Your Legal Status, Economic & Professional Capacity and Soft Skills & Psychological Readiness scores plus your evidence-based 12-week Finland roadmap.",
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

const DIM_COLORS = ["var(--navy)", "var(--teal)", "var(--gold)"];

/** Phase tints — one brand colour per roadmap phase. */
const PHASE_COLORS = ["var(--navy)", "var(--teal)", "var(--gold)", "var(--plum)"];

type Tab = "profile" | "roadmap" | "settings";

function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { state, hydrated, pushSnapshot, reset } = useAppState();
  const [tab, setTab] = useState<Tab>("profile");
  const [buildingRoadmap, setBuildingRoadmap] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      setDone(new Set());
      return;
    }
    void fetchRoadmapProgress().then(setDone);
  }, [user]);

  // Returning from the Founder's Circle email capture + consent step.
  useEffect(() => {
    if (!hydrated) return;
    if (window.localStorage.getItem("migrago.justUpgraded") !== "1") return;
    window.localStorage.removeItem("migrago.justUpgraded");
    setTab("roadmap");
    setBuildingRoadmap(true);
    const id = window.setTimeout(() => setBuildingRoadmap(false), 2600);
    return () => window.clearTimeout(id);
  }, [hydrated]);


  const profile = useMemo(() => computeProfile(state.answers), [state.answers]);
  const roadmap = useMemo(() => generateRoadmap(profile), [profile]);
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
    return <PenguinLoader title={t("loading.roadmap")} subtitle={t("loading.roadmapSub")} />;
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
  const phaseComposition = roadmap.map((p, i) => ({
    name: t(PHASE_TITLE_KEYS[i] ?? "road.phase1"),
    value: 25,
  }));

  const openPaywall = () => {
    trackEvent({ type: "upgrade_click" });
    setPayModal(true);
  };

  // Email captured (or skipped) → the existing Consent screen → unlocked roadmap.
  const afterEmailCapture = () => {
    setPayModal(false);
    void navigate({ to: "/consent", search: { upgrade: true } });
  };

  const totalTasks = roadmap.reduce((n, p) => n + p.items.length, 0);
  const doneCount = roadmap.reduce(
    (n, p) => n + p.items.filter((i) => done.has(i.id)).length,
    0,
  );

  const toggleTask = (id: string) => {
    const next = new Set(done);
    const willBeDone = !next.has(id);
    if (willBeDone) next.add(id);
    else next.delete(id);
    setDone(next);
    if (user) void setRoadmapTask(user.id, id, willBeDone);
  };


  return (
    <div className="min-h-screen">
      <AppHeader registered />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl">{t("dash.title")}</h1>
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
          {(
            [
              ["profile", t("dash.profileTab")],
              ["roadmap", t("dash.roadmapTab")],
              ["settings", t("dash.settingsTab")],
            ] as const
          ).map(([key, label]) => (
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

        {/* ── Profile tab ─────────────────────────────── */}
        {tab === "profile" ? (
          <div className="rise-in mt-7 grid gap-5 lg:grid-cols-3">
            {/* Overall + donut */}
            <section className="glass-card rounded-3xl p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg">{t("dash.composition")}</h2>
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
                            <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.55} />
                            <stop offset="50%" stopColor="var(--teal)" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.55} />
                          </linearGradient>
                        </defs>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          dataKey="value"
                          stroke="var(--teal)"
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
                <p className="mt-2 text-4xl font-bold text-secondary tabular-nums">
                  {localizeNumber(profile.bonus, lang)}%
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

                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition-opacity duration-200 ease-out hover:opacity-90"
                  >
                    <Sparkles className="size-4" aria-hidden />
                    {t("pay.unlock")}
                  </button>
                  <p className="mt-3 text-center text-[11px] opacity-70">{t("pay.demoNote")}</p>
                </section>
              ) : null}
            </div>

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

        {/* ── Roadmap tab ─────────────────────────────── */}
        {tab === "roadmap" ? (
          <div className="rise-in mt-7">
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
                  knowledge table {KNOWLEDGE_TABLE_VERSION}
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
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <h3 className="text-sm font-bold">{t("road.composition")}</h3>
                    <div className="mt-2 h-[170px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={phaseComposition}
                            dataKey="value"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {phaseComposition.map((_, i) => (
                              <Cell
                                key={i}
                                fill={[DIM_COLORS[0], DIM_COLORS[1], DIM_COLORS[2], "var(--plum)"][i]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                      {phaseComposition.map((p, i) => (
                        <li key={p.name} className="flex items-center gap-2">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: [DIM_COLORS[0], DIM_COLORS[1], DIM_COLORS[2], "var(--plum)"][i],
                            }}
                          />
                          {p.name} · {localizeNumber(25, lang)}%
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-5">
                    {roadmap.map((phase, i) => (
                      <article
                        key={phase.phase}
                        className="rounded-3xl border p-6"
                        style={{
                          borderColor: `color-mix(in oklab, ${PHASE_COLORS[i] ?? "var(--navy)"} 35%, transparent)`,
                          background: `color-mix(in oklab, ${PHASE_COLORS[i] ?? "var(--navy)"} 7%, var(--card))`,
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
                            const checked = done.has(item.id);
                            return (
                              <li
                                key={item.id}
                                className={cn(
                                  "rounded-2xl border border-border/70 bg-background p-4 transition-opacity duration-200 ease-out",
                                  checked && "opacity-70",
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <label className="relative mt-0.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleTask(item.id)}
                                      aria-label={`${t("road.done")}: ${item.title[lang]}`}
                                      className="peer size-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-colors duration-200 ease-out checked:border-secondary checked:bg-secondary"
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
                                        {t("road.week")} {localizeNumber(item.week, lang)}
                                      </span>
                                      <span
                                        className={cn(
                                          "rounded-full px-2.5 py-0.5",
                                          item.priority === "high"
                                            ? "bg-destructive/12 text-destructive"
                                            : item.priority === "medium"
                                              ? "bg-accent/25 text-accent-foreground"
                                              : "bg-muted text-muted-foreground",
                                        )}
                                      >
                                        {t("road.priority")}:{" "}
                                        {item.priority === "high"
                                          ? t("road.high")
                                          : item.priority === "medium"
                                            ? t("road.medium")
                                            : t("road.normal")}
                                      </span>
                                      <InstitutionBadge institution={item.institution} />
                                    </div>
                                    <h4
                                      className={cn(
                                        "mt-3 text-sm font-bold leading-snug",
                                        checked && "line-through",
                                      )}
                                    >
                                      {item.title[lang]}
                                    </h4>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                      {item.detail[lang]}
                                    </p>
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

        {/* ── Settings tab ────────────────────────────── */}
        {tab === "settings" ? (
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
