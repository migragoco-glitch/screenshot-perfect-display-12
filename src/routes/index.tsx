import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, ClipboardList, Compass, Sparkles } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";
import { useAppState } from "@/lib/store";

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

function Landing() {
  const { t, lang } = useI18n();
  const { state } = useAppState();

  return (
    <div className="min-h-screen">
      <AppHeader registered={Object.keys(state.answers).length > 0} />

      <main>
        {/* Hero */}
        <section className="finn-motif border-b border-border/70">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-8 md:py-24">
            <div className="rise-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                <Sparkles className="size-3.5" aria-hidden />
                {t("hero.badge")}
              </span>
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
                {t("dash.title")}
              </p>
              <div className="mt-5 space-y-5">
                {[
                  { label: t("dash.dim1"), value: 65, color: "var(--navy)" },
                  { label: t("dash.dim2"), value: 74, color: "var(--teal)" },
                  { label: t("dash.dim3"), value: 81, color: "var(--gold)" },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex items-baseline justify-between text-sm font-semibold">
                      <span>{d.label}</span>
                      <span className="tabular-nums text-muted-foreground">{d.value}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-[width] duration-300 ease-out"
                        style={{ width: `${d.value}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
                {t("how.s3.d")}
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

            <article className="rounded-2xl border border-dashed border-border bg-muted/50 p-7 opacity-80">
              <span className="rounded-full bg-card px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("pricing.future")}
              </span>
              <h3 className="mt-4 text-lg">{t("pricing.stab")}</h3>
              <p className="mt-3 text-3xl font-bold text-muted-foreground">{t("pricing.stabPrice")}</p>
              <p className="mt-4 text-sm text-muted-foreground">{t("pricing.stabDesc")}</p>
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
