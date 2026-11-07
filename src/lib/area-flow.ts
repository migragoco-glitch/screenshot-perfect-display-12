import type { Answers, Bilingual } from "./questions";
import { en, fa, type Lang, type TKey } from "./i18n";
import { KNOWLEDGE_TABLE } from "./roadmap";

export type AreaId = "status" | "id" | "bank" | "kela" | "housing" | "family";
export type Route = "eu" | "nordic" | "noneu";
export function suggestRoute(country: unknown): Route | undefined {
  if (typeof country !== "string" || !country.trim()) return undefined;
  if (["Finland", "Other", "United Kingdom"].includes(country)) return undefined;
  if (["Denmark", "Iceland", "Norway", "Sweden"].includes(country)) return "nordic";
  if (["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Estonia", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Liechtenstein", "Switzerland"].includes(country)) return "eu";
  return "noneu";
}
export const MUNICIPALITIES = ["Helsinki", "Espoo", "Vantaa", "Tampere", "Turku", "Oulu", "Jyväskylä", "Kuopio", "Lahti", "Other municipality"] as const;
export const AREAS: { id: AreaId; title: TKey; description: TKey; sourceUrl: string; questions: number[] }[] = [
  { id: "status", title: "start.area.status.title", description: "start.area.status.description", sourceUrl: "https://migri.fi/en/registration-of-right-of-residence", questions: [2] },
  { id: "id", title: "start.area.id.title", description: "start.area.id.description", sourceUrl: "https://dvv.fi/en/foreigner-registration", questions: [37] },
  { id: "bank", title: "start.area.bank.title", description: "start.area.bank.description", sourceUrl: "https://infofinland.fi/en/settling-in-finland/everyday-life-in-finland", questions: [] },
  { id: "kela", title: "start.area.kela.title", description: "start.area.kela.description", sourceUrl: "https://www.kela.fi/moving-to-finland", questions: [7, 37] },
  { id: "housing", title: "start.area.housing.title", description: "start.area.housing.description", sourceUrl: "https://infofinland.fi/en/housing/rental-home/tenancy-agreement", questions: [] },
  { id: "family", title: "start.area.family.title", description: "start.area.family.description", sourceUrl: "https://dvv.fi/en/family-relationships-and-marital-status", questions: [7, 8] },
];

/** Derive only the explicitly supplied answers, without scored-profile defaults. */
export function computeAreaFlags(answers: Answers) {
  const relocating = Array.isArray(answers[8]?.value) ? answers[8].value : [];
  const ages = Array.isArray(answers[7]?.subValue) ? answers[7].subValue : [];
  const children = answers[7]?.value === 1 || relocating.includes(2);
  return {
    children,
    children_age_under3: ages.includes(0),
    children_age_3_6: ages.includes(1),
    children_age_7_15: ages.includes(2),
    children_age_16_17: ages.includes(3),
    children_age_unknown: children && !ages.some((age) => [0, 1, 2, 3].includes(age)),
    family_relocation: relocating.some((value) => value === 1 || value === 3),
    kela_relevant: answers[7]?.value === 1 || relocating.some((value) => [1, 2, 3].includes(value)),
  };
}

export type AreaOverlay = {
  phase?: number;
  completion?: TKey;
  deadline?: TKey;
  documents?: TKey[];
  note?: TKey;
  sourceUrl?: string;
  lastChecked: "2026-11-06";
};
const checked = "2026-11-06";
export const AREA_OVERLAYS: Record<string, AreaOverlay> = {
  "eu-registration": { phase: 1, lastChecked: checked, deadline: "start.step.eu-registration.deadline", documents: ["start.step.eu-registration.doc1", "start.step.eu-registration.doc2"], note: "start.step.eu-registration.note", completion: "start.step.eu-registration.completion", sourceUrl: "https://migri.fi/en/registration-of-right-of-residence" },
  "migri-permit": { lastChecked: checked, note: "start.step.migri-permit.note", sourceUrl: "https://migri.fi/en/processing-fees-and-payment-methods" },
  "strong-id": { phase: 2, lastChecked: checked, documents: ["start.step.strong-id.doc1", "start.step.strong-id.doc2"], note: "start.step.strong-id.note", completion: "start.step.strong-id.completion", sourceUrl: "https://infofinland.fi/en/settling-in-finland/everyday-life-in-finland" },
  "find-home": { phase: 1, lastChecked: checked, note: "start.step.find-home.note", completion: "start.step.find-home.completion", sourceUrl: "https://infofinland.fi/en/housing/rental-home/tenancy-agreement" },
  "dvv-id-code": { lastChecked: checked, documents: ["start.step.dvv-id-code.doc1", "start.step.dvv-id-code.doc2", "start.step.dvv-id-code.doc3"], sourceUrl: "https://dvv.fi/en/foreigner-registration" },
  "dvv-family": { lastChecked: checked, documents: ["start.step.dvv-family.doc1", "start.step.dvv-family.doc2", "start.step.dvv-family.doc3"], sourceUrl: "https://dvv.fi/en/family-relationships-and-marital-status" },
  "early-childhood-education": { lastChecked: checked, deadline: "start.step.early-childhood-education.deadline", sourceUrl: "https://infofinland.fi/en/education/early-childhood-education" },
  "pre-primary-education": { lastChecked: checked },
  "compulsory-school": { lastChecked: checked },
  "upper-secondary-education": { lastChecked: checked },
  "school-daycare": { lastChecked: checked },
  "kela-social": { lastChecked: checked, documents: ["start.step.kela-social.doc1", "start.step.kela-social.doc2", "start.step.kela-social.doc3"], note: "start.step.kela-social.note", sourceUrl: "https://www.kela.fi/moving-to-finland" },
  "health-registration": { lastChecked: checked, note: "start.step.health-registration.note", sourceUrl: "https://www.suomi.fi/guides/work-in-finland/when-you-arrive/check-what-support-and-health-services-you-can-receive-in-finland" },
  "municipality-of-residence": { phase: 1, completion: "start.step.municipality-of-residence.completion", lastChecked: checked, note: "start.step.municipality-of-residence.note", sourceUrl: "https://dvv.fi/en/municipality-of-residence" },
  "temporary-address": { phase: 1, completion: "start.step.temporary-address.completion", lastChecked: checked, note: "start.step.temporary-address.note", sourceUrl: "https://dvv.fi/en/international-moving" },
  "move-notification": { phase: 1, completion: "start.step.move-notification.completion", lastChecked: checked, deadline: "start.step.move-notification.deadline", sourceUrl: "https://dvv.fi/en/moving-in-finland" },
  "bank-account": { phase: 1, completion: "start.step.bank-account.completion", lastChecked: checked, documents: ["start.step.bank-account.documents"], note: "start.step.bank-account.note", sourceUrl: "https://infofinland.fi/en/settling-in-finland/everyday-life-in-finland" },
};

type Authority = "DVV" | "Kela" | "Bank" | "Local municipality services" | "Municipal health services" | "Migri" | "Landlord or housing provider";
const AUTHORITY_OVERRIDES: Record<string, Authority> = {
  "early-childhood-education": "Local municipality services",
  "pre-primary-education": "Local municipality services",
  "compulsory-school": "Local municipality services",
  "upper-secondary-education": "Local municipality services",
  "school-daycare": "Local municipality services",
};
export type AreaStep = {
  phase: number;
  dependency?: Bilingual;
  completion?: Bilingual;
  id: string;
  title: Bilingual | TKey;
  detail?: Bilingual;
  authority: Authority;
  sourceUrl: string;
  overlay: AreaOverlay;
  basedOnAnswers: boolean;
  addedFirst: boolean;
};
const NEW_STEPS: Record<string, { title: TKey; authority: Authority }> = {
  "eu-registration": { title: "start.step.eu-registration.title", authority: "Migri" },
  "strong-id": { title: "start.step.strong-id.title", authority: "Bank" },
  "find-home": { title: "start.step.find-home.title", authority: "Landlord or housing provider" },
  "municipality-of-residence": { title: "start.step.municipality-of-residence.title", authority: "DVV" },
  "temporary-address": { title: "start.step.temporary-address.title", authority: "DVV" },
  "move-notification": { title: "start.step.move-notification.title", authority: "DVV" },
  "bank-account": { title: "start.step.bank-account.title", authority: "Bank" },
};
const FAMILY_IDS = ["dvv-family", "early-childhood-education", "pre-primary-education", "compulsory-school", "upper-secondary-education", "school-daycare"];
const ORDER = ["eu-registration", "migri-permit", "dvv-id-code", "municipality-of-residence", "temporary-address", "move-notification", "find-home", "bank-account", "strong-id", "kela-social", "health-registration", ...FAMILY_IDS];

export function formatCheckedDate(iso: string, lang: Lang): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return lang === "fa"
    ? new Intl.DateTimeFormat("fa-IR-u-ca-gregory", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date)
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export const TITLE_OVERRIDES: Record<string, Bilingual> = {
  "dvv-id-code": { en: "Get your Finnish personal identity code", fa: "دریافت کد شناسایی شخصی فنلاند" },
};

export const STEP_AREA: Record<string, AreaId> = {
  "eu-registration": "status", "migri-permit": "status", "strong-id": "bank", "find-home": "housing",
  "dvv-id-code": "id", "municipality-of-residence": "id", "temporary-address": "id", "move-notification": "id",
  "bank-account": "bank", "kela-social": "kela", "health-registration": "kela",
  "dvv-family": "family", "early-childhood-education": "family", "pre-primary-education": "family",
  "compulsory-school": "family", "upper-secondary-education": "family", "school-daycare": "family",
};

export function buildAreaSteps(areas: readonly AreaId[], answers: Answers, route?: Route): AreaStep[] {
  const flags = computeAreaFlags(answers);
  const selected = new Map<string, { basedOnAnswers: boolean; addedFirst: boolean }>();
  const add = (id: string, basedOnAnswers = false, addedFirst = false) => {
    const existing = selected.get(id);
    if (!existing) selected.set(id, { basedOnAnswers, addedFirst });
  };
  const shortStay = answers[37]?.value === 0;
  if (areas.includes("status")) {
    if (route === "eu") add("eu-registration", true);
    if (route === "noneu") add("migri-permit", true);
    if (route === "nordic") add("dvv-id-code", true);
  }
  if (areas.includes("id")) {
    add("dvv-id-code");
    add(shortStay ? "temporary-address" : "municipality-of-residence", answers[37]?.value !== undefined);
    add("move-notification");
  }
  if (areas.includes("bank")) {
    add("bank-account");
    add("strong-id");
  }
  if (areas.includes("housing")) add("find-home");
  if (areas.includes("kela")) {
    add("kela-social");
    add("health-registration");
  }
  if (areas.includes("family")) {
    for (const id of FAMILY_IDS) {
      const entry = KNOWLEDGE_TABLE.find((item) => item.id === id);
      const matches = entry?.requires?.some((flag) => flag in flags && flags[flag as keyof typeof flags]);
      if (matches || (id === "dvv-family" && flags.children)) add(id, true);
    }
  }
  for (const id of [...selected.keys()]) {
    if (id === "strong-id") { add("bank-account", false, true); add("dvv-id-code", false, true); }
    if (id === "kela-social") { add("dvv-id-code", false, true); add("bank-account", false, true); }
    if (id === "health-registration" && !shortStay) add("municipality-of-residence", false, true);
    if (["dvv-family", "municipality-of-residence", "temporary-address", "move-notification"].includes(id)) add("dvv-id-code", false, true);
  }
  // Health registration may inject a municipality after the first dependency pass.
  if (selected.has("municipality-of-residence")) add("dvv-id-code", false, true);
  return ORDER.flatMap((id): AreaStep[] => {
    const tags = selected.get(id);
    if (!tags) return [];
    const overlay = AREA_OVERLAYS[id];
    if (!overlay) return [];
    const entry = KNOWLEDGE_TABLE.find((item) => item.id === id);
    const fresh = NEW_STEPS[id];
    if (entry) return [{ id, title: TITLE_OVERRIDES[id] ?? entry.title, detail: entry.detail, phase: entry.phase, dependency: entry.dependency, completion: entry.completionCondition, authority: AUTHORITY_OVERRIDES[id] ?? entry.institution as Authority, sourceUrl: overlay.sourceUrl ?? entry.officialSource, overlay, ...tags }];
    if (fresh && overlay.sourceUrl) return [{ id, ...fresh, phase: overlay.phase ?? 1, ...(overlay.completion ? { completion: { en: en[overlay.completion], fa: fa[overlay.completion] } } : {}), sourceUrl: overlay.sourceUrl, overlay, ...tags }];
    return [];
  }).sort((a, b) => a.phase - b.phase || ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
}

export function earlyChildhoodLocalUrl(municipality?: string): string | undefined {
  if (municipality === "Vantaa") return "https://www.vantaa.fi/en/education-and-learning/early-childhood-education/applying-early-childhood-education";
  if (municipality === "Jyväskylä") return "https://www.jyvaskyla.fi/en/daycare-and-education/childrens-daycare-and-preschool-education/applying-early-childhood-education-and-pre-primary-education";
  return undefined;
}
export function planWeeks(steps: AreaStep[]): number {
  return steps.length === 0 ? 0 : 3 * Math.max(...steps.map((step) => step.phase));
}

export function weeksRange(phase: number): [number, number] {
  return [3 * (phase - 1) + 1, 3 * phase];
}

export function documentsForSteps(steps: AreaStep[]): { id: string; title: Bilingual | TKey; documents: TKey[] }[] {
  return steps.flatMap((step) => step.overlay.documents?.length ? [{ id: step.id, title: step.title, documents: step.overlay.documents }] : []);
}
