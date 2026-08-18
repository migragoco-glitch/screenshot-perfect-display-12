import { useI18n, localizeNumber } from "@/lib/i18n";
import { COUNTRIES, type AnswerValue, type Question } from "@/lib/questions";
import { cn } from "@/lib/utils";

type Props = {
  question: Question;
  index: number;
  answer: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
};

export function QuestionField({ question: q, index, answer, onChange }: Props) {
  const { lang, t } = useI18n();
  const selected = answer?.value;
  const showDetail = q.detailOn !== undefined && selected === q.detailOn;
  const isBracket = q.id === 17 || q.id === 21;

  return (
    <fieldset className="rounded-2xl border border-border bg-card/70 p-5 md:p-6">
      <legend className="sr-only">{q.label[lang]}</legend>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-xs font-bold text-primary">
          {localizeNumber(index, lang)}
        </span>
        <p className="text-[15px] font-semibold leading-relaxed">{q.label[lang]}</p>
      </div>

      {isBracket ? (
        <p className="mt-2 ms-10 text-xs text-muted-foreground">{t("q.bracketNote")}</p>
      ) : null}

      <div className="mt-4 ms-0 md:ms-10">
        {q.type === "number" ? (
          <input
            type="number"
            min={16}
            max={99}
            inputMode="numeric"
            value={typeof selected === "number" || typeof selected === "string" ? String(selected) : ""}
            onChange={(e) => onChange({ value: e.target.value === "" ? undefined : Number(e.target.value) })}
            className="w-32 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : null}

        {q.type === "text" ? (
          <textarea
            rows={3}
            value={typeof selected === "string" ? selected : ""}
            onChange={(e) => onChange({ value: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : null}

        {q.type === "country" ? (
          <select
            value={typeof selected === "string" ? selected : ""}
            onChange={(e) => onChange({ value: e.target.value })}
            className="w-full max-w-sm rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("q.selectCountry")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.en} value={c.en}>
                {c[lang]}
              </option>
            ))}
          </select>
        ) : null}

        {q.type === "single" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options?.map((opt, i) => (
              <button
                key={opt.en}
                type="button"
                aria-pressed={selected === i}
                onClick={() => onChange({ value: i })}
                className={cn(
                  "rounded-xl border px-4 py-3 text-start text-sm font-medium transition-colors duration-200 ease-out",
                  selected === i
                    ? "border-secondary bg-secondary/12 text-foreground ring-1 ring-secondary/40"
                    : "border-border bg-background hover:border-secondary/40",
                )}
              >
                {opt[lang]}
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "multi" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options?.map((opt, i) => {
              const arr = Array.isArray(selected) ? selected : [];
              const isNone = q.noneIndex === i;
              const noneSelected = q.noneIndex !== undefined && arr.includes(q.noneIndex);
              const active = arr.includes(i);
              const disabled = noneSelected && !isNone;
              return (
                <button
                  key={opt.en}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => {
                    if (isNone) {
                      onChange({ value: active ? [] : [i] });
                      return;
                    }
                    const next = active ? arr.filter((x) => x !== i) : [...arr, i];
                    onChange({ value: next });
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-start text-sm font-medium transition-colors duration-200 ease-out",
                    active
                      ? "border-secondary bg-secondary/12 ring-1 ring-secondary/40"
                      : "border-border bg-background hover:border-secondary/40",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {opt[lang]}
                </button>
              );
            })}
          </div>
        ) : null}

        {q.type === "scale" ? (
          <div>
            <div className="flex items-stretch gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={selected === n}
                  onClick={() => onChange({ value: n })}
                  className={cn(
                    "flex-1 rounded-xl border py-3 text-sm font-bold tabular-nums transition-colors duration-200 ease-out",
                    selected === n
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border bg-background hover:border-secondary/40",
                  )}
                >
                  {localizeNumber(n, lang)}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between gap-4 text-[11px] leading-snug text-muted-foreground">
              <span className="max-w-[45%]">
                {localizeNumber(1, lang)} = {q.anchors?.low[lang]}
              </span>
              <span className="max-w-[45%] text-end">
                {localizeNumber(5, lang)} = {q.anchors?.high[lang]}
              </span>
            </div>
          </div>
        ) : null}

        {showDetail ? (
          <div className="rise-in mt-3">
            <label className="block text-xs font-semibold text-muted-foreground">
              {q.detailLabel?.[lang] ?? t("q.detail")}
            </label>
            <input
              type={q.detailType === "number" ? "number" : "text"}
              value={answer?.detail ?? ""}
              onChange={(e) => onChange({ value: selected, detail: e.target.value })}
              className="mt-1.5 w-full max-w-sm rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
