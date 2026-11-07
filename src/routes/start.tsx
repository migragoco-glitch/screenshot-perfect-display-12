import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Building2, Check, ExternalLink, Globe, HeartPulse, House, IdCard, Info, Landmark, Languages, Lock, Users } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { FoundersCircleModal, InstitutionBadge } from "@/components/FeedbackWidgets";
import { QuestionField } from "@/components/QuestionField";
import { Button } from "@/components/ui/button";
import { AREAS, MUNICIPALITIES, STEP_AREA, documentsForSteps, planWeeks, weeksRange, buildAreaSteps, suggestRoute, formatCheckedDate, earlyChildhoodLocalUrl, type AreaId, type AreaStep } from "@/lib/area-flow";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { QUESTIONS, isQuestionApplicable } from "@/lib/questions";
import { hasNavigatorAccess, trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Institution } from "@/lib/roadmap";

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
  kela: "var(--navigator-teal)", housing: "var(--navigator-teal)", work: "var(--navigator-teal)",
  family: "var(--navigator-olive)", language: "var(--navigator-olive)", comm: "var(--navigator-gold)",
};
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
  const [paywallOpen, setPaywallOpen] = useState(false);
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

  if (!hydrated || !state.consent || !restored) return null;
  const selectedAreas = AREAS.filter((area) => areas.includes(area.id));
  const asked = new Set(selectedAreas.flatMap((area) => area.questions));
  const effectiveRoute = state.route ?? suggestRoute(state.answers[2]?.value);
  const steps = buildAreaSteps(areas, state.answers, effectiveRoute, state.region);
  const hasNavigator = hasNavigatorAccess(state.tier);
  const filteredSteps = steps.filter((step) => areas.includes(STEP_AREA[step.id] as AreaId));
  const checklist = documentsForSteps(filteredSteps);
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
  const questionOwners = new Set<number>();

  return (
    <div dir={dir} className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
        <h1 className="text-2xl md:text-3xl">{t("start.title")}</h1>
        {stage === "city" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <label htmlFor="start-municipality" className="text-lg font-semibold">{t("start.city")}</label>
            <select id="start-municipality" value={state.municipality ?? ""} onChange={(event) => {
              const municipality = event.target.value;
              if (municipality) update({ municipality, region: ["Helsinki", "Espoo", "Vantaa"].includes(municipality) ? "helsinki" : "elsewhere" });
            }} className="mt-4 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm">
              <option value="" disabled>{t("start.chooseCity")}</option>
              {MUNICIPALITIES.map((city) => <option key={city} value={city}>{t(`start.city.${city}`)}</option>)}
            </select>
            <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "mt-6")} disabled={!state.municipality} onClick={() => setStage("areas")}>
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
                const tealGroup = ["kela", "housing", "work"].includes(area.id);
                return <Button type="button" key={area.id} variant="outline" aria-pressed={active} onClick={() => {
                  setAreas((current) => active ? current.filter((id) => id !== area.id) : [...current, area.id]);
                  setAreaError(false);
                }} className={cn("h-auto flex flex-col items-start justify-start gap-3 whitespace-normal rounded-2xl border bg-card p-5 text-start transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary", active ? "border-2 border-secondary bg-secondary/8 shadow-[var(--shadow-lift)]" : "border-border")}>
                  <span className="flex size-12 items-center justify-center rounded-full" style={{ background: chipColor, boxShadow: `0 0 0 5px color-mix(in srgb, ${chipColor} 20%, transparent)` }}><Icon className="size-6" style={{ color: tealGroup ? "var(--secondary-foreground)" : "var(--navigator-navy)" }} /></span>
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
            {selectedAreas.map((area) => (
              <section key={area.id} className="mt-8 border-t border-border pt-6">
                <h2 className="text-xl">{t(area.title)}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t(area.description)}</p>
                <a href={area.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary">{t("road.officialSource")}<ExternalLink className="size-4" /></a>
                <div className="mt-5 space-y-4">
                  {area.questions.map((id) => {
                    if (questionOwners.has(id)) return null;
                    questionOwners.add(id);
                    const question = QUESTIONS.find((item) => item.id === id);
                    if (!question || !isQuestionApplicable(question, state.answers, { founderTrack: state.founderTrack ?? null })) return null;
                    return <QuestionField key={id} question={question} index={id} hideNumber={true} answer={state.answers[id]} onChange={(value) => setAnswer(id, value)} levelColor="var(--teal)" />;
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
              </section>
            ))}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className={GHOST_BTN} onClick={() => setStage("areas")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
              <Button type="button" variant="secondary" className={PRIMARY_BTN} onClick={() => setStage("choose")}>{t("start.showSteps")}<ArrowRight className="rtl:rotate-180" /></Button>
            </div>
          </div>
        ) : null}
        {stage === "choose" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <h2 className="text-xl">{t("start.choose.title")}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(["info", "road"] as const).map((view) => (
                <Button type="button" key={view} variant="secondary" onClick={() => setStage(view)} className={cn(PRIMARY_BTN, "h-auto min-h-28 flex-col items-start justify-start whitespace-normal text-start")}>
                  <span className="font-semibold">{t(`start.choose.${view}.title`)}</span>
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">{t(`start.choose.${view}.desc`)}</span>
                </Button>
              ))}
            </div>
            <Button type="button" variant="outline" className={cn(GHOST_BTN, "mt-6")} onClick={() => setStage("questions")}><ArrowLeft className="rtl:rotate-180" />{t("common.back")}</Button>
          </div></section>
        ) : null}
        {stage === "info" ? (
          <section className="mt-8"><div className="glass-card rise-in rounded-3xl p-6 md:p-8">
            <h2 className="text-xl">{t("start.info.title")}</h2>
            {selectedAreas.map((area) => {
              const areaSteps = steps.filter((step) => STEP_AREA[step.id] === area.id);
              return (
                <section key={area.id} className="mt-8 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold">{t(area.title)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t(area.description)}</p>
                  <a href={area.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary">{t("road.officialSource")}<ExternalLink className="size-4" /></a>
                  {areaSteps.length ? (
                    <ul className="mt-5 space-y-4">
                      {areaSteps.map((step) => <li key={step.id} data-step-id={step.id} className="rounded-2xl border border-border/70 p-4 transition-opacity duration-200 ease-out" style={stepCardStyle(step.phase)}><StepBody step={step} localUrl={localUrl} /></li>)}
                    </ul>
                  ) : <p className="mt-4 text-sm text-muted-foreground">{t(area.id === "status" ? effectiveRoute === "nordic" ? "start.route.nordicNote" : effectiveRoute === undefined ? "start.route.choose" : "start.noSteps" : "start.noSteps")}</p>}
                  {area.id === "status" ? <p className="mt-3 text-sm text-muted-foreground">{t("start.status.scope")}</p> : null}
                </section>
              );
            })}
            {hasNavigator ? <>
              <section className="mt-8 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">{t("start.checklist.title")}</h3>
                {checklist.length ? checklist.map((item) => <div key={item.id} className="mt-5">
                  <h4 className="text-sm font-semibold">{typeof item.title === "string" ? t(item.title) : item.title[lang]}</h4>
                  {item.documents.map((key, index) => <label key={`${item.id}:${index}`} className="mt-3 flex items-start gap-3 text-sm">
                    <input type="checkbox" className="mt-1 size-4 accent-secondary" checked={docIds.includes(`${item.id}:${index}`)} onChange={() => toggleDoc(`${item.id}:${index}`)} />
                    <span>{t(key)}</span>
                  </label>)}
                </div>) : <p className="mt-3 text-sm text-muted-foreground">{t("start.checklist.empty")}</p>}
              </section>
              <ProfileCard completed={state.completed} />
              <p className="mt-6 text-xs text-muted-foreground">{t("start.soonNote")}</p>
            </> : <UpgradeCard view="info" onUpgrade={openUpgrade} />}
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
              <div className="flex flex-wrap items-center gap-2">
                {hasNavigator ? <>
                  <span className="rounded-full bg-secondary/12 px-3 py-1 text-[11px] font-semibold text-secondary">{t("start.progress").replace("{done}", localizeNumber(steps.filter((step) => doneIds.includes(step.id)).length, lang)).replace("{total}", localizeNumber(steps.length, lang))}</span>
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground">{t("start.plan.length").replace("{n}", localizeNumber(planWeeks(steps), lang))}</span>
                </> : null}
              </div>
            </div>
            {steps.length ? [...new Set(steps.map((step) => step.phase))].map((phase) => {
              const phaseSteps = steps.filter((step) => step.phase === phase);
              return <Fragment key={phase}>
                <header className="mt-6 flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold">{t(`road.phase${phase}` as "road.phase1" | "road.phase2" | "road.phase3" | "road.phase4")}</h3><span className="text-xs text-muted-foreground">{localizeNumber(phaseSteps.length, lang)} {t("road.steps")}</span></header>
                <ol className="mt-5 space-y-4">
                  {phaseSteps.map((step) => {
                    const done = doneIds.includes(step.id);
                    const title = typeof step.title === "string" ? t(step.title) : step.title[lang];
                    return <li key={step.id} data-step-id={step.id} className={cn("rounded-2xl border border-border/70 p-4 transition-opacity duration-200 ease-out", done && "opacity-70")} style={stepCardStyle(step.phase)}>
                      <div className="flex items-start gap-3">
                        {hasNavigator ? <label className="relative mt-0.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center">
                          <input type="checkbox" checked={done} onChange={() => toggleDone(step.id)} aria-label={`${t("road.done")}: ${title}`} className="peer size-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-colors duration-200 ease-out checked:border-[var(--navigator-teal)] checked:bg-[var(--navigator-teal)]" />
                          {done ? <Check className="check-pop pointer-events-none absolute size-3.5 text-secondary-foreground" aria-hidden /> : null}
                        </label> : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                            <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-primary">{localizeNumber(steps.indexOf(step) + 1, lang)}</span>
                            {hasNavigator ? <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-primary">{t("start.plan.weeks").replace("{from}", localizeNumber(weeksRange(step.phase)[0], lang)).replace("{to}", localizeNumber(weeksRange(step.phase)[1], lang))}</span> : null}
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
            {hasNavigator ? <><ProfileCard completed={state.completed} /><p className="mt-6 text-xs text-muted-foreground">{t("start.soonNote")}</p></> : <UpgradeCard view="road" onUpgrade={openUpgrade} />}
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
    {step.overlay.deadline || step.overlay.documents?.length || step.overlay.note ? <p className="mt-3 text-xs text-muted-foreground">{t("start.lastChecked")}: <time dateTime={step.overlay.lastChecked}><bdi>{formatCheckedDate(step.overlay.lastChecked, lang)}</bdi></time></p> : null}
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
function ProfileCard({ completed }: { completed: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/50 p-6">
    <h3 className="text-lg font-semibold">{t("start.profile.title")}</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("start.profile.desc")}</p>
    <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "mt-5 h-auto whitespace-normal")} onClick={() => { void navigate({ to: completed ? "/dashboard" : "/assessment" }); }}>{t(completed ? "start.profile.cta.dashboard" : "start.profile.cta.assessment")}<ArrowRight className="rtl:rotate-180" /></Button>
  </div>;
}
function UpgradeCard({ view, onUpgrade }: { view: "info" | "road"; onUpgrade: () => void }) {
  const { t } = useI18n();
  const inclusions = view === "road" ? ["start.lock.road.weeks", "start.lock.road.details", "start.lock.road.track"] as const : ["start.lock.info.checklist"] as const;
  return <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/50 p-6">
    <Lock className="size-6 text-secondary" aria-hidden />
    <h3 className="mt-3 text-lg font-semibold">{t("start.lock.title")}</h3>
    <ul className="mt-4 space-y-3 text-sm">
      {inclusions.map((key) => <li key={key} className="flex items-start gap-2"><Check className="size-4 shrink-0 text-secondary" aria-hidden /><span>{t(key)}</span></li>)}
      <li className="flex items-start gap-2"><Check className="size-4 shrink-0 text-secondary" aria-hidden /><span>{t("start.lock.profile")}</span></li>
      {(["start.lock.soon.sync", "start.lock.soon.pdf", "start.lock.soon.alerts"] as const).map((key) => <li key={key} className="flex flex-wrap items-center gap-2 text-muted-foreground"><span>{t(key)}</span><span className="rounded-md bg-muted px-2 py-1 text-xs">{t("start.soon")}</span></li>)}
    </ul>
    <Button type="button" variant="secondary" className={cn(PRIMARY_BTN, "mt-5 h-auto whitespace-normal")} onClick={onUpgrade}><Lock />{t("start.upgrade")}</Button>
    <p className="mt-3 text-xs text-muted-foreground">{t("pay.demoNote")}</p>
  </div>;
}
