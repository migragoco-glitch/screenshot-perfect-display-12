import { ArrowRight, Check, Gauge, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localizeNumber, useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/scoring";

export const DIMENSION_COLORS = {
  legal: "#02808A",
  professional: "#3AC8C3",
  psychological: "#CB902C",
} as const;

export function ProgressRing({ percent, empty = false, complete = false }: { percent: number; empty?: boolean; complete?: boolean }) {
  const { lang } = useI18n();
  return <div className="relative size-28 shrink-0">
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="none" stroke={empty ? "#02808A" : "var(--muted-foreground)"} strokeOpacity={empty ? 0.2 : 0.25} strokeWidth="9" />
      {!empty ? <circle className="roadmap-progress-transition" cx="60" cy="60" r="50" fill="none" stroke={complete ? "var(--status-done)" : "var(--navigator-teal)"} strokeWidth="9" strokeLinecap="round" strokeDasharray={Math.PI * 100} strokeDashoffset={Math.PI * 100 * (1 - percent / 100)} transform="rotate(-90 60 60)" /> : null}
    </svg>
    <div className={complete ? "absolute inset-5 flex items-center justify-center rounded-full bg-[var(--status-done)] text-[var(--journey-pill-foreground)]" : "absolute inset-0 flex items-center justify-center"}>
      {empty ? <Gauge className="size-9" color="#02808A" aria-hidden /> : <span className="text-lg font-bold tabular-nums">{localizeNumber(percent, lang)}%</span>}
    </div>
  </div>;
}

/** One arc per roadmap phase; arc length ∝ step count, fill ∝ ticked steps. */
export function PhaseRing({ phases, percent, complete }: { phases: { color: string; total: number; done: number }[]; percent: number; complete: boolean }) {
  const { lang } = useI18n();
  const size = 112;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = 4;
  const visible = phases.filter((p) => p.total > 0);
  const totalSteps = visible.reduce((sum, p) => sum + p.total, 0);
  let cursor = 0;
  return <div className="relative size-28 shrink-0">
    <svg viewBox={`0 0 ${size} ${size}`} className="size-full" role="img" aria-label={`${percent}%`}>
      {visible.map((p) => {
        const arc = totalSteps ? (p.total / totalSteps) * (c - gap * visible.length) : 0;
        const filled = p.total ? arc * (p.done / p.total) : 0;
        const offset = cursor;
        cursor += arc + gap;
        return <g key={p.color}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeOpacity={0.4} strokeWidth={stroke} strokeDasharray={`${arc} ${c - arc}`} strokeDashoffset={-offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          {filled > 0 ? <circle className="roadmap-progress-transition" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${filled} ${c - filled}`} strokeDashoffset={-offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} /> : null}
        </g>;
      })}
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-lg font-bold tabular-nums">{localizeNumber(percent, lang)}%</span>
    </div>
    {complete ? <span className="absolute -bottom-1 -end-1 flex size-6 items-center justify-center rounded-full bg-[#15803D] text-white"><Check className="size-3.5" strokeWidth={3} aria-hidden /></span> : null}
  </div>;
}

export function ProfileRing({ profile, large = false }: { profile: Profile; large?: boolean }) {
  const { t, lang } = useI18n();
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const gap = 4;
  const dimensions = [
    { color: DIMENSION_COLORS.legal, weight: 0.3, value: profile.legal },
    { color: DIMENSION_COLORS.professional, weight: 0.4, value: profile.professional },
    { color: DIMENSION_COLORS.psychological, weight: 0.3, value: profile.psychological },
  ];
  let cursor = 0;
  return <div className={large ? "relative mx-auto size-44 shrink-0" : "relative size-28 shrink-0"}>
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      {dimensions.map((dimension) => {
        const arc = dimension.weight * (circumference - gap * dimensions.length);
        const filled = arc * dimension.value / 100;
        const offset = cursor;
        cursor += arc + gap;
        return <g key={dimension.color}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke={dimension.color} strokeOpacity={0.4} strokeWidth="9" strokeDasharray={`${arc} ${circumference - arc}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
          {filled > 0 ? <circle className="roadmap-progress-transition" cx="60" cy="60" r={radius} fill="none" stroke={dimension.color} strokeWidth="9" strokeDasharray={`${filled} ${circumference - filled}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" /> : null}
        </g>;
      })}
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className={large ? "text-3xl font-bold tabular-nums" : "text-lg font-bold tabular-nums"}>{localizeNumber(profile.overall, lang)}{large ? "" : "%"}</span>
      {large ? <span className="text-xs text-muted-foreground">{t("q.of")} {localizeNumber(100, lang)}</span> : null}
    </div>
  </div>;
}

export function RoadmapSummary({ done, total, showLength = false, free = false, phases }: { done: number; total: number; showLength?: boolean; free?: boolean; phases?: { color: string; total: number; done: number }[] }) {
  const { t, lang } = useI18n();
  if (free) return <div className="space-y-2 py-5">
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">{t("start.plan.length").replace("{n}", localizeNumber(12, lang))}</span>
      <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">{t("start.free.totalSteps").replace("{total}", localizeNumber(total, lang))}</span>
    </div>
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" aria-hidden />{t("start.free.lockHint")}</p>
  </div>;
  const complete = total > 0 && done === total;
  const percent = total ? Math.round(done / total * 100) : 0;
  return <div className="flex flex-wrap items-center gap-5 py-5">
    {phases ? <PhaseRing phases={phases} percent={percent} complete={complete} /> : <ProgressRing percent={percent} complete={complete} />}
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
    { label: t("dash.dim1"), value: profile?.legal, color: DIMENSION_COLORS.legal },
    { label: t("dash.dim2"), value: profile?.professional, color: DIMENSION_COLORS.professional },
    { label: t("dash.dim3"), value: profile?.psychological, color: DIMENSION_COLORS.psychological },
  ];
  return <section className="mt-8 border-t border-border py-6">
    <h3 className="text-lg font-semibold">{t(profile ? "start.profile.title" : "start.emptyProfile.title")}</h3>
    {!profile ? <p className="mt-2 text-sm text-muted-foreground">{t("start.emptyProfile.sub")}</p> : null}
    <div className="mt-5 grid items-center gap-5 sm:grid-cols-[112px_1fr]">
      {profile ? <ProfileRing profile={profile} /> : <ProgressRing percent={0} empty />}
      <ul className="space-y-4">{dims.map((d) => <li key={d.label}><div className="flex justify-between gap-3 text-xs font-semibold"><span>{d.label}</span><span>{d.value === undefined ? "—" : `${localizeNumber(d.value, lang)}%`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="roadmap-progress-transition h-full rounded-full" style={{ width: `${d.value ?? 0}%`, background: d.color }} /></div></li>)}</ul>
    </div>
    {!profile ? <ul className="mt-5 space-y-2 text-sm">{(["start.emptyProfile.f1", "start.emptyProfile.f2", "start.emptyProfile.f3"] as const).map((key) => <li key={key} className="flex items-start gap-2"><Check className="size-4 shrink-0 text-secondary" /><span>{t(key)}</span></li>)}</ul> : null}
    <Button type="button" variant="secondary" className="mt-5 h-auto whitespace-normal rounded-full" onClick={onOpen}>{t(profile ? "start.doneProfile.view" : "start.emptyProfile.cta")}<ArrowRight className="rtl:rotate-180" /></Button>
    {!profile ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("start.emptyProfile.note")}</p> : null}
  </section>;
}