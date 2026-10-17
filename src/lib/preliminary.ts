import type { Answers } from "./questions";
import { subAnswerIndex, QUESTIONS } from "./questions";

/**
 * Preliminary ("Quick Check") result logic — deliberately isolated from
 * computeProfile in scoring.ts. It uses ONLY the answers actually provided
 * in the quick check and never produces a full-assessment score, strengths,
 * weaknesses, or risk flags. Missing answers map to "unknown", never to zero.
 */

/** Existing question IDs reused by the quick check. Do not renumber. */
export const QUICK_CHECK_IDS = [36, 8, 7, 34, 15, 22] as const;

export const QUICK_CHECK_QUESTIONS = QUICK_CHECK_IDS.map(
  (id) => QUESTIONS.find((q) => q.id === id)!,
);

export type PreliminaryBand = "ready" | "partial" | "unknown";

export type PreliminaryActionKey =
  | "qc.actionPathway"
  | "qc.actionDocuments"
  | "qc.actionLanguage"
  | "qc.actionFinances"
  | "qc.actionChildren";

export type PreliminaryResult = {
  /** Q36 option index, or null when not answered. */
  pathwayIndex: number | null;
  documents: PreliminaryBand;
  language: PreliminaryBand;
  finances: PreliminaryBand;
  /** i18n keys for indicative initial actions, derived only from answers given. */
  actionKeys: PreliminaryActionKey[];
};

export function computePreliminary(answers: Answers): PreliminaryResult {
  const pathway = answers[36]?.value;
  const pathwayIndex = typeof pathway === "number" ? pathway : null;

  const docValue = answers[34]?.value;
  const documents: PreliminaryBand =
    typeof docValue !== "number" ? "unknown" : docValue >= 4 ? "ready" : "partial";

  const q15 = QUESTIONS.find((q) => q.id === 15)!;
  const english = answers[15]?.value;
  const finnishSwedish = subAnswerIndex(q15, answers[15]);
  const language: PreliminaryBand =
    typeof english !== "number"
      ? "unknown"
      : english >= 2 || (finnishSwedish !== undefined && finnishSwedish >= 2)
        ? "ready"
        : "partial";

  const runway = answers[22]?.value;
  const finances: PreliminaryBand =
    typeof runway !== "number" ? "unknown" : runway >= 2 ? "ready" : "partial";

  const actionKeys: PreliminaryActionKey[] = [];
  if (pathwayIndex === null || pathwayIndex === 5) actionKeys.push("qc.actionPathway");
  if (documents !== "ready") actionKeys.push("qc.actionDocuments");
  if (language !== "ready") actionKeys.push("qc.actionLanguage");
  if (finances !== "ready") actionKeys.push("qc.actionFinances");
  if (answers[7]?.value === 1) actionKeys.push("qc.actionChildren");

  return { pathwayIndex, documents, language, finances, actionKeys };
}
