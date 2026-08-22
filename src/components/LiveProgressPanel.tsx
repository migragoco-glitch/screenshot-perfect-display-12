import { useMemo } from "react";
import { QUESTIONS, type Answers, isAnswered } from "@/lib/questions";
import { BUCKETS } from "@/lib/scoring";
import { useI18n } from "@/lib/i18n";

/** Same color mapping as the dashboard donut/radar. */
const DIM_COLORS = ["var(--navy)", "var(--teal)", "var(--gold)"];

function completion(ids: readonly number[], answers: Answers) {
  const qs = QUESTIONS.filter((q) => ids.includes(q.id) && (!q.showIf || q.showIf(answers)));
  if (!qs.length) return 0;
  const done = qs.filter((q) => isAnswered(q, answers[q.id])).length;
  return Math.round((done / qs.length) * 100);
}

function Donut({ pct, size, color, label }: { pct: number; size: number; color: string; label: string }) {
  const stroke = size > 90 ? 10 : 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} role="img" aria-label={`${label}: ${pct}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <span className="max-w-[7rem] text-center text-[10px] font-semibold leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function LiveProgressPanel({ answers }: { answers: Answers }) {
  const { t } = useI18n();

  const { overall, dims } = useMemo(() => {
    const all = QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
    const done = all.filter((q) => isAnswered(q, answers[q.id])).length;
    return {
      overall: all.length ? Math.round((done / all.length) * 100) : 0,
      dims: [
        { label: t("dash.dim1"), pct: completion(BUCKETS.legal.ids, answers), color: DIM_COLORS[0]! },
        { label: t("dash.dim2"), pct: completion(BUCKETS.professional.ids, answers), color: DIM_COLORS[1]! },
        { label: t("dash.dim3"), pct: completion(BUCKETS.psychological.ids, answers), color: DIM_COLORS[2]! },
      ],
    };
  }, [answers, t]);

  return (
    <>
      {/* Mobile: sticky overall completion bar */}
      <div className="sticky top-[20rem] z-30 lg:hidden">
        <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>{t("q.live.title")}</span>
            <span>{t("q.live.inProgress")}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${overall}%`, backgroundColor: "var(--teal)" }}
            />
          </div>
        </div>
      </div>

      {/* Desktop: glassmorphic live progress panel */}
      <aside className="sticky top-[96px] hidden rounded-3xl border border-border/60 bg-card/60 p-5 shadow-[0_8px_30px_-12px_rgba(11,37,69,0.25)] backdrop-blur-xl lg:block">
        <h2 className="text-sm font-bold">{t("q.live.title")}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t("q.live.note")}</p>

        <div className="mt-5 flex justify-center">
          <Donut pct={overall} size={128} color="var(--teal)" label={t("q.live.overall")} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {dims.map((d) => (
            <Donut key={d.label} pct={d.pct} size={62} color={d.color} label={d.label} />
          ))}
        </div>

        <p className="mt-5 rounded-xl bg-secondary/8 px-3 py-2 text-center text-[11px] font-semibold text-secondary">
          {t("q.live.inProgress")}
        </p>
      </aside>
    </>
  );
}
