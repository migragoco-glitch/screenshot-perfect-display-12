import { useEffect, useState } from "react";
import {
  Banknote,
  Briefcase,
  Building2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Stamp,
  Users,
  X,
} from "lucide-react";
import type { Institution } from "@/lib/roadmap";
import { localizeNumber, useI18n } from "@/lib/i18n";
import {
  fetchValidationSignals,
  joinFoundersCircle,
  submitCsat,
  submitNps,
} from "@/lib/feedback";

const CSAT_KEY = "migrago.csat.done";
const NPS_KEY = "migrago.nps.done";

export const INSTITUTION_ICONS: Record<Institution, typeof Building2> = {
  Migri: Stamp,
  DVV: Landmark,
  Vero: Banknote,
  Kela: HeartPulse,
  "TE Services": Briefcase,
  "Valvira / OPH": GraduationCap,
  "International House Helsinki": Users,
  "Municipal health services": HeartPulse,
};

export function InstitutionBadge({ institution }: { institution: Institution }) {
  const { t } = useI18n();
  const Icon = INSTITUTION_ICONS[institution] ?? Building2;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/12 px-2.5 py-0.5 text-secondary">
      <Icon className="size-3" aria-hidden />
      <span className="sr-only">{t("road.institution")}: </span>
      {institution}
    </span>
  );
}

/** 3a — one-tap accuracy signal, shown once per completed assessment. */
export function CsatWidget() {
  const { t } = useI18n();
  const [state, setState] = useState<"hidden" | "asking" | "thanks">("hidden");

  useEffect(() => {
    if (window.localStorage.getItem(CSAT_KEY) !== "1") setState("asking");
  }, []);

  if (state === "hidden") return null;

  const answer = (positive: boolean) => {
    window.localStorage.setItem(CSAT_KEY, "1");
    setState("thanks");
    void submitCsat(positive);
  };

  return (
    <section className="rise-in rounded-3xl border border-secondary/30 bg-secondary/5 p-5">
      {state === "thanks" ? (
        <p className="text-sm font-semibold text-secondary">{t("csat.thanks")}</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold">{t("csat.q")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("csat.sub")}</p>
            </div>
            <button
              type="button"
              aria-label={t("common.close")}
              onClick={() => {
                window.localStorage.setItem(CSAT_KEY, "1");
                setState("hidden");
              }}
              className="rounded-full p-1 text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => answer(true)}
              className="rounded-full bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground"
            >
              {t("csat.yes")}
            </button>
            <button
              type="button"
              onClick={() => answer(false)}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
            >
              {t("csat.no")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/** 4 — Founder's Circle email capture with a real, live signup counter. */
export function FoundersCircleModal({
  open,
  onClose,
  onJoined,
}: {
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}) {
  const { t, lang } = useI18n();
  const [count, setCount] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetchValidationSignals().then((s) => setCount(s.founders_circle));
  }, [open]);

  if (!open) return null;

  const full = count !== null && count >= 100;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await joinFoundersCircle(email);
    setBusy(false);
    if (!res.ok) {
      setError(t("pay.emailInvalid"));
      return;
    }
    setDone(true);
    window.setTimeout(onJoined, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="rise-in w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{t("pay.emailTitle")}</h2>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {full ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("pay.counterFull")}</p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t("pay.emailSub")}</p>
        )}

        {count !== null ? (
          <p
            className="mt-4 rounded-2xl px-4 py-2.5 text-xs font-semibold"
            style={{ background: "var(--plum)", color: "oklch(0.97 0.006 85)" }}
          >
            {full
              ? `${localizeNumber(count, lang)} ${t("pay.counter")}`
              : `${localizeNumber(100 - count, lang)} ${t("pay.counterSpots")} · ${localizeNumber(count, lang)} ${t("pay.counter")}`}
          </p>
        ) : null}

        {done ? (
          <p className="mt-5 text-sm font-semibold text-secondary">{t("pay.emailThanks")}</p>
        ) : (
          <>
            <label className="mt-5 block text-xs font-semibold text-muted-foreground">
              {t("pay.emailLabel")}
            </label>
            <input
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {error ? <p className="mt-2 text-xs font-semibold text-destructive">{error}</p> : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="mt-4 w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground disabled:opacity-40"
            >
              {t("pay.emailCta")}
            </button>
            <button
              type="button"
              onClick={onJoined}
              className="mt-3 w-full text-xs font-semibold text-muted-foreground underline underline-offset-4"
            >
              {t("pay.emailSkip")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** 8 — End-of-experience NPS survey, shown once after the roadmap is visible. */
export function NpsSurvey() {
  const { t, lang } = useI18n();
  const [state, setState] = useState<"hidden" | "asking" | "thanks">("hidden");
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem(NPS_KEY) !== "1") setState("asking");
  }, []);

  if (state === "hidden") return null;

  const send = () => {
    if (score === null) return;
    window.localStorage.setItem(NPS_KEY, "1");
    setState("thanks");
    void submitNps(score, comment);
  };

  return (
    <section className="rise-in mt-6 rounded-3xl border border-border bg-card p-6">
      {state === "thanks" ? (
        <p className="text-sm font-semibold text-secondary">{t("nps.thanks")}</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold">{t("nps.title")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("nps.sub")}</p>
            </div>
            <button
              type="button"
              aria-label={t("common.close")}
              onClick={() => {
                window.localStorage.setItem(NPS_KEY, "1");
                setState("hidden");
              }}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, n) => (
              <button
                key={n}
                type="button"
                aria-pressed={score === n}
                onClick={() => setScore(n)}
                className={
                  score === n
                    ? "size-9 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                    : "size-9 rounded-xl border border-border bg-background text-xs font-semibold transition-colors duration-200 ease-out hover:bg-muted"
                }
              >
                {localizeNumber(n, lang)}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            {t("nps.comment")}
          </label>
          <textarea
            value={comment}
            maxLength={1000}
            rows={3}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            disabled={score === null}
            onClick={send}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {t("nps.submit")}
          </button>
        </>
      )}
    </section>
  );
}
