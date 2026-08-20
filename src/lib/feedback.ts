import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const SESSION_ID_KEY = "migrago.sid";

export function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export const emailSchema = z
  .string()
  .trim()
  .min(5)
  .max(255)
  .email();

export type ValidationSignals = {
  founders_circle: number;
  csat_total: number;
  csat_positive: number;
  nps_total: number;
  nps_avg: number;
  nps_promoters: number;
  nps_detractors: number;
};

const EMPTY_SIGNALS: ValidationSignals = {
  founders_circle: 0,
  csat_total: 0,
  csat_positive: 0,
  nps_total: 0,
  nps_avg: 0,
  nps_promoters: 0,
  nps_detractors: 0,
};

export async function fetchValidationSignals(): Promise<ValidationSignals> {
  const { data, error } = await supabase.rpc("validation_signals");
  if (error || !data) return EMPTY_SIGNALS;
  return { ...EMPTY_SIGNALS, ...(data as unknown as ValidationSignals) };
}

export async function submitCsat(positive: boolean) {
  await supabase.from("csat_responses").insert({ session_id: sessionId(), positive });
}

export async function submitNps(score: number, comment: string) {
  const clean = comment.trim().slice(0, 1000);
  await supabase.from("nps_responses").insert({
    session_id: sessionId(),
    score,
    comment: clean.length ? clean : null,
  });
}

export async function joinFoundersCircle(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false as const, reason: "invalid" as const };
  const { error } = await supabase
    .from("founders_circle_signups")
    .insert({ email: parsed.data.toLowerCase() });
  // A duplicate email still means the person is on the list.
  if (error && error.code !== "23505") return { ok: false as const, reason: "failed" as const };
  return { ok: true as const };
}

export async function fetchRoadmapProgress(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("roadmap_progress")
    .select("task_id")
    .eq("completed", true);
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.task_id));
}

export async function setRoadmapTask(userId: string, taskId: string, completed: boolean) {
  await supabase
    .from("roadmap_progress")
    .upsert(
      { user_id: userId, task_id: taskId, completed, updated_at: new Date().toISOString() },
      { onConflict: "user_id,task_id" },
    );
}
