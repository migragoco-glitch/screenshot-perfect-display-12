import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, ClipboardList, Compass, Hourglass, Route as RouteIcon, Sparkles } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";
import { useAppState } from "@/lib/store";

// Trigger rebuild after prior changes
export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "MigraGo — SettleSmart Navigator for Finland" },
      {
        name: "description",
        content:
          "Assess your integration readiness for Finland and get a personalized 12-week roadmap mapped to Migri, DVV, Kela, Vero and TE Services.",
      },
      { property: "og:title", content: "MigraGo — SettleSmart Navigator for Finland" },
      {
        property: "og:description",
        content:
          "Know where you stand. Know what's next. A smart assessment plus an evidence-based 12-week integration roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const INSTITUTIONS = ["Migri", "DVV", "Vero", "Kela", "TE Services", "Valvira / OPH", "International House Helsinki"];

const SAMPLE = [
  { key: "dash.dim1", value: 65, color: "var(--navy)" },
  { key: "dash.dim2", value: 74, color: "var(--teal)" },
  { key: "dash.dim3", value: 81, color: "var(--gold)" },
] as const;

function SampleDonut() {
  const overall = Math.round((65 * 30 + 74 * 40 + 81 * 30) / 100);
  const data = SAMPLE.map((d) => ({ name: d.key, value: d.value, color: d.color }));
  return (
    <div className="relative mt-4 h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive
            animationDuration={1400}
            animationEasing="ease-out"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{overall}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">100</span>
      </div>
    </div>
  );
}

function Landing() {
  const { t, lang } = useI18n();
  const { state } = useAppState();

  return (
    <div className="min-h-screen">
      <AppHeader registered={Object.keys(state.answers).length > 0} />

      <main>
        {/* Hero */}
        <section className="brand-motif border-b border-border/70">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-8 md:py-24">
            <div className="rise-in">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                  <span aria-hidden>🇫🇮</span>
                  {t("hero.country")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  <Sparkles className="size-3.5" aria-hidden />
                  {t("hero.badge")}
                </span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2.5 rounded-2xl border border-secondary/35 bg-card px-3.5 py-2 shadow-[var(--shadow-card)]">
                <span
                  className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-border bg-white"
                  aria-hidden
                >
                  <svg viewBox="0 0 18 11" className="size-full" role="presentation">
                    <rect width="18" height="11" fill="#fff" />
                    <rect x="5" width="3" height="11" fill="#003580" />
                    <rect y="4" width="18" height="3" fill="#003580" />
                  </svg>
                </span>
                <span className="text-[11px] font-semibold leading-snug text-foreground">
                  {t("hero.finlandPartner")}
                </span>
              </div>
              <h1 className="mt-6 text-4xl leading-[1.08] md:text-6xl">
                <span className="text-gradient-brand">{t("hero.title")}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("hero.sub")}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/consent"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-colors duration-200 ease-out hover:bg-primary/90"
                >
                  {t("nav.cta")}
                  <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                </Link>
                <span className="text-xs text-muted-foreground">{t("hero.time")}</span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("hero.previewTitle")}
              </p>
              <SampleDonut />
              <ul className="mt-5 space-y-2">
                {SAMPLE.map((d) => (
                  <li key={d.key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.color }}
                      aria-hidden
                    />
                    <span className="flex-1">{t(d.key)}</span>
                    <span className="tabular-nums font-semibold text-muted-foreground">
                      {d.value}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                {t("hero.previewNote")}
              </p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <h2 className="text-2xl md:text-3xl">{t("about.title")}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { t: t("about.definitionTitle"), d: t("about.definition"), icon: Compass },
              { t: t("about.missionTitle"), d: t("about.mission"), icon: BadgeCheck },
              { t: t("about.boundariesTitle"), d: t("about.boundaries"), icon: ClipboardList },
            ].map((b) => (
              <article key={b.t} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <b.icon className="size-5 text-secondary" aria-hidden />
                <h3 className="mt-4 text-lg">{b.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Integration is a process */}
        <section className="mx-auto max-w-7xl px-4 pb-4 md:px-8">
          <article className="rounded-3xl border border-secondary/25 bg-secondary/8 p-8 md:p-10">
            <RouteIcon className="size-6 text-secondary" aria-hidden />
            <h2 className="mt-4 text-2xl md:text-3xl">{t("about.processTitle")}</h2>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("about.processBody")}
            </p>
          </article>
        </section>

        {/* How it works */}
        <section className="border-y border-border/70 bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <h2 className="text-2xl md:text-3xl">{t("how.title")}</h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                { n: 1, t: t("how.s1.t"), d: t("how.s1.d") },
                { n: 2, t: t("how.s2.t"), d: t("how.s2.d") },
                { n: 3, t: t("how.s3.t"), d: t("how.s3.d") },
              ].map((s) => (
                <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-lg">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Institutions */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="rounded-3xl p-8 md:p-10" style={{ background: "var(--plum)", color: "oklch(0.97 0.006 85)" }}>
            <h2 className="text-2xl md:text-3xl">{t("inst.title")}</h2>
            <p className="mt-3 max-w-2xl text-sm opacity-85">{t("inst.sub")}</p>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {INSTITUTIONS.map((i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-semibold"
                >
                  <Building2 className="size-3.5" aria-hidden />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tiers */}
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <h2 className="text-2xl md:text-3xl">{t("pricing.title")}</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-7">
              <h3 className="text-lg">{t("pricing.free")}</h3>
              <p className="mt-3 text-3xl font-bold">{t("pricing.freePrice")}</p>
              <p className="mt-4 text-sm text-muted-foreground">{t("pricing.freeDesc")}</p>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">{t("pricing.freeExcl")}</p>
            </article>

            <article className="relative rounded-2xl border-2 border-secondary bg-card p-7 shadow-[var(--shadow-lift)]">
              <span className="absolute -top-3 start-7 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                {t("pricing.recommended")}
              </span>
              <h3 className="text-lg">{t("pricing.nav")}</h3>
              <p className="mt-3 text-3xl font-bold text-secondary">
                {t("pricing.navPrice")}
                <span className="text-sm font-medium text-muted-foreground">{t("pricing.perMonth")}</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{t("pricing.navDesc")}</p>
              <Link
                to="/consent"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90"
              >
                {t("nav.cta")}
              </Link>
            </article>

            <article className="relative overflow-hidden rounded-2xl border border-dashed border-[color:var(--plum)]/30 bg-muted/50 p-7">
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: "var(--plum)" }}
                aria-hidden
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--plum)" }}>
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
                className="mt-6 w-full cursor-not-allowed rounded-full border border-border px-5 py-3 text-sm font-semibold text-muted-foreground"
              >
                {t("nav.comingSoon")}
              </button>
            </article>
          </div>
          <p className="mt-6 text-xs text-muted-foreground" dir={lang === "fa" ? "rtl" : "ltr"}>
            {t("about.boundaries")}
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
