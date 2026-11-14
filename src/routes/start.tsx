import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, ListChecks, MapPin, Route as RouteIcon, Building2, Check, ExternalLink, Globe, HeartPulse, House, IdCard, Info, Landmark, Languages, Lock, Users } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { FoundersCircleModal, InstitutionBadge } from "@/components/FeedbackWidgets";
import { ProfilePreview, RoadmapSummary } from "@/components/RoadmapSummary";
import { QuestionField } from "@/components/QuestionField";
import { Button } from "@/components/ui/button";
import { AREAS, MUNICIPALITIES, STEP_AREA, documentsForSteps, weeksRange, buildAreaSteps, suggestRoute, formatCheckedDate, earlyChildhoodLocalUrl, type AreaId, type AreaStep } from "@/lib/area-flow";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { QUESTIONS, isAnswered, isQuestionApplicable } from "@/lib/questions";
import { hasNavigatorAccess, trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Institution } from "@/lib/roadmap";
import { computeProfile } from "@/lib/scoring";
import { getProfileSteps, getStepWeek, isPriorityStep } from "@/lib/profile-link";

export const Route = createFileRoute("/start")({
  head: () => ({ meta: [
    { title: "First steps in Finland — MigraGo" },
    { name: "description", content: "Find your first steps for identity registration, family services, Kela and healthcare in Finland." },
    { property: "og:title", content: "First steps in Finland — MigraGo" },
    { property: "og:description", content: "Choose your municipality and priorities for practical first steps linked to official Finnish sources." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: StartScreen,
});

type Stage = "city" | "areas" | "questions" | "choose" | "info" | "road";
const SESSION_KEY = "migrago.start.v1";
function saveSession(areas: AreaId[], stage: Stage) {
  try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ areas, stage })); } catch { /* Storage may be unavailable. */ }
}
function readIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch { return []; }
}
function saveIds(key: string, ids: string[]) {
  try { window.localStorage.setItem(key, JSON.stringify(ids)); } catch { /* Storage may be unavailable. */ }
}
const ICONS = { status: Globe, id: IdCard, bank: Landmark, kela: HeartPulse, housing: House, family: Users, work: Briefcase, language: Languages, comm: Building2 };

const PHASE_COLORS = ["var(--navigator-light-teal)", "var(--navigator-teal)", "var(--navigator-olive)", "var(--navigator-gold)"];
const PRIMARY_BTN = "inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90 disabled:opacity-50";
const GHOST_BTN = "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground";
const LABEL = "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground";
const AREA_COLORS: Record<AreaId, string> = {
  status: "var(--navigator-light-teal)", id: "var(--navigator-light-teal)", bank: "var(--navigator-light-teal)",
  kela: "var(--navigator-teal)", housing: "var(--navigator-teal)", work: "var(--navigator-gold)",
  family: "var(--navigator-olive)", language: "var(--navigator-olive)", comm: "var(--navigator-gold)",
};
const QUICK_CITIES = [
  { city: "Helsinki", color: "var(--navigator-light-teal)" },
  { city: "Espoo", color: "var(--navigator-teal)" },
  { city: "Vantaa", color: "var(--navigator-olive)" },
  { city: "Tampere", color: "var(--navigator-gold)" },
] as const;
const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--card))`;
function StepTracker({ stage, questionFill }: { stage: Stage; questionFill: number | null }) {
  const { t } = useI18n();
  const order = ["city", "areas", "questions", "result"] as const;
  const current = stage === "choose" || stage === "info" || stage === "road" ? 3 : order.indexOf(stage as "city");
  const segs = [
    { key: "start.step.city", color: PHASE_COLORS[0]! },
    { key: "start.step.cards", color: PHASE_COLORS[1]! },
    { key: "start.step.questions", color: PHASE_COLORS[2]! },
    { key: "start.step.result", color: PHASE_COLORS[3]! },
  ] as const;
  return <ol className="mb-6 grid grid-cols-4 gap-2">
    {segs.map((seg, index) => {
      const done = index < current;
      const active = index === current;
      const fill = done ? 100 : active ? (index === 2 && questionFill !== null ? questionFill : 100) : 0;
      return <li key={seg.key} aria-current={active ? "step" : undefined} className="min-w-0">
        <div className={cn("h-2 overflow-hidden rounded-full border", fill ? "border-transparent" : "border-border/60 bg-muted/50")} style={fill ? { background: tint(seg.color, 25), boxShadow: active ? `0 0 0 4px color-mix(in srgb, ${seg.color} 25%, transparent)` : undefined } : undefined}>
          <div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${fill}%`, background: seg.color }} />
        </div>
        <p className={cn("mt-2 flex items-center gap-1 truncate text-[11px]", done ? "font-semibold text-foreground" : active ? "font-bold text-foreground" : "text-muted-foreground/60")}>
          {done ? <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ background: seg.color }}><Check className="size-2.5 text-white" strokeWidth={3} aria-hidden /></span> : null}
          {t(seg.key)}
        </p>
      </li>;
    })}
  </ol>;
}
function MiniRing({ value, total, color, size = 40 }: { value: number; total: number; color: string; size?: number }) {
  const stroke = 4; const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return <svg width={size} height={size} aria-hidden="true" className="shrink-0">
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - c * pct} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 300ms ease-out" }} />
  </svg>;
}
function stepCardStyle(phase: number) {
  const color = PHASE_COLORS[phase - 1] ?? "var(--navigator-light-teal)";
  return { borderLeftColor: color, borderLeftWidth: "4px", background: `color-mix(in oklab, ${color} 7%, var(--card))` };
}

function StartScreen() {
  const { lang, dir, t } = useI18n();
  const { state, hydrated, update, setAnswer, reset } = useAppState();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("city");
  const [areas, setAreas] = useState<AreaId[]>([]);
  const [areaError, setAreaError] = useState(false);
  const [restored, setRestored] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [docIds, setDocIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [firstExpanded, setFirstExpanded] = useState(false);
  const [profileWhyIds, setProfileWhyIds] = useState<string[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  useEffect(() => {
    try { if (window.sessionStorage.getItem("migrago.start.activated") === "1") { window.sessionStorage.removeItem("migrago.start.activated"); setActivated(true); } } catch { /* Storage may be unavailable. */ }
  }, []);
  useEffect(() => {
    if (!hydrated || !state.consent || restored) return;
    try {
      const saved: unknown = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "null");
      if (state.municipality && saved && typeof saved === "object" && "stage" in saved && "areas" in saved &&
          typeof saved.stage === "string" && ["areas", "questions", "choose", "info", "road"].includes(saved.stage) && Array.isArray(saved.areas)) {
        setStage(saved.stage as Stage);
        setAreas(saved.areas.filter((id): id is AreaId => AREAS.some((area) => area.id === id)));
      } else setStage("city");
    } catch { setStage("city"); }
    setDoneIds(readIds("migrago.start.done"));
    setDocIds(readIds("migrago.start.docs"));
    setRestored(true);
  }, [hydrated, state.consent, state.municipality, restored]);
  useEffect(() => {
    if (restored && hydrated && state.consent) saveSession(areas, stage);
  }, [areas, stage, restored, hydrated, state.consent]);
  useEffect(() => {
    if (hydrated && !state.consent) void navigate({ to: "/consent", search: { next: "start" } });
  }, [hydrated, state.consent, navigate]);

  const selectedAreas = AREAS.filter((area) => areas.includes(area.id));
  const asked = new Set(selectedAreas.flatMap((area) => area.questions));
  const effectiveRoute = state.route ?? suggestRoute(state.answers[2]?.value);
  const steps = buildAreaSteps(areas, state.answers, effectiveRoute, state.region);
  const hasNavigator = hasNavigatorAccess(state.tier);
  const isProfileDriven = hasNavigator && Boolean(state.completed);
  const userGaps = isProfileDriven ? computeProfile(state.answers, state.founderTrack === true, state.region ?? "undecided").gaps : [];
  const profileSteps = isProfileDriven ? getProfileSteps(userGaps) : [];
  const allPlanSteps = [...steps, ...profileSteps];
  useEffect(() => {
    const first = allPlanSteps[0];
    if (restored && hasNavigator && stage === "road" && first && !firstExpanded) {
      setExpandedIds([first.id]);
      setFirstExpanded(true);
    }
  }, [restored, hasNavigator, stage, allPlanSteps, firstExpanded]);
  const filteredSteps = steps.filter((step) => areas.includes(STEP_AREA[step.id] as AreaId));
  const checklist = documentsForSteps(filteredSteps);
  const docKeys = checklist.flatMap((item) => item.documents.map((_, index) => `${item.id}:${index}`));
  const docsDone = docKeys.filter((id) => docIds.includes(id)).length;
  const planDone = allPlanSteps.filter((step) => doneIds.includes(step.id)).length;
  const toggleDone = (id: string) => {
    const next = doneIds.includes(id) ? doneIds.filter((value) => value !== id) : [...doneIds, id];
    setDoneIds(next); saveIds("migrago.start.done", next);
  };
  const toggleDoc = (id: string) => {
    const next = docIds.includes(id) ? docIds.filter((value) => value !== id) : [...docIds, id];
    setDocIds(next); saveIds("migrago.start.docs", next);
  };
  const openUpgrade = () => {
    trackEvent({ type: "upgrade_click" }); saveSession(areas, stage); setPaywallOpen(true);
  };
  const localUrl = earlyChildhoodLocalUrl(state.municipality);
  const seenQuestions = new Set<number>();
  const areaQuestions = new Map<AreaId, number[]>();
  for (const area of selectedAreas) {
    const ids: number[] = [];
    for (const id of area.questions) {
      if (seenQuestions.has(id)) continue;
      seenQuestions.add(id);
      const question = QUESTIONS.find((item) => item.id === id);
      if (question && isQuestionApplicable(question, state.answers, { founderTrack: state.founderTrack ?? null })) ids.push(id);
    }
    areaQuestions.set(area.id, ids);
  }
  const isQuestionDone = (id: number): boolean => {
    if (id === 2) return Boolean(effectiveRoute);
    const q = QUESTIONS.find((item) => item.id === id);
    return q ? isAnswered(q, state.answers[id]) : false;
  };
  const questionCards = selectedAreas.filter((area) => (areaQuestions.get(area.id) ?? []).length > 0).map((area) => {
    const ids = areaQuestions.get(area.id) ?? [];
    const done = ids.filter(isQuestionDone).length;
    return { area, total: ids.length, done };
  });
  const questionsTotal = questionCards.reduce((sum, card) => sum + card.total, 0);
  const questionsDone = questionCards.reduce((sum, card) => sum + card.done, 0);
  const hasUnansweredQuestions = questionsDone < questionsTotal;
  const questionFill = questionsTotal ? Math.round((questionsDone / questionsTotal) * 100) : null;

  useEffect(() => {
    if (!restored) return;
    if (["choose", "info", "road"].includes(stage) && hasUnansweredQuestions) {
      setStage("questions");
    }
  }, [restored, stage, hasUnansweredQuestions]);

  if (!hydrated || !state.consent || !restored) return null;

  return (
    <div dir={dir} className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
        {activated ? <div role="status" className="mb-6 flex items-start justify-between gap-3 rounded-2xl bg-secondary/12 px-4 py-3 text-sm font-semibold text-foreground"><span>{t("start.activatedBanner")}</span><button type="button" aria-label={t("common.close")} onClick={() => setActivated(false)} className="text-muted-foreground">×</button></div> : null}
        <StepTracker stage={stage} questionFill={questionFill} />
        <h1 className="text-2xl md:text-3xl">{t(stage === "info" ? "start.title.info" : stage === "road" ? "start.title.road" : "start.title")}</h1>
        {stage === "city" ? (
          <section className="mt-8"><div className="rise-in rounded-3xl border-x border-b border-t-[5px] border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8" style={{ borderTopColor: "var(--navigator-light-teal)" }}>
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-[0_4px_14px_rgba(58,200,195,0.25)]" style={{ background: tint("var(--navigator-light-teal)", 15), color: "var(--navigator-teal)" }}><MapPin className="size-6" aria-hidden /></span>
              <div className="min-w-0">
                <label htmlFor="start-municipality" className="text-lg font-semibold">{t("start.city")}</label>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("how.s1.d")}</p>
              </div>
            </div>
            <select id="start-municipality" value={state.municipality ?? ""} onChange={(event) => {
              const municipality = event.target.value;
              if (municipality) update({ municipality, region: ["Helsinki", "Espoo", "Vantaa"].includes(municipality) ? "helsinki" : "elsewhere" });
            }} className="mt-5 w-full rounded-xl border-2 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--navigator-light-teal)]/30" style={{ borderColor: "var(--navigator-light-teal)" }}>
              <option value="" disabled>{t("start.chooseCity")}</option>
              {MUNICIPALITIES.map((city) => <option key={city} value={city}>{t(`start.city.${city}`)}</option>)}
            </select>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_CITIES.map(({ city, color }) => {
                const active = state.municipality === city;
                return <button type="button" key={city} aria-pressed={active} onClick={() => update({ municipality: city, region: ["Helsinki", "Espoo", "Vantaa"].includes(city) ? "helsinki" : "elsewhere" })}
                  className="rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ease-out hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: active ? color : `color-mix(in srgb, ${color} 40%, transparent)`, borderWidth: active ? 2 : 1, background: tint(color, active ? 20 : 12), outlineColor: color }}>
                  {t(`start.city.${city}`)}
                </button>;
              })}
            </div>
            <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "mt-6 shadow-[var(--shadow-card)]")} disabled={!state.municipality} onClick={() => setStage("areas")}>
              {t("common.continue")}<ArrowRight className="rtl:rotate-180" />
            </Button>
          </div></section>
        ) : null}
        {stage === "areas" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl">{t("start.areas")}</h2>
              <Button type="button" variant="outline" className={GHOST_BTN} onClick={() => { setAreas(AREAS.map((area) => area.id)); setAreaError(false); }}><Check />{t("start.selectAll")}</Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {AREAS.map((area) => {
                const Icon = ICONS[area.id];
                const active = areas.includes(area.id);
                const chipColor = AREA_COLORS[area.id];
                return <Button type="button" key={area.id} variant="outline" aria-pressed={active} onClick={() => {
                  setAreas((current) => active ? current.filter((id) => id !== area.id) : [...current, area.id]);
                  setAreaError(false);
                }} style={active ? { borderColor: chipColor, background: tint(chipColor, 12) } : undefined} className={cn("relative h-auto flex flex-col items-start justify-start gap-3 whitespace-normal rounded-2xl p-5 text-start text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-foreground hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary", active ? "border-2 shadow-[var(--shadow-lift)]" : "border border-border bg-card hover:bg-card")}>
                  {active ? (
                    <span aria-hidden="true" className="absolute top-3.5 end-3.5 flex size-6 items-center justify-center rounded-full text-white shadow-sm" style={{ background: chipColor }}>
                      <Check className="size-3.5 stroke-[3]" />
                    </span>
                  ) : <span aria-hidden="true" className="absolute top-3.5 end-3.5 size-6 rounded-full border-2 border-muted-foreground/30" />}
                  <span className={cn("flex size-12 items-center justify-center rounded-full", !active && "bg-muted/70 text-muted-foreground")} style={active ? { background: chipColor, color: "#fff" } : undefined}><Icon className="size-6" /></span>
                  <span className="text-sm font-bold">{t(area.title)}</span>
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">{t(area.description)}</span>
                </Button>;
              })}
            </div>
            {areaError ? <p role="alert" className="mt-3 text-sm text-destructive">{t("start.noAreas")}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className={GHOST_BTN} onClick={() => setStage("city")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
              <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "h-auto whitespace-normal")} onClick={() => {
                if (!areas.length) { setAreaError(true); return; }
                setStage("questions");
              }}>{t("start.continueAreas").replace("{n}", localizeNumber(areas.length, lang))}<ArrowRight className="rtl:rotate-180" /></Button>
            </div>
          </div></section>
        ) : null}
        {stage === "questions" ? (
          <div className="glass-card rise-in mt-8 rounded-3xl p-6 md:p-8">
            {questionCards.length ? <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold">{t("start.questions.progressTitle")}</h2>
                <span className="text-xs font-semibold text-muted-foreground">{t("start.questions.progressCards").replace("{n}", localizeNumber(questionCards.filter((card) => card.done === card.total).length, lang)).replace("{m}", localizeNumber(questionCards.length, lang))}</span>
              </div>
              <div className="mt-3 flex gap-1.5">
                {questionCards.map((card) => <div key={card.area.id} className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted/60"><div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${(card.done / card.total) * 100}%`, background: AREA_COLORS[card.area.id] }} /></div>)}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                {questionCards.map((card) => <li key={card.area.id} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: AREA_COLORS[card.area.id] }} />{t(card.area.title)}</li>)}
              </ul>
            </div> : null}
            {selectedAreas.map((area) => {
              const color = AREA_COLORS[area.id];
              const Icon = ICONS[area.id];
              const ids = areaQuestions.get(area.id) ?? [];
              const card = questionCards.find((item) => item.area.id === area.id);
              return (
              <section key={area.id} className="mt-6 overflow-hidden rounded-2xl border-[1.5px] bg-card" style={{ borderColor: `color-mix(in srgb, ${color} 40%, var(--border))` }}>
                <header className="flex items-center gap-3 px-5 py-4" style={{ background: tint(color, 10) }}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: color }}><Icon className="size-5" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg">{t(area.title)}</h2>
                    {card ? <p className="text-xs font-semibold text-muted-foreground">{t("start.questions.counter").replace("{n}", localizeNumber(card.done, lang)).replace("{m}", localizeNumber(card.total, lang))}</p> : null}
                  </div>
                  {card ? <MiniRing value={card.done} total={card.total} color={color} /> : null}
                </header>
                <div className="px-5 pb-5 pt-4">
                <p className="text-sm text-muted-foreground">{t(area.description)}</p>
                <a href={area.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary">{t("road.officialSource")}<ExternalLink className="size-4" /></a>
                <div className="mt-5 space-y-4">
                  {ids.map((id) => {
                    const question = QUESTIONS.find((item) => item.id === id);
                    if (!question) return null;
                    return <QuestionField key={id} question={question} index={id} hideNumber={true} answer={state.answers[id]} onChange={(value) => setAnswer(id, value)} levelColor={color} accentSelected={true} unanswered={!isQuestionDone(id)} />;
                  })}
                </div>
                {area.id === "status" ? <>
                  <div role="group" aria-label={t("start.route.label")} className="mt-5">
                    <p className="text-sm font-semibold">{t("start.route.label")}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {(["eu", "nordic", "noneu"] as const).map((route) => <Button type="button" key={route} variant="secondary" aria-pressed={effectiveRoute === route} onClick={() => update({ route })} className={cn(PRIMARY_BTN, "h-auto whitespace-normal text-start", effectiveRoute === route && "ring-2 ring-secondary ring-offset-2")}>{t(`start.route.${route}`)}</Button>)}
                    </div>
                    {state.route === undefined && effectiveRoute ? <p className="mt-3 text-sm text-muted-foreground">{t("start.route.suggested")}</p> : null}
                    {effectiveRoute === undefined ? <p className="mt-3 text-sm text-muted-foreground">{t("start.route.choose")}</p> : null}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{t("start.status.scope")} <a href="https://migri.fi/en/home" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-secondary">{t("road.officialSource")}<ExternalLink className="size-4" /></a></p>
                </> : null}
                </div>
              </section>
            ); })}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className={GHOST_BTN} onClick={() => setStage("areas")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
              <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "disabled:pointer-events-auto disabled:cursor-not-allowed")} disabled={hasUnansweredQuestions} aria-describedby={hasUnansweredQuestions ? "start-questions-hint" : undefined} onClick={() => setStage("choose")}>{t("start.showSteps")}<ArrowRight className="rtl:rotate-180" /></Button>
            </div>
            {hasUnansweredQuestions ? <p id="start-questions-hint" className="mt-3 text-xs text-muted-foreground leading-relaxed">{t("start.questions.requiredHint")}</p> : null}
          </div>
        ) : null}
        {stage === "choose" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <h2 className="text-xl">{t("start.choose.title")}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {([{ view: "info", color: "var(--navigator-light-teal)", Icon: ListChecks }, { view: "road", color: "var(--navigator-gold)", Icon: RouteIcon }] as const).map(({ view, color, Icon }) => (
                <button type="button" key={view} onClick={() => setStage(view)}
                  className="flex min-h-24 w-full items-center gap-4 rounded-[20px] border-[1.5px] p-5 text-start transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.12)] active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: color, background: `linear-gradient(to bottom, ${tint(color, 8)}, var(--card))`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.05), 0 6px 16px -8px rgba(0,0,0,0.1)", ["--tw-ring-color" as string]: color }}>
                  <span className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: color, boxShadow: `0 6px 16px -4px color-mix(in srgb, ${color} 55%, transparent)` }}><Icon className="size-6" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t(`start.choose.${view}.title`)}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{t(`start.choose.${view}.sub`)}</span>
                    {view === "road" && !hasNavigator ? <span className="mt-2 block text-xs font-semibold">{t("start.free.totalSteps").replace("{total}", localizeNumber(allPlanSteps.length, lang))}</span> : null}
                    {view === "road" && hasNavigator ? <span className="mt-2 block text-xs font-semibold">{t("start.progress").replace("{done}", localizeNumber(planDone, lang)).replace("{total}", localizeNumber(allPlanSteps.length, lang))}</span> : null}
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden />
                </button>
              ))}
            </div>
            <Button type="button" variant="outline" className={cn(GHOST_BTN, "mt-6")} onClick={() => setStage("questions")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
          </div></section>
        ) : null}
        {stage === "info" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <h2 className="text-xl">{t("start.info.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("start.info.areasSub").replace("{n}", localizeNumber(selectedAreas.length, lang))}</p>
            {selectedAreas.map((area, areaIndex) => {
              const areaSteps = steps.filter((step) => STEP_AREA[step.id] === area.id);
              return (
                <details key={area.id} open={areaIndex === 0} className="mt-8 border-t border-border pt-6">
                  <summary className="cursor-pointer text-lg font-semibold">{t(area.title)}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{t(area.description)}</p>
                  <a href={area.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary">{t("road.officialSource")}<ExternalLink className="size-4" /></a>
                  {areaSteps.length ? (
                    <ul className="mt-5 space-y-4">
                      {areaSteps.map((step) => <li key={step.id} data-step-id={step.id} className="rounded-lg border border-border/70 p-4" style={stepCardStyle(step.phase)}><details><summary className="cursor-pointer text-sm font-semibold"><span>{typeof step.title === "string" ? t(step.title) : step.title[lang]}</span>{hasNavigator ? <span className="ms-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--journey-pill-foreground)]" style={{ background: doneIds.includes(step.id) ? "var(--status-done)" : "var(--status-not-done)" }}>{t(doneIds.includes(step.id) ? "start.info.done" : "start.info.notDone")}</span> : null}<span className="mt-2 block"><InstitutionBadge institution={step.authority as Institution} displayName={t(`start.authority.${step.authority}`)} compact /></span></summary><StepBody step={step} localUrl={localUrl} />{hasNavigator ? <Button type="button" variant="link" className="mt-3 h-auto whitespace-normal p-0 text-secondary" onClick={() => { setStage("road"); setExpandedIds([step.id]); setFirstExpanded(true); }}>{t("start.info.goToRoad")}<ArrowRight className="rtl:rotate-180" /></Button> : null}</details></li>)}
                    </ul>
                  ) : <p className="mt-4 text-sm text-muted-foreground">{t(area.id === "status" ? effectiveRoute === "nordic" ? "start.route.nordicNote" : effectiveRoute === undefined ? "start.route.choose" : "start.noSteps" : "start.noSteps")}</p>}
                  {area.id === "status" ? <p className="mt-3 text-sm text-muted-foreground">{t("start.status.scope")}</p> : null}
                </details>
              );
            })}
            <details className="mt-8 border-t border-border pt-6">
              <summary className="cursor-pointer text-lg font-semibold">{t("start.checklist.title")}</summary>
              <p className="mt-3 text-sm font-semibold">{hasNavigator ? t("start.docs.counter").replace("{x}", localizeNumber(docsDone, lang)).replace("{y}", localizeNumber(docKeys.length, lang)) : t("start.docs.countOnly").replace("{y}", localizeNumber(docKeys.length, lang))}</p>
              {hasNavigator ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="roadmap-progress-transition h-full bg-secondary" style={{ width: `${docKeys.length ? docsDone / docKeys.length * 100 : 0}%` }} /></div> : <p className="mt-2 text-xs text-muted-foreground">{t("start.docs.freeNote")}</p>}
              {checklist.length ? checklist.map((item) => <div key={item.id} className="mt-5"><h4 className="text-sm font-semibold">{typeof item.title === "string" ? t(item.title) : item.title[lang]}</h4>{hasNavigator ? item.documents.map((key, index) => <label key={`${item.id}:${index}`} className="mt-3 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-4 accent-[var(--status-done)]" checked={docIds.includes(`${item.id}:${index}`)} onChange={() => toggleDoc(`${item.id}:${index}`)} /><span>{t(key)}</span></label>) : <ul className="mt-2 list-disc space-y-1.5 ps-6 text-sm">{item.documents.map((key, index) => <li key={`${item.id}:${index}`}>{t(key)}</li>)}</ul>}</div>) : <p className="mt-3 text-sm text-muted-foreground">{t("start.checklist.empty")}</p>}
            </details>
            {hasNavigator ? <p className="mt-6 text-xs text-muted-foreground">{t("start.soonNote")}</p> : null}
            <p className="mt-6 text-xs text-muted-foreground">{t("start.disclaimer")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("start.deviceNote")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className={GHOST_BTN} onClick={() => setStage("choose")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
              <Button type="button" variant="secondary" className={PRIMARY_BTN} onClick={() => setStage("road")}>{t("start.switchToRoad")}<ArrowRight className="rtl:rotate-180" /></Button>
            </div>
          </div></section>
        ) : null}
        {stage === "road" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-xl md:text-2xl">{t("start.results")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("start.results.sub")}</p></div>
            </div>
            <RoadmapSummary done={planDone} total={allPlanSteps.length} showLength free={!hasNavigator} />
            {steps.length ? [...new Set(steps.map((step) => step.phase))].map((phase) => {
              const phaseSteps = steps.filter((step) => step.phase === phase);
              return <Fragment key={phase}>
                <header className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-full px-4 py-2" style={{ background: phase === 3 ? "var(--phase-olive-pill)" : PHASE_COLORS[phase - 1], color: phase === 2 || phase === 3 ? "var(--journey-pill-foreground)" : "var(--navigator-navy)" }}><h3 className="text-sm font-bold">{t(`road.phase${phase}` as "road.phase1" | "road.phase2" | "road.phase3" | "road.phase4")}</h3><span className="text-xs font-semibold">{!hasNavigator ? t("start.free.totalSteps").replace("{total}", localizeNumber(phaseSteps.length, lang)) : t("start.phase.counter").replace("{done}", localizeNumber(phaseSteps.filter((step) => doneIds.includes(step.id)).length, lang)).replace("{total}", localizeNumber(phaseSteps.length, lang))}</span></header>
                <ol className="mt-5 space-y-4">
                  {phaseSteps.map((step) => {
                    const done = doneIds.includes(step.id);
                    const title = typeof step.title === "string" ? t(step.title) : step.title[lang];
                    if (hasNavigator) return <PremiumStepCard key={step.id} step={step} done={done} expanded={expandedIds.includes(step.id)} onToggleDone={() => toggleDone(step.id)} onToggleExpanded={() => setExpandedIds((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])} profilePriority={isProfileDriven && isPriorityStep(step.id, userGaps)} profileDriven={isProfileDriven && isPriorityStep(step.id, userGaps)} whyOpen={profileWhyIds.includes(step.id)} onToggleWhy={() => setProfileWhyIds((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])} />;
                    return <li key={step.id} data-step-id={step.id} className={cn("rounded-2xl border border-border/70 p-4 transition-opacity duration-200 ease-out", done && "opacity-70")} style={stepCardStyle(step.phase)}>
                      <div className="flex items-start gap-3">
                        {hasNavigator ? <label className="relative mt-0.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center">
                          <input type="checkbox" checked={done} onChange={() => toggleDone(step.id)} aria-label={`${t("road.done")}: ${title}`} className="peer size-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-colors duration-200 ease-out checked:border-[var(--status-done)] checked:bg-[var(--status-done)]" />
                          {done ? <Check className="check-pop pointer-events-none absolute size-3.5 text-[var(--journey-pill-foreground)]" aria-hidden /> : null}
                        </label> : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                            <span className="flex size-6 items-center justify-center rounded-full text-xs font-bold" style={{ background: PHASE_COLORS[step.phase - 1], color: step.phase === 2 ? "#fff" : "var(--navigator-navy)" }}>{localizeNumber(steps.indexOf(step) + 1, lang)}</span>
                            {hasNavigator ? <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-primary">{t("start.plan.weeks").replace("{from}", localizeNumber(weeksRange(step.phase)[0], lang)).replace("{to}", localizeNumber(weeksRange(step.phase)[1], lang))}</span> : null}
                            {isProfileDriven && isPriorityStep(step.id, userGaps) ? <span className="rounded-full bg-[var(--navigator-teal)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--journey-pill-foreground)]">{t("start.priorityBadge")}</span> : null}
                          </div>
                          <StepBody step={step} localUrl={localUrl} showDetails={false} done={done} />
                          {hasNavigator ? <>
                            <Button type="button" variant="link" aria-expanded={expandedIds.includes(step.id)} aria-controls={`details-${step.id}`} onClick={() => setExpandedIds((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])} className="mt-3 inline-flex h-auto items-center gap-1.5 p-0 text-[11px] font-semibold text-secondary underline underline-offset-4"><Info className="size-3.5" aria-hidden />{t(expandedIds.includes(step.id) ? "start.details.close" : "start.details.open")}</Button>
                            {expandedIds.includes(step.id) ? <div id={`details-${step.id}`} className="mt-2 rounded-2xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                              <StepDetails step={step} />
                              {step.dependency?.[lang] ? <><p className={cn(LABEL, "mt-3")}>{t("road.dependency")}</p><p className="mt-1 text-sm leading-relaxed">{step.dependency[lang]}</p></> : null}
                              {step.completion?.[lang] ? <><p className={cn(LABEL, "mt-3")}>{t("road.completionCondition")}</p><p className="mt-1 text-sm leading-relaxed">{step.completion[lang]}</p></> : null}
                            </div> : null}
                          </> : null}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {step.basedOnAnswers ? <span className="rounded-md bg-secondary/10 px-2 py-1 text-secondary">{t("start.based")}</span> : null}
                            {step.addedFirst ? <span className="rounded-md bg-accent/20 px-2 py-1 text-foreground">{t("start.prerequisite")}</span> : null}
                          </div>
                        </div>
                      </div>
                    </li>;
                  })}
                </ol>
              </Fragment>;
            }) : <p className="mt-5 text-sm text-muted-foreground">{t("start.noSteps")}</p>}
            {isProfileDriven && profileSteps.length > 0 ? <section className="mt-6">
              <h3 className="text-base font-bold">{t("start.profileSteps.title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("start.profileSteps.caption")}</p>
              <ol className="mt-5 space-y-4">
                {profileSteps.map((step) => {
                  const done = doneIds.includes(step.id);
                  const title = typeof step.title === "string" ? t(step.title) : step.title[lang];
                  return <PremiumStepCard key={step.id} step={step} done={done} expanded={expandedIds.includes(step.id)} onToggleDone={() => toggleDone(step.id)} onToggleExpanded={() => setExpandedIds((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])} profilePriority={isPriorityStep(step.id, userGaps)} profileDriven whyOpen={profileWhyIds.includes(step.id)} onToggleWhy={() => setProfileWhyIds((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])} />;
                })}
              </ol>
            </section> : null}
            {hasNavigator ? <ProfileCard completed={state.completed} /> : <UpgradeCard view="road" onUpgrade={openUpgrade} />}
            {hasNavigator ? <p className="mt-6 text-xs text-muted-foreground">{t("start.soonNote")}</p> : null}
            <p className="mt-6 text-xs text-muted-foreground">{t("start.disclaimer")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("start.deviceNote")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className={GHOST_BTN} onClick={() => setStage("choose")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
              <Button type="button" variant="secondary" className={PRIMARY_BTN} onClick={() => setStage("info")}>{t("start.switchToInfo")}<ArrowRight className="rtl:rotate-180" /></Button>
            </div>
          </div></section>
        ) : null}
        <Button type="button" variant="link" className="mt-10 h-auto p-0 text-xs font-semibold text-muted-foreground underline underline-offset-4" onClick={() => {
          if (!window.confirm(t("start.deleteConfirm"))) return;
          reset();
          try { window.sessionStorage.removeItem("migrago.start.v1"); } catch { /* Storage may be unavailable. */ }
          try { window.localStorage.removeItem("migrago.start.done"); } catch { /* Storage may be unavailable. */ }
          try { window.localStorage.removeItem("migrago.start.docs"); } catch { /* Storage may be unavailable. */ }
          setStage("city"); setAreas([]); setDoneIds([]); setDocIds([]); setExpandedIds([]);
        }}>{t("start.deleteData")}</Button>
      </main>
      <SiteFooter />
      <FoundersCircleModal open={paywallOpen} onClose={() => setPaywallOpen(false)} onJoined={() => {
        setPaywallOpen(false); void navigate({ to: "/checkout", search: { next: "start" } });
      }} />
    </div>
  );
}
function PremiumStepCard({ step, done, expanded, onToggleDone, onToggleExpanded, profilePriority, profileDriven, whyOpen, onToggleWhy }: { step: AreaStep; done: boolean; expanded: boolean; onToggleDone: () => void; onToggleExpanded: () => void; profilePriority: boolean; profileDriven: boolean; whyOpen: boolean; onToggleWhy: () => void }) {
  const { t, lang } = useI18n();
  const title = typeof step.title === "string" ? t(step.title) : step.title[lang];
  return <li data-step-id={step.id} className={cn("rounded-lg border border-border/70 p-4", done && "opacity-70")} style={stepCardStyle(step.phase)}>
    <div className="flex items-start gap-3">
      <input type="checkbox" checked={done} onChange={onToggleDone} aria-label={`${t("road.done")}: ${title}`} className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--status-done)]" />
      <div className="min-w-0 flex-1">
        <Button type="button" variant="ghost" aria-expanded={expanded} aria-controls={`details-${step.id}`} onClick={onToggleExpanded} className="h-auto w-full flex-wrap justify-start gap-2 whitespace-normal p-0 text-start hover:bg-transparent">
          <span className={cn("me-auto text-sm font-bold", done && "line-through")}>{title}</span>
          {getStepWeek(step) !== weeksRange(step.phase)[0] ? <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">{t("road.week")} {localizeNumber(getStepWeek(step), lang)}</span> : null}
          {profilePriority ? <span className="rounded-full bg-[var(--navigator-teal)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--journey-pill-foreground)]">{t("start.priorityBadge")}</span> : null}
        </Button>
        <div className="mt-2"><InstitutionBadge institution={step.authority as Institution} displayName={t(`start.authority.${step.authority}`)} compact /></div>
        {expanded ? <div id={`details-${step.id}`} className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <StepDetails step={step} />
          <a href={step.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-secondary underline underline-offset-4">{t("road.officialSource")}<ExternalLink className="size-3.5" /></a>
          {step.completion?.[lang] ? <><p className={cn(LABEL, "mt-3")}>{t("road.completionCondition")}</p><p className="mt-1">{step.completion[lang]}</p></> : null}
          {profileDriven ? <><Button type="button" variant="link" aria-expanded={whyOpen} className="mt-3 h-auto p-0 text-xs text-secondary" onClick={onToggleWhy}><Info className="size-3.5" />{t("road.why")}</Button>{whyOpen ? <p className="mt-2 text-xs">{t("start.profileSteps.caption")}</p> : null}</> : null}
        </div> : null}
      </div>
    </div>
  </li>;
}
function StepBody({ step, localUrl, showDetails = true, done = false }: { step: AreaStep; localUrl: string | undefined; showDetails?: boolean; done?: boolean }) {
  const { lang, t } = useI18n();
  return <>
    <p className={cn(LABEL, "mt-3")}>{t("road.action")}</p>
    <h4 className={cn("mt-1 text-sm font-bold leading-snug", done && "line-through")}>{typeof step.title === "string" ? t(step.title) : step.title[lang]}</h4>
    {showDetails && step.detail ? <><p className={cn(LABEL, "mt-3")}>{t("road.whyMatters")}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail[lang]}</p></> : null}
    <p className={cn(LABEL, "mt-3")}>{t("road.relevantAuthority")}</p>
    <div className="mt-1"><InstitutionBadge institution={step.authority as Institution} href={step.sourceUrl} displayName={t(`start.authority.${step.authority}`)} /></div>
    {step.overlay.deadline ? <><p className={cn(LABEL, "mt-3")}>{t("start.deadline")}</p><p className="mt-1 text-sm leading-relaxed">{t(step.overlay.deadline)}</p></> : null}
    {showDetails && step.overlay.documents ? <div className="mt-3 text-sm"><p className={LABEL}>{t("start.documents")}</p><ul className="mt-1 list-disc space-y-1 ps-5">{step.overlay.documents.map((key) => <li key={key}>{t(key)}</li>)}</ul></div> : null}
    {showDetails && step.overlay.note ? <><p className={cn(LABEL, "mt-3")}>{t("start.note")}</p><p className="mt-1 text-sm leading-relaxed">{t(step.overlay.note)}</p></> : null}
    {step.id === "early-childhood-education" ? <div className="mt-3 text-sm">{localUrl ? <a href={localUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-secondary">{t("start.local")}<ExternalLink className="size-4" /></a> : <><p className="text-muted-foreground">{t("start.localMissing")}</p><a href={step.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-secondary underline">{t("road.officialSource")}</a></>}</div> : null}
    {step.overlay.lastChecked && (step.overlay.deadline || step.overlay.documents?.length || step.overlay.note) ? <p className="mt-3 text-xs text-muted-foreground">{t("start.lastChecked")}: <time dateTime={step.overlay.lastChecked}><bdi>{formatCheckedDate(step.overlay.lastChecked, lang)}</bdi></time></p> : null}
  </>;
}

function StepDetails({ step }: { step: AreaStep }) {
  const { lang, t } = useI18n();
  return <>
    {step.detail?.[lang] ? <><p className={cn(LABEL, "mt-3")}>{t("road.whyMatters")}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail[lang]}</p></> : null}
    {step.overlay.documents?.length ? <div className="mt-3 text-sm"><p className={LABEL}>{t("start.documents")}</p><ul className="mt-1 list-disc space-y-1 ps-5">{step.overlay.documents.map((key) => <li key={key}>{t(key)}</li>)}</ul></div> : null}
    {step.overlay.note ? <><p className={cn(LABEL, "mt-3")}>{t("start.note")}</p><p className="mt-1 text-sm leading-relaxed">{t(step.overlay.note)}</p></> : null}
  </>;
}
function ProfileCard({ completed, onIncomplete }: { completed: boolean; onIncomplete?: () => void }) {
  const { state } = useAppState();
  const navigate = useNavigate();
  const profile = completed ? computeProfile(state.answers, state.founderTrack === true, state.region ?? "undecided") : undefined;
  return <ProfilePreview {...(profile ? { profile } : {})} onOpen={() => { if (!completed && onIncomplete) { onIncomplete(); return; } void navigate(completed ? { to: "/dashboard", search: { tab: "profile" } } : { to: "/assessment" }); }} />;
}
function UpgradeCard({ onUpgrade }: { view: "info" | "road"; onUpgrade: () => void }) {
  const { t } = useI18n();
  return <div className="mt-8 rounded-3xl border border-border bg-muted/50 p-6">
    <h3 className="flex items-center gap-2 text-lg font-semibold"><Lock className="size-5 shrink-0 text-secondary" aria-hidden />{t("start.free.upgradeTitle")}</h3>
    <ul className="mt-4 space-y-3 text-sm">
      {(["start.free.f1", "start.free.f2", "start.free.f3"] as const).map((key) => <li key={key} className="flex items-start gap-2"><Check className="size-4 shrink-0 text-secondary" aria-hidden /><span>{t(key)}</span></li>)}
    </ul>
    <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "mt-5 h-auto whitespace-normal")} onClick={onUpgrade}><Lock />{t("start.free.cta")}</Button>
  </div>;
}
