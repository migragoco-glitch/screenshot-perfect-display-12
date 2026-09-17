import { useMemo } from "react";
import { QUESTIONS, type Answers, isAnswered } from "@/lib/questions";
import { BUCKETS } from "@/lib/scoring";
import { useI18n } from "@/lib/i18n";

/** Same color mapping as the homepage Smart Integration Profile. */
const DIM_COLORS = [
  "var(--navigator-teal)",
  "var(--navigator-light-teal)",
  "var(--navigator-gold)",
];

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

function SegmentedDonut({ pct, size, progress, label }: { pct: number; size: number; progress: number[]; label: string }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 5;
  const segmentLength = (circumference - gap * 3) / 3;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} role="img" aria-label={`${label}: ${pct}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        {progress.map((value, index) => {
          const paintedLength = segmentLength * (value / 100);
          return (
            <circle
              key={DIM_COLORS[index]}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={DIM_COLORS[index]}
              strokeWidth={stroke}
              strokeLinecap={value > 0 ? "round" : "butt"}
              strokeDasharray={`${paintedLength} ${circumference - paintedLength}`}
              strokeDashoffset={-index * (segmentLength + gap)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          );
        })}
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-foreground text-sm font-bold">
          {pct}%
        </text>
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
    <aside className="sticky top-[96px] hidden rounded-3xl border border-border/60 bg-card/60 p-5 shadow-[0_8px_30px_-12px_rgba(11,37,69,0.25)] backdrop-blur-xl lg:block">
        <h2 className="text-sm font-bold">{t("q.live.title")}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t("q.live.note")}</p>

        <div className="mt-5 flex justify-center">
          <SegmentedDonut pct={overall} size={128} progress={dims.map((dimension) => dimension.pct)} label={t("q.live.overall")} />
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
  );
}
