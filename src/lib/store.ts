import { useCallback, useEffect, useState } from "react";
import type { AnswerValue, Answers } from "./questions";
import { QUESTIONS } from "./questions";

const KEY = "migrago.state.v1";
const METRICS_KEY = "migrago.metrics.v1";

export type ScoreSnapshot = {
  at: string;
  overall: number;
  legal: number;
  professional: number;
  psychological: number;
};

export type AppState = {
  consent: boolean;
  answers: Answers;
  completed: boolean;
  tier: "free" | "navigator";
  history: ScoreSnapshot[];
  registeredAt?: string;
};

export type Metrics = {
  registrations: { date: string; count: number }[];
  started: number;
  finished: number;
  paywallViews: number;
  upgradeClicks: number;
  checkoutStarted: number;
  checkoutCompleted: number;
  emailCaptures: number;
  countryClicks: Record<string, number>;
  nationalities: Record<string, number>;
  pathways: Record<string, number>;
};

const emptyState: AppState = {
  consent: false,
  answers: {},
  completed: false,
  tier: "free",
  history: [],
};

const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Normalizes a single stored answer against the current question schema. */
function sanitizeAnswer(id: number, raw: unknown): AnswerValue | undefined {
  const q = QUESTION_BY_ID.get(id);
  if (!q) return undefined; // orphaned entry from an older assessment version
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;

  const a = raw as { value?: unknown; detail?: unknown };
  const optionCount = q.options?.length ?? 0;
  const inRange = (n: unknown) =>
    typeof n === "number" && Number.isInteger(n) && n >= 0 && (optionCount === 0 || n < optionCount);

  let value: AnswerValue["value"];
  switch (q.type) {
    case "multi": {
      if (Array.isArray(a.value)) {
        const cleaned = Array.from(new Set(a.value.filter(inRange) as number[])).sort((x, y) => x - y);
        if (cleaned.length > 0) value = cleaned;
      }
      break;
    }
    case "single": {
      if (inRange(a.value)) value = a.value as number;
      break;
    }
    case "scale": {
      if (typeof a.value === "number" && Number.isFinite(a.value) && a.value >= 1 && a.value <= 5) {
        value = a.value;
      }
      break;
    }
    case "number": {
      if (typeof a.value === "number" && Number.isFinite(a.value)) value = a.value;
      break;
    }
    case "text":
    case "country": {
      if (typeof a.value === "string") value = a.value;
      break;
    }
  }

  const detail = typeof a.detail === "string" ? a.detail : undefined;
  if (value === undefined && detail === undefined) return undefined;
  return { ...(value !== undefined ? { value } : {}), ...(detail !== undefined ? { detail } : {}) };
}

/** Rebuilds the answer map so it always matches the current question structure. */
export function sanitizeAnswers(raw: unknown): Answers {
  const out: Answers = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(key);
    if (!Number.isInteger(id)) continue;
    const clean = sanitizeAnswer(id, val);
    if (clean) out[id] = clean;
  }
  return out;
}

/** True when stored answers already match the sanitized structure exactly. */
export function answersAreConsistent(raw: unknown): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  return JSON.stringify(raw) === JSON.stringify(sanitizeAnswers(raw));
}

const seededMetrics: Metrics = {
  registrations: [
    { date: "2026-08", count: 31 },
    { date: "2026-09", count: 68 },
    { date: "2026-10", count: 112 },
    { date: "2026-11", count: 176 },
    { date: "2026-12", count: 254 },
    { date: "2027-01", count: 337 },
  ],

  started: 337,
  finished: 214,
  paywallViews: 189,
  upgradeClicks: 96,
  checkoutStarted: 61,
  checkoutCompleted: 38,
  emailCaptures: 0,
  countryClicks: { Germany: 74, Canada: 58, Sweden: 41, Netherlands: 22 },
  nationalities: { Iran: 88, India: 47, Nigeria: 33, Türkiye: 29, Vietnam: 17 },
  pathways: { Work: 121, Study: 54, Startup: 26, "Financial self-sufficiency": 8, "Digital nomad": 5 },
};

function read(): AppState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState;
    return { ...emptyState, ...(JSON.parse(raw) as AppState) };
  } catch {
    return emptyState;
  }
}

function write(state: AppState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("migrago:state"));
}

export function readMetrics(): Metrics {
  if (typeof window === "undefined") return seededMetrics;
  try {
    const raw = window.localStorage.getItem(METRICS_KEY);
    if (!raw) return seededMetrics;
    return { ...seededMetrics, ...(JSON.parse(raw) as Metrics) };
  } catch {
    return seededMetrics;
  }
}

export type MetricEvent =
  | { type: "start" }
  | { type: "finish"; nationality?: string; pathway?: string }
  | { type: "paywall_view" }
  | { type: "upgrade_click" }
  | { type: "checkout_started" }
  | { type: "checkout_completed" }
  | { type: "email_captured" }
  | { type: "country_click"; country: string };

export function trackEvent(e: MetricEvent) {
  if (typeof window === "undefined") return;
  const m = readMetrics();
  switch (e.type) {
    case "start":
      m.started += 1;
      break;
    case "finish":
      m.finished += 1;
      if (e.nationality) m.nationalities[e.nationality] = (m.nationalities[e.nationality] ?? 0) + 1;
      if (e.pathway) m.pathways[e.pathway] = (m.pathways[e.pathway] ?? 0) + 1;
      break;
    case "paywall_view":
      m.paywallViews += 1;
      break;
    case "upgrade_click":
      m.upgradeClicks += 1;
      break;
    case "checkout_started":
      m.checkoutStarted += 1;
      break;
    case "checkout_completed":
      m.checkoutCompleted += 1;
      break;
    case "email_captured":
      m.emailCaptures += 1;
      break;
    case "country_click":
      m.countryClicks[e.country] = (m.countryClicks[e.country] ?? 0) + 1;
      break;
  }
  window.localStorage.setItem(METRICS_KEY, JSON.stringify(m));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const sync = () => setState(read());
    window.addEventListener("migrago:state", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("migrago:state", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<AppState>) => {
    const next = { ...read(), ...patch };
    write(next);
    setState(next);
  }, []);

  const setAnswer = useCallback((id: number, value: AnswerValue) => {
    const current = read();
    const next: AppState = {
      ...current,
      answers: { ...current.answers, [id]: { ...current.answers[id], ...value } },
      registeredAt: current.registeredAt ?? new Date().toISOString(),
    };
    write(next);
    setState(next);
  }, []);

  const pushSnapshot = useCallback((snap: Omit<ScoreSnapshot, "at">) => {
    const current = read();
    const last = current.history[current.history.length - 1];
    if (last && last.overall === snap.overall && last.legal === snap.legal) return;
    const next: AppState = {
      ...current,
      history: [...current.history, { at: new Date().toISOString(), ...snap }].slice(-12),
    };
    write(next);
    setState(next);
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(KEY);
    write(emptyState);
    setState(emptyState);
  }, []);

  return { state, hydrated, update, setAnswer, pushSnapshot, reset };
}

// --- Real vs simulated data separation (founder dashboard) ---
// `seededMetrics` is demo/simulated baseline data. Real pilot activity is the
// delta between what is stored locally and that baseline.
export const simulatedBaseline: Metrics = seededMetrics;

function diffRecord(all: Record<string, number>, base: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(all)) {
    const real = v - (base[k] ?? 0);
    if (real > 0) out[k] = real;
  }
  return out;
}

/** Metrics with all simulated baseline numbers removed. */
export function readRealMetrics(): Metrics {
  const all = readMetrics();
  const sub = (a: number, b: number) => Math.max(0, a - b);
  return {
    registrations: [],
    started: sub(all.started, seededMetrics.started),
    finished: sub(all.finished, seededMetrics.finished),
    paywallViews: sub(all.paywallViews, seededMetrics.paywallViews),
    upgradeClicks: sub(all.upgradeClicks, seededMetrics.upgradeClicks),
    checkoutStarted: sub(all.checkoutStarted, seededMetrics.checkoutStarted),
    checkoutCompleted: sub(all.checkoutCompleted, seededMetrics.checkoutCompleted),
    emailCaptures: sub(all.emailCaptures, seededMetrics.emailCaptures),
    countryClicks: diffRecord(all.countryClicks, seededMetrics.countryClicks),
    nationalities: diffRecord(all.nationalities, seededMetrics.nationalities),
    pathways: diffRecord(all.pathways, seededMetrics.pathways),
  };
}
