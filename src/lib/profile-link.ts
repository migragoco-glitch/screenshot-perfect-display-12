import { AREA_OVERLAYS, type AreaStep } from "./area-flow";
import { localizeNumber, type Lang } from "./i18n";
import { KNOWLEDGE_TABLE, type KnowledgeEntry } from "./roadmap";
import type { GapFlag } from "./scoring";
import type { ScoreSnapshot } from "./store";

export const WEAKNESS_GAP_FLAGS: readonly GapFlag[] = [
  "documents_not_ready", "credential_recognition", "health_profession", "language_weak",
  "finance_thin", "finance_docs", "legal_history", "visa_refusal", "support_network",
  "cultural_adaptation", "employment_gap",
];
export const PROFILE_STEP_IDS = [
  "doc-legalization", "legal-history-advice", "finance-evidence", "budget-plan",
  "oph-recognition", "valvira-health-recognition", "support-buddy",
];

export function isPriorityStep(stepId: string, userGaps: readonly GapFlag[]): boolean {
  const entry = KNOWLEDGE_TABLE.find((item) => item.id === stepId);
  return Boolean(entry?.requires?.some((flag) => WEAKNESS_GAP_FLAGS.includes(flag) && userGaps.includes(flag)));
}

export function adaptRoadmapStep(entry: KnowledgeEntry): AreaStep {
  return {
    id: entry.id, phase: entry.phase, title: entry.title, detail: entry.detail,
    dependency: entry.dependency, completion: entry.completionCondition,
    authority: entry.institution as AreaStep["authority"], sourceUrl: entry.officialSource,
    overlay: AREA_OVERLAYS[entry.id] ?? {}, basedOnAnswers: true, addedFirst: false,
  };
}

export function getProfileSteps(userGaps: readonly GapFlag[]): AreaStep[] {
  return KNOWLEDGE_TABLE.filter((entry) => PROFILE_STEP_IDS.includes(entry.id) &&
    entry.requires?.some((flag) => userGaps.includes(flag))).map(adaptRoadmapStep);
}

export function getRelatedStepsForGap(gapFlag: GapFlag, currentPlanStepIds: readonly string[]): string[] {
  return KNOWLEDGE_TABLE.filter((entry) => currentPlanStepIds.includes(entry.id) &&
    entry.requires?.includes(gapFlag)).map((entry) => entry.id);
}

export function formatScoreDelta(history: readonly ScoreSnapshot[], lang: Lang): string {
  const last = history[history.length - 1];
  const previous = history[history.length - 2];
  if (!last || !previous) return "";
  const delta = last.overall - previous.overall;
  return `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${localizeNumber(Math.abs(delta), lang)}`;
}