import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localizeNumber, useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/scoring";

export function ProgressRing({ percent, empty = false, complete = false }: { percent: number; empty?: boolean; complete?: boolean }) {
  const { t, lang } = useI18n();
  return <div className="relative size-28 shrink-0">
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--muted-foreground)" strokeOpacity={0.25} strokeWidth="9" strokeDasharray={empty ? "5 7" : undefined} />
      {!empty ? <circle className="roadmap-progress-transition" cx="60" cy="60" r="50" fill="none" stroke={complete ? "var(--status-done)" : "var(--navigator-teal)"} strokeWidth="9" strokeLinecap="round" strokeDasharray={Math.PI * 100} strokeDashoffset={Math.PI * 100 * (1 - percent / 100)} transform="rotate(-90 60 60)" /> : null}
    </svg>
    <div className={complete ? "absolute inset-5 flex items-center justify-center rounded-full bg-[var(--status-done)] text-[var(--journey-pill-foreground)]" : "absolute inset-0 flex items-center justify-center"}>
      <span className="text-lg font-bold tabular-nums">{empty ? `${lang === "fa" ? "؟" : "?"} ${t("q.of")} ${localizeNumber(100, lang)}` : `${localizeNumber(percent, lang)}%`}</span>
    </div>
  </div>;
}

export function RoadmapSummary({ done, total, showLength = false }: { done: number; total: number; showLength?: boolean }) {
  const { t, lang } = useI18n();
  const complete = total > 0 && done === total;
  return <div className="flex flex-wrap items-center gap-5 py-5">
    <ProgressRing percent={total ? Math.round(done / total * 100) : 0} complete={complete} />
    <div className="min-w-0 flex-1 space-y-2">
      <p className="text-sm font-semibold">{t("start.progress").replace("{done}", localizeNumber(done, lang)).replace("{total}", localizeNumber(total, lang))}</p>
      {showLength ? <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">{t("start.plan.length").replace("{n}", localizeNumber(12, lang))}</span> : null}
      {complete ? <p className="text-sm font-semibold text-foreground">{t("start.road.allDone")}</p> : null}
    </div>
  </div>;
}

export function ProfilePreview({ profile, onOpen }: { profile?: Profile; onOpen: () => void }) {
  const { t, lang } = useI18n();
  const dims = [
    { label: t("dash.dim1"), value: profile?.legal, color: "var(--navigator-teal)" },
    { label: t("dash.dim2"), value: profile?.professional, color: "var(--navigator-light-teal)" },
    { label: t("dash.dim3"), value: profile?.psychological, color: "var(--navigator-gold)" },
  ];
  return <section className="mt-8 border-t border-border py-6">
    <h3 className="text-lg font-semibold">{t(profile ? "start.profile.title" : "start.emptyProfile.title")}</h3>
    {!profile ? <p className="mt-2 text-sm text-muted-foreground">{t("start.emptyProfile.sub")}</p> : null}
    <div className="mt-5 grid items-center gap-5 sm:grid-cols-[112px_1fr]">
      <ProgressRing percent={profile?.overall ?? 0} empty={!profile} />
      <ul className="space-y-4">{dims.map((d) => <li key={d.label}><div className="flex justify-between gap-3 text-xs font-semibold"><span>{d.label}</span><span>{d.value === undefined ? "—" : `${localizeNumber(d.value, lang)}%`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="roadmap-progress-transition h-full rounded-full" style={{ width: `${d.value ?? 0}%`, background: d.color }} /></div></li>)}</ul>
    </div>
    {!profile ? <ul className="mt-5 space-y-2 text-sm">{(["start.emptyProfile.f1", "start.emptyProfile.f2", "start.emptyProfile.f3"] as const).map((key) => <li key={key} className="flex items-start gap-2"><Check className="size-4 shrink-0 text-secondary" /><span>{t(key)}</span></li>)}</ul> : null}
    <Button type="button" variant="secondary" className="mt-5 h-auto whitespace-normal rounded-full" onClick={onOpen}>{t(profile ? "start.doneProfile.view" : "start.emptyProfile.cta")}<ArrowRight className="rtl:rotate-180" /></Button>
    {!profile ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("start.emptyProfile.note")}</p> : null}
  </section>;
}