import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FlaskConical, ShieldAlert } from "lucide-react";
import { BrandLogo, LanguageSwitch } from "@/components/BrandHeader";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { readMetrics, type Metrics } from "@/lib/store";
import { fetchValidationSignals, type ValidationSignals } from "@/lib/feedback";
import {
  createDemoAccount,
  deleteDemoAccount,
  listDemoAccounts,
  setDemoAccountActive,
  verifyFounderAccess,
  type DemoAccount,
} from "@/lib/founder-access.functions";

const SESSION_KEY = "migrago.founder";
const SESSION_ROLE_KEY = "migrago.founder.role";

export const Route = createFileRoute("/founder-metrics")({
  head: () => ({
    meta: [
      { title: "Founder validation metrics — MigraGo (internal)" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Private, aggregate-only validation metrics for MigraGo evaluator demonstrations.",
      },
      { property: "og:title", content: "Founder validation metrics — MigraGo" },
      { property: "og:description", content: "Internal validation metrics dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FounderMetrics,
});

function FounderMetrics() {
  const { t, lang } = useI18n();
  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState<"primary" | "demo" | null>(null);
  const [input, setInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [demoLabel, setDemoLabel] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const primaryPassword = useRef("");

  const refreshDemoAccounts = async () => {
    if (!primaryPassword.current) return;
    setDemoAccounts(await listDemoAccounts({ data: { password: primaryPassword.current } }));
  };

  const submitGate = async () => {
    setChecking(true);
    const res = await verifyFounderAccess({
      data: { email: emailInput, password: input },
    });
    setChecking(false);
    if (!res.role) {
      setError(true);
      return;
    }
    if (res.role === "primary") {
      primaryPassword.current = input;
      void refreshDemoAccounts();
    }
    window.sessionStorage.setItem(SESSION_KEY, "1");
    window.sessionStorage.setItem(SESSION_ROLE_KEY, res.role);
    setRole(res.role);
    setUnlocked(true);
  };
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [signals, setSignals] = useState<ValidationSignals | null>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      setUnlocked(true);
      setRole(window.sessionStorage.getItem(SESSION_ROLE_KEY) === "demo" ? "demo" : "primary");
    }
    setMetrics(readMetrics());
    void fetchValidationSignals().then(setSignals);
  }, []);

  const funnel = useMemo(() => {
    if (!metrics) return [];
    return [
      { stage: t("metrics.started"), value: metrics.started },
      { stage: t("metrics.finished"), value: metrics.finished },
      { stage: t("pay.teaser"), value: metrics.paywallViews },
      { stage: t("metrics.upgradeClicks"), value: metrics.upgradeClicks },
      { stage: t("metrics.checkoutDone"), value: metrics.checkoutCompleted },
    ];
  }, [metrics, t]);

  const plum = { background: "var(--plum)", color: "oklch(0.97 0.006 85)" };

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
          <BrandLogo />
          <p className="mt-5 text-sm font-semibold">{t("metrics.gate")}</p>
          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            {t("metrics.gateEmail")}
          </label>
          <input
            type="email"
            value={emailInput}
            autoComplete="username"
            onChange={(e) => setEmailInput(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            {t("metrics.password")}
          </label>
          <input
            type="password"
            value={input}
            autoComplete="current-password"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submitGate();
            }}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error ? <p className="mt-2 text-xs font-semibold text-destructive">{t("metrics.wrong")}</p> : null}
          <button
            type="button"
            disabled={checking}
            onClick={() => void submitGate()}
            className="mt-4 w-full rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60"
            style={plum}
          >
            {t("metrics.enter")}
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const completionRate = Math.round((metrics.finished / Math.max(1, metrics.started)) * 100);

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--plum)" }}>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );

  const ranking = (record: Record<string, number>) => (
    <ul className="space-y-2">
      {Object.entries(record)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => (
          <li key={k} className="flex items-center gap-3 text-sm">
            <span className="w-40 shrink-0 truncate font-medium">{k}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${(v / Math.max(...Object.values(record))) * 100}%`,
                  background: "var(--plum)",
                }}
              />
            </span>
            <span className="w-10 text-end tabular-nums text-muted-foreground">
              {localizeNumber(v, lang)}
            </span>
          </li>
        ))}
    </ul>
  );

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.965 0.008 85)" }}>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <BrandLogo />
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitch />
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.removeItem(SESSION_KEY);
                setUnlocked(false);
              }}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold"
            >
              {t("metrics.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 md:px-8">
        <div className="mx-auto max-w-7xl space-y-3">
          <p
            className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            style={plum}
          >
            <ShieldAlert className="size-4" aria-hidden />
            {t("metrics.banner")}
          </p>
          <div className="rounded-2xl border border-[var(--gold)] bg-[var(--gold)]/12 px-5 py-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <FlaskConical className="size-3.5" aria-hidden />
              {t("metrics.prototype")}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("metrics.prototypeBody")}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="text-2xl md:text-3xl" style={{ color: "var(--plum)" }}>
          {t("metrics.title")}
        </h1>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          {[
            {
              title: t("metrics.csat"),
              value:
                signals && signals.csat_total > 0
                  ? `${localizeNumber(Math.round((signals.csat_positive / signals.csat_total) * 100), lang)}%`
                  : "—",
              note: `${t("metrics.csatMatch")} · n=${localizeNumber(signals?.csat_total ?? 0, lang)}`,
            },
            {
              title: t("metrics.nps"),
              value:
                signals && signals.nps_total > 0
                  ? localizeNumber(Math.round(signals.nps_avg * 10) / 10, lang)
                  : "—",
              note: `${t("metrics.npsAvg")} · n=${localizeNumber(signals?.nps_total ?? 0, lang)}`,
            },
            {
              title: t("metrics.emailLeads"),
              value: localizeNumber(signals?.founders_circle ?? 0, lang),
              note: `${t("metrics.responses")} · n=${localizeNumber(signals?.founders_circle ?? 0, lang)}`,
            },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl border border-secondary/30 bg-card p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                {t("metrics.live")}
              </h2>
              <p className="mt-1 text-sm font-semibold">{c.title}</p>
              <p className="mt-3 text-4xl font-bold tabular-nums" style={{ color: "var(--plum)" }}>
                {c.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{c.note}</p>
            </div>
          ))}
        </section>

        <p className="mt-4 text-xs text-muted-foreground">{t("metrics.emailVsPay")}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title={t("metrics.registrations")}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.registrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis width={34} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="var(--plum)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title={t("metrics.completion")}>
            <p className="text-5xl font-bold tabular-nums" style={{ color: "var(--plum)" }}>
              {localizeNumber(completionRate, lang)}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("metrics.started")}: {localizeNumber(metrics.started, lang)} · {t("metrics.finished")}:{" "}
              {localizeNumber(metrics.finished, lang)}
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${completionRate}%`, background: "var(--plum)" }}
              />
            </div>
          </Card>

          <Card title={t("metrics.funnel")}>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={150}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" fill="var(--plum)" radius={[6, 6, 6, 6]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title={t("metrics.checkoutSection")}>
            <dl className="grid grid-cols-3 gap-4 text-center">
              {[
                [t("metrics.upgradeClicks"), metrics.upgradeClicks],
                [t("metrics.checkoutStarted"), metrics.checkoutStarted],
                [t("metrics.checkoutDone"), metrics.checkoutCompleted],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl bg-muted/70 p-4">
                  <dt className="text-[11px] font-semibold leading-snug text-muted-foreground">{label}</dt>
                  <dd className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--plum)" }}>
                    {localizeNumber(Number(value), lang)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title={t("metrics.nationalities")}>{ranking(metrics.nationalities)}</Card>
          <Card title={t("metrics.pathways")}>{ranking(metrics.pathways)}</Card>
          <Card title={t("metrics.countryInterest")}>{ranking(metrics.countryClicks)}</Card>
        </div>

        {role === "demo" ? (
          <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-xs font-semibold text-muted-foreground">
            {t("metrics.demoRole")}
          </p>
        ) : null}

        {role === "primary" ? (
          <section className="mt-6 rounded-3xl border border-border bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--plum)" }}>
              {t("metrics.demoTitle")}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("metrics.demoBody")}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("metrics.demoLabel")}
                <input
                  value={demoLabel}
                  onChange={(e) => setDemoLabel(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                {t("metrics.demoEmail")}
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <button
                type="button"
                disabled={!demoLabel.trim() || !demoEmail.trim()}
                onClick={async () => {
                  await createDemoAccount({
                    data: {
                      password: primaryPassword.current,
                      label: demoLabel.trim(),
                      email: demoEmail.trim(),
                    },
                  });
                  setDemoLabel("");
                  setDemoEmail("");
                  void refreshDemoAccounts();
                }}
                className="rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50"
                style={plum}
              >
                {t("metrics.demoCreate")}
              </button>
            </div>

            <ul className="mt-5 space-y-3">
              {demoAccounts.length === 0 ? (
                <li className="text-sm text-muted-foreground">{t("metrics.demoNone")}</li>
              ) : null}
              {demoAccounts.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-sm"
                >
                  <div className="min-w-40 flex-1">
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                    <p className="mt-1 text-xs">
                      <span className="text-muted-foreground">{t("metrics.demoCode")}: </span>
                      <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">{a.access_code}</code>
                    </p>
                  </div>
                  <span
                    className={
                      a.active
                        ? "rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-bold text-secondary"
                        : "rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground"
                    }
                  >
                    {a.active ? t("metrics.demoActive") : t("metrics.demoRevoked")}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await setDemoAccountActive({
                        data: { password: primaryPassword.current, id: a.id, active: !a.active },
                      });
                      void refreshDemoAccounts();
                    }}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold"
                  >
                    {a.active ? t("metrics.demoRevoke") : t("metrics.demoRestore")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteDemoAccount({
                        data: { password: primaryPassword.current, id: a.id },
                      });
                      void refreshDemoAccounts();
                    }}
                    className="rounded-full border border-destructive/40 px-4 py-1.5 text-xs font-semibold text-destructive"
                  >
                    {t("metrics.demoDelete")}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-6 text-xs text-muted-foreground">{t("metrics.aggregateNote")}</p>
      </main>
    </div>
  );
}
