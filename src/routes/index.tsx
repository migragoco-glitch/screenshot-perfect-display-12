import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarDays, ChartLine, Check, ChevronDown, ClipboardCheck, Clock, Crown, Gift, Landmark, Route as RouteIcon, UserRoundCheck, Hourglass, Sparkles } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { FoundersCircleModal } from "@/components/FeedbackWidgets";
import { Button } from "@/components/ui/button";
import { localizeNumber, useI18n, type TKey } from "@/lib/i18n";
import { RoadmapBars } from "@/components/RoadmapBars";
import { useAppState } from "@/lib/store";
import { AREAS, type AreaId, TITLE_OVERRIDES } from "@/lib/area-flow";
import { KNOWLEDGE_TABLE } from "@/lib/roadmap";

function mockStepTitle(id: string, lang: "en" | "fa", t: (key: TKey) => string) {
  const bilingual = TITLE_OVERRIDES[id] ?? KNOWLEDGE_TABLE.find((entry) => entry.id === id)?.title;
  return bilingual ? bilingual[lang] : t(`start.step.${id}.title` as TKey);
}

// Trigger rebuild after prior changes
export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "MigraGo" },
      {
        name: "description",
        content:
          "Assess your integration readiness for Finland and get a personalized step-by-step roadmap mapped to Migri, DVV, Kela, Vero and Local Employment Services.",
      },
      { property: "og:title", content: "MigraGo" },
      {
        property: "og:description",
        content:
          "Know where you stand. Know what's next. A readiness assessment plus an evidence-based step-by-step integration roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const INSTITUTIONS: { name: string; url: string; aria: TKey }[] = [
  { name: "Migri", url: "https://migri.fi", aria: "inst.a.migri" },
  { name: "DVV", url: "https://dvv.fi", aria: "inst.a.dvv" },
  { name: "Vero", url: "https://www.vero.fi", aria: "inst.a.vero" },
  { name: "Kela", url: "https://www.kela.fi", aria: "inst.a.kela" },
  {
    name: "Job Market Finland",
    url: "https://www.tyomarkkinatori.fi",
    aria: "inst.a.employment",
  },
  { name: "International House Helsinki", url: "https://ihhelsinki.fi", aria: "inst.a.ihh" },
  { name: "Valvira / OPH", url: "https://www.valvira.fi", aria: "inst.a.valvira" },
  { name: "PRH / YTJ", url: "https://www.ytj.fi", aria: "inst.a.prh" },
  { name: "Business Finland", url: "https://www.businessfinland.fi", aria: "inst.a.bf" },
];

const SAMPLE = [
  { key: "dash.dim1", value: 65, color: "#3AC8C3" },
  { key: "dash.dim2", value: 74, color: "#02808A" },
  { key: "dash.dim3", value: 81, color: "var(--navigator-gold)" },
] as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || entered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [entered]);

  return { ref, entered };
}

function useCountUp(target: number, active: boolean, duration: number) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, reducedMotion, target]);

  return value;
}

function SampleDonut() {
  const overall = Math.round((65 * 30 + 74 * 40 + 81 * 30) / 100);
  const data = SAMPLE.map((d) => ({ name: d.key, value: d.value, color: d.color }));
  const { ref, entered } = useInViewOnce<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const displayedOverall = useCountUp(overall, entered, 1100);
  return (
    <div ref={ref} className="relative mt-4 h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {entered ? (
            <Pie
              data={data}
              dataKey="value"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={!reducedMotion}
              animationDuration={1100}
              animationEasing="ease-out"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          ) : null}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{displayedOverall}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">100</span>
      </div>
    </div>
  );
}

function MiniDonut({ label, value, color }: { label: string; value: number; color: string }) {
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const { ref, entered } = useInViewOnce<HTMLDivElement>();
  const displayedValue = useCountUp(value, entered, 1100);
  const reducedMotion = useReducedMotion();
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={size} height={size} role="img" aria-label={`${label}: ${value}%`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={entered ? c - (c * value) / 100 : c}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: `stroke-dashoffset ${reducedMotion ? 0 : 1100}ms ease-out` }}
          />
        </svg>
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums"
          style={{ color }}
        >
          {displayedValue}
        </span>
      </div>
      <span className="text-center text-[10px] font-semibold leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function RoadmapPreview() {
  const { ref, entered } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className="mt-6">
      <RoadmapBars entered={entered} />
    </div>
  );
}

const HOW_AREA_COLORS: Record<AreaId, string> = {
  status: "light-teal", id: "light-teal", bank: "light-teal",
  housing: "teal", kela: "teal", work: "gold",
  family: "olive", language: "olive", comm: "gold",
};

function HowRoadmapBars() {
  const { ref, entered } = useInViewOnce<HTMLDivElement>();
  return <div ref={ref}><RoadmapBars compact entered={entered} /></div>;
}

function HowReadinessDonut() {
  const { t, lang } = useI18n();
  const { ref, entered } = useInViewOnce<HTMLDivElement>();
  const value = useCountUp(73, entered, 1100);
  const reducedMotion = useReducedMotion();
  const r = 44;
  const c = 2 * Math.PI * r;
  const seg = c / 3;
  return (
    <div ref={ref} className="relative size-[104px]">
      <svg width={104} height={104} viewBox="0 0 104 104">
        {(["var(--navigator-teal)", "var(--navigator-light-teal)", "var(--navigator-gold)"] as const).map((color, i) => (
          <circle key={color} cx={52} cy={52} r={r} fill="none" stroke={color} strokeWidth={12}
            strokeDasharray={`${entered ? seg - 4 : 0} ${entered ? c - seg + 4 : c}`}
            strokeDashoffset={-seg * i} transform="rotate(-90 52 52)"
            style={{ transition: `stroke-dasharray ${reducedMotion ? 0 : 1100}ms ease-out` }} />
        ))}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span className="text-[24px] font-bold">{localizeNumber(value, lang)}</span>
        <span className="text-[10px] text-muted-foreground">{t("how.mock.outOf")}</span>
      </span>
    </div>
  );
}

function HowRing({ size, stroke, value, color, label }: { size: number; stroke: number; value: number; color: string; label: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const { ref, entered } = useInViewOnce<HTMLDivElement>();
  const displayedValue = useCountUp(value, entered, 1100);
  const reducedMotion = useReducedMotion();
  const { lang } = useI18n();
  return (
    <div ref={ref} className="flex min-w-0 flex-col items-center gap-1">
      <div className="relative">
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3E9EB" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={entered ? c - (c * value) / 100 : c} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: `stroke-dashoffset ${reducedMotion ? 0 : 1100}ms ease-out` }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" aria-label={label}>{localizeNumber(displayedValue, lang)}</span>
      </div>
    </div>
  );
}

function Landing() {
  const { t, lang } = useI18n();
  const { state } = useAppState();
  const navigate = useNavigate();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pricingDuration, setPricingDuration] = useState<"30" | "90">("30");
  const hasSavedProgress = Object.keys(state.answers).length > 0;

  return (
    <div className="min-h-screen">
      <AppHeader registered={Object.keys(state.answers).length > 0} quickCheckCta />

      <main>
        {/* Hero */}
        <section className="home-hero-section border-b border-border/70">
          <div className="pe-3 pt-[24px] pb-16 md:pe-6 md:pt-[40px] md:pb-24">
            <div className="home-hero-stack">
              <div className="home-hero-plate rounded-2xl" aria-hidden />
              <div className="glass-card home-hero-front relative rounded-3xl p-6 text-center md:p-8">
                <p className="home-hero-eyebrow mt-4">{t("hero.eyebrow")}</p>
                <h1 className="text-3xl leading-[1.08] md:text-5xl">
                  <span className="text-gradient-brand">{t("hero.title")}</span>
                </h1>
                <div className="home-hero-paragraphs mt-6">
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{t("hero.sub")}</p>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{t("hero.sub2")}</p>
                </div>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <Button asChild className="home-hero-button home-hero-primary group h-auto rounded-full px-6 py-3.5 text-sm font-semibold shadow-[var(--shadow-card)]">
                    <Link to="/start">{t("hero.startCta")}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden /></Link>
                  </Button>
                  <Button asChild variant="link" className="home-hero-button h-auto p-0 text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    <Link to="/" hash="how-it-works">{t("hero.howCta")}</Link>
                  </Button>
                  <span className="text-xs text-muted-foreground">{t("hero.time")}</span>
                </div>
                <div className="home-hero-closing mt-6 rounded-[10px] border border-border p-4">
                  <p className="text-base font-semibold text-foreground md:text-lg">{t("hero.tagline")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border/70 bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <h2 className="text-2xl md:text-3xl">{t("how.title")}</h2>
            <ol className="how-grid mt-8">
              {([
                { n: 1, title: "how.s1.t", description: "how.s1.d" },
                { n: 2, title: "how.s2.t", description: "how.s2.d" },
                { n: 3, title: "how.s3.t", description: "how.s3.d" },
                { n: 4, title: "how.s4.t", description: "how.s4.d" },
              ] as const).map((step) => (
                <li key={step.n} className={`how-stack how-step-${step.n}`}>
                  <div className="how-plate" aria-hidden />
                  <Link to="/start" className="how-card glass-card rounded-3xl">
                  <div className="how-card-inner">
                    <div className="how-card-text">
                      <div className="how-card-head">
                        <span className="how-num">{localizeNumber(step.n, lang)}</span>
                        <h3 className="how-title">{t(step.title)}</h3>
                      </div>
                      <div className="how-desc">
                        {t(step.description).split("\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      </div>
                    </div>
                    <div aria-hidden="true" className={`how-panel${step.n === 2 ? " how-panel-areas" : ""}`}>
                      {step.n === 1 ? (
                        <div className="space-y-2">
                          <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-sm font-semibold" style={{ border: "1.5px solid #3AC8C3" }}>
                            <span className="min-w-0">{t("start.chooseCity")}</span><ChevronDown className="size-4 shrink-0" style={{ color: "#CB902C" }} />
                          </div>
                          {([["start.city.Helsinki", "#02808A"], ["start.city.Espoo", "#6B8E3A"], ["start.city.Vantaa", "#CB902C"], ["start.city.Tampere", "#3AC8C3"]] as const).map(([key, color]) => (
                            <div key={key} className="flex min-w-0 items-center gap-2 rounded-lg bg-card px-3 py-2 text-[13px]">
                              <span className="size-[10px] shrink-0 rounded-full" style={{ background: color }} />
                              <span className="min-w-0">{t(key)}</span>
                            </div>
                          ))}
                        </div>
                      ) : step.n === 2 ? (
                        <div className="how-area-chips">
                          {AREAS.map((area) => (
                            <span key={area.id} className={`how-area-chip how-area-${HOW_AREA_COLORS[area.id]}`}>{t(area.title)}</span>
                          ))}
                        </div>
                      ) : step.n === 3 ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="min-w-0 rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "#02808A", color: "#fff" }}>{t("start.choose.road.title")}</span>
                            <span className="min-w-0 rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "#FBF1DE", color: "#9A6B16" }}>{t("start.choose.info.title")}</span>
                          </div>
                          <HowRoadmapBars />
                          <div className="flex min-w-0 items-center gap-2 rounded-lg bg-card px-3 py-2 text-[12px]" style={{ borderInlineStart: "4px solid #6B8E3A" }}>
                            <Clock className="size-3.5 shrink-0" style={{ color: "#6B8E3A" }} />
                            <span className="min-w-0 flex-1">{mockStepTitle("dvv-id-code", lang, t)}</span>
                            <span className="shrink-0 rounded bg-[var(--institution-tint)] px-1 font-semibold text-[var(--institution-purple)]">DVV</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <HowReadinessDonut />
                          <div className="grid w-full grid-cols-3 gap-2">
                            {([["dash.dim1", 65, "#02808A"], ["dash.dim2", 74, "#3AC8C3"], ["dash.dim3", 81, "#CB902C"]] as const).map(([key, value, color]) => (
                              <div key={key} className="flex min-w-0 flex-col items-center gap-1">
                                <HowRing size={42} stroke={5} value={value} color={color} label={localizeNumber(value, lang)} />
                                <span className="text-center text-[10.5px] font-semibold leading-tight text-muted-foreground" style={{ overflowWrap: "anywhere" }}>{t(key)}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-center text-[11.5px] text-muted-foreground">{t("how.s4.note")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Institutions */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div
            className="rounded-[24px] p-8 shadow-[0_10px_30px_-14px_rgba(2,28,59,0.5)] md:p-10"
            style={{ background: "var(--plum)", color: "oklch(0.97 0.006 85)" }}
          >
            <h2 className="text-2xl md:text-3xl">{t("inst.title")}</h2>
            <p className="mt-3 max-w-2xl text-sm opacity-85">{t("inst.sub")}</p>
            <ul className="mt-7 flex flex-wrap gap-3">
              {INSTITUTIONS.map((inst) => (
                <li key={inst.name}>
                  <a
                    href={inst.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(inst.aria)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CB902C] bg-transparent px-4 text-xs font-bold text-[#021C3B] transition-colors duration-200 ease-out hover:border-[#CB902C] hover:bg-[#CB902C] hover:text-[#021C3B] hover:shadow-[0_10px_20px_rgba(2,28,59,0.55)] focus-visible:border-[#CB902C] focus-visible:bg-[#CB902C] focus-visible:text-[#021C3B] focus-visible:shadow-[0_10px_20px_rgba(2,28,59,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F6F2] active:bg-[#CB902C] active:text-[#021C3B]"
                  >
                    <Building2 className="size-3.5 shrink-0" aria-hidden />
                    {inst.name}
                  </a>

                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-xs leading-relaxed opacity-75">{t("inst.note")}</p>
          </div>
        </section>

        {/* Tiers */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <h2 className="text-2xl md:text-3xl">{t("pricing.title")}</h2>
          <div className="mt-8 grid gap-[18px] lg:grid-cols-3">
            <article className="home-price-card home-price-free" aria-label={t("pricing.freeName")}>
              <span className="home-price-badge"><Gift className="size-4 shrink-0" aria-hidden />{t("pricing.freeName")}</span>
              <div className="home-price-zero">
                <p className="text-[22px] font-medium">{t("pricing.freePriceAmount")}</p>
                <p className="home-price-secondary text-xs">{t("pricing.noTimeLimit")}</p>
              </div>
              <p className="home-price-lead">{t("pricing.freeLead")}</p>
              <ul className="home-price-bullets">
                {(["pricing.freeSummary1", "pricing.freeItem3", "pricing.freeItem4", "pricing.freeSummary4"] as const).map((key) => (
                  <li key={key}><Check aria-hidden /><span>{t(key)}</span></li>
                ))}
              </ul>
              <details className="home-price-details">
                <summary>{t("pricing.allFeatures")}</summary>
                <ul>
                  {(["pricing.freeItem1", "pricing.freeItem2", "pricing.freeItem3", "pricing.freeItem4", "pricing.freeItem5", "pricing.freeItem6"] as const).map((key) => (
                    <li key={key}><Check aria-hidden /><span>{t(key)}</span></li>
                  ))}
                </ul>
              </details>
              <Button asChild className="home-price-cta">
                <Link to={state.consent ? "/start" : "/consent"} search={state.consent ? {} : { next: "start" }}>{t("pricing.freeStart")}</Link>
              </Button>
            </article>

            <article className="home-price-card home-price-premium" aria-label={t("pricing.nav")}>
              <span className="home-price-badge"><Crown className="size-4 shrink-0" aria-hidden />{t("pricing.nav")}</span>
              <div className="home-price-tiles" role="group" aria-label={t("checkout.planChoose")}>
                {(["30", "90"] as const).map((duration) => (
                  <Button key={duration} type="button" variant="outline" aria-pressed={pricingDuration === duration} onClick={() => setPricingDuration(duration)} className="home-price-tile">
                    <span className="text-[22px] font-medium"><bdi>{t(duration === "30" ? "checkout.plan30Price" : "checkout.plan90Price")}</bdi></span>
                    <span className="text-xs">{t(duration === "30" ? "pricing.access30" : "pricing.access90")}</span>
                    <span className={`home-price-saving ${duration === "30" ? "invisible" : ""}`} aria-hidden={duration === "30"}>{t("pricing.save17")}</span>
                  </Button>
                ))}
              </div>
              <p className="home-price-secondary mt-2 text-center text-xs">{t("pricing.navPriceNote")}</p>
              <p className="home-price-lead">{t("pricing.navLead")}</p>
              <ul className="home-price-bullets">
                {(["pricing.navSummary1", "pricing.navSummary2", "pricing.navSummary3", "pricing.navPriority", "pricing.navSummary5"] as const).map((key) => (
                  <li key={key}><Check aria-hidden /><span>{t(key)}</span></li>
                ))}
              </ul>
              <details className="home-price-details">
                <summary>{t("pricing.allFeatures")}</summary>
                <ul>
                  {(["pricing.navItem1", "pricing.navItem2", "pricing.navItem3", "pricing.navItem4", "pricing.navItem5", "pricing.navAssessment", "pricing.navProfileFull", "pricing.navPriority", "pricing.navHistoryFull", "pricing.navDashboardFull", "pricing.navItem7"] as const).map((key) => (
                    <li key={key} className={key === "pricing.navItem7" ? "home-price-secondary" : ""}>
                      {key === "pricing.navItem7" ? <Clock aria-hidden /> : <Check aria-hidden />}<span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </details>
              <Button type="button" className="home-price-cta" onClick={() => {
                if (state.tier === "navigator") { void navigate({ to: "/start" }); return; }
                setPaywallOpen(true);
              }}>{t("pricing.navStart")}</Button>
            </article>

            <article className="relative overflow-hidden rounded-2xl border border-dashed border-[color:var(--plum)]/30 bg-muted/50 p-7">
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: "var(--plum)" }}
                aria-hidden
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--navy)" }}>
                <Hourglass className="size-3" aria-hidden />
                {t("pricing.future")}
              </span>

              <h3 className="mt-4 text-lg">{t("pricing.stab")}</h3>
              <p className="mt-3 text-3xl font-bold text-muted-foreground">{t("pricing.stabPrice")}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t("pricing.stabDesc")}
              </p>
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/70 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("pricing.stabFutureLabel")}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t("pricing.stabFuture")}
                </p>
              </div>
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-full border border-border bg-[#021C3B] px-5 py-3 text-sm font-semibold text-white"
              >
                {t("nav.comingSoon")}
              </button>
            </article>
          </div>
          <p className="legal-notice mt-6" dir={lang === "fa" ? "rtl" : "ltr"}>
            {t("about.boundaries")}
          </p>
        </section>
      </main>

      <SiteFooter />
      <FoundersCircleModal open={paywallOpen} onClose={() => setPaywallOpen(false)} onJoined={() => {
        setPaywallOpen(false); void navigate({ to: "/checkout", search: { next: "start" } });
      }} />
    </div>
  );
}
