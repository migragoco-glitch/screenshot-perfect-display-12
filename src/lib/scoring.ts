import { QUESTIONS, type Answers, type Bilingual, type Question } from "./questions";

export const BUCKETS = {
  legal: { ids: [1, 2, 3, 4, 5, 6, 7, 8, 30, 31, 32, 33, 34], weight: 30 },
  professional: { ids: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], weight: 40 },
  psychological: { ids: [24, 25, 26, 27, 28, 29, 35, 36, 37, 38], weight: 30 },
  bonus: { ids: [39, 40, 41, 42], weight: 0 },
} as const;

export type Profile = {
  overall: number;
  legal: number;
  professional: number;
  psychological: number;
  bonus: number;
  gaps: GapFlag[];
  strengths: Bilingual[];
  weaknesses: Bilingual[];
};

export type GapFlag =
  | "documents_not_ready"
  | "credential_recognition"
  | "language_weak"
  | "finance_thin"
  | "finance_docs"
  | "legal_history"
  | "visa_refusal"
  | "support_network"
  | "cultural_adaptation"
  | "employment_gap"
  | "family_relocation"
  | "children"
  | "study_path"
  | "startup_path"
  | "talent_track"
  | "urgent_timeline";

function num(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
}

/** normalized 0..1 score for one question, or undefined when it doesn't score */
export function questionScore(q: Question, answers: Answers): number | undefined {
  if (q.unscored) return undefined;
  const a = answers[q.id];
  if (!a) return undefined;

  if (q.type === "scale") {
    const v = num(a.value);
    return v === undefined ? undefined : Math.min(1, Math.max(0, (v - 1) / 4));
  }

  if (q.type === "number") {
    const v = num(a.value);
    if (v === undefined) return undefined;
    if (q.id === 1) {
      if (v >= 18 && v <= 35) return 1;
      if (v <= 45) return 0.85;
      if (v <= 55) return 0.6;
      return 0.4;
    }
    return 0.6;
  }

  if (q.type === "single") {
    const v = num(a.value);
    if (v === undefined || !q.optionScores) return undefined;
    return q.optionScores[v] ?? undefined;
  }

  if (q.type === "multi") {
    const arr = Array.isArray(a.value) ? a.value : [];
    if (!arr.length || !q.optionScores) return undefined;
    const scores = arr.map((i) => q.optionScores?.[i] ?? 0.5);
    return scores.reduce((s, n) => s + n, 0) / scores.length;
  }

  return undefined;
}

function bucketScore(ids: readonly number[], answers: Answers) {
  const values: number[] = [];
  for (const id of ids) {
    const q = QUESTIONS.find((x) => x.id === id);
    if (!q) continue;
    if (q.showIf && !q.showIf(answers)) continue;
    const s = questionScore(q, answers);
    if (s !== undefined) values.push(s);
  }
  if (!values.length) return 0;
  return Math.round((values.reduce((s, n) => s + n, 0) / values.length) * 100);
}

const L = (en: string, fa: string): Bilingual => ({ en, fa });

export function computeProfile(answers: Answers): Profile {
  const legal = bucketScore(BUCKETS.legal.ids, answers);
  const professional = bucketScore(BUCKETS.professional.ids, answers);
  const psychological = bucketScore(BUCKETS.psychological.ids, answers);
  const bonus = bucketScore(BUCKETS.bonus.ids, answers);
  const overall = Math.round(legal * 0.3 + professional * 0.4 + psychological * 0.3);

  const gaps: GapFlag[] = [];
  const strengths: Bilingual[] = [];
  const weaknesses: Bilingual[] = [];

  const val = (id: number) => num(answers[id]?.value);
  const multi = (id: number) => (Array.isArray(answers[id]?.value) ? (answers[id]?.value as number[]) : []);

  if ((val(34) ?? 3) <= 3) {
    gaps.push("documents_not_ready");
    weaknesses.push(
      L(
        "Identity documents are not yet fully translated, notarized or apostilled.",
        "مدارک هویتی شما هنوز به‌طور کامل ترجمهٔ رسمی، تأیید و آپوستیل نشده است.",
      ),
    );
  } else {
    strengths.push(L("Your identity documents are essentially ready.", "مدارک هویتی شما در عمل آماده است."));
  }

  if (val(14) === 0 || val(14) === 2) {
    gaps.push("credential_recognition");
    weaknesses.push(
      L(
        "Your profession likely needs formal credential recognition in Finland.",
        "حرفهٔ شما احتمالاً نیازمند تأیید رسمی مدارک در فنلاند است.",
      ),
    );
  }

  if ((val(15) ?? 3) <= 3) {
    gaps.push("language_weak");
    weaknesses.push(
      L(
        "English proficiency is below the level most Finnish employers expect.",
        "سطح انگلیسی شما پایین‌تر از انتظار اکثر کارفرمایان فنلاندی است.",
      ),
    );
  } else {
    strengths.push(L("Strong working English proficiency.", "تسلط کاری قوی بر زبان انگلیسی."));
  }

  if ((val(22) ?? 4) <= 2 || (val(21) ?? 4) <= 1) {
    gaps.push("finance_thin");
    weaknesses.push(
      L(
        "Your financial runway in Finland is short — cost planning is a priority.",
        "توان مالی شما برای دورهٔ اولیه در فنلاند کوتاه است — برنامه‌ریزی هزینه در اولویت است.",
      ),
    );
  } else {
    strengths.push(L("Adequate financial runway for the settling-in period.", "توان مالی کافی برای دورهٔ استقرار."));
  }

  if ((val(20) ?? 0) >= 1) gaps.push("finance_docs");
  if (val(33) === 1) gaps.push("legal_history");
  if (val(31) === 1) gaps.push("visa_refusal");
  if ((val(26) ?? 3) <= 2) {
    gaps.push("support_network");
    weaknesses.push(
      L("Limited emotional support network at destination.", "شبکهٔ حمایت عاطفی محدود در کشور مقصد."),
    );
  }
  if ((val(25) ?? 3) <= 3) gaps.push("cultural_adaptation");
  if (val(13) === 4) gaps.push("employment_gap");
  if (multi(8).some((i) => i === 1 || i === 3)) gaps.push("family_relocation");
  if (val(7) === 1 || multi(8).includes(2)) gaps.push("children");
  if (val(36) === 1) gaps.push("study_path");
  if (val(36) === 2) gaps.push("startup_path");
  if ((val(38) ?? 2) <= 1) gaps.push("urgent_timeline");
  if (bonus >= 70) {
    gaps.push("talent_track");
    strengths.push(
      L(
        "Founder/talent signals qualify you for fast-track content.",
        "نشانه‌های کارآفرینی و استعداد، محتوای مسیر سریع را برای شما فعال می‌کند.",
      ),
    );
  }

  if ((val(24) ?? 3) >= 4)
    strengths.push(L("High resilience under ambiguity.", "تاب‌آوری بالا در شرایط مبهم."));
  if ((val(12) ?? 0) >= 3)
    strengths.push(L("Deep professional experience in your field.", "تجربهٔ حرفه‌ای عمیق در حوزهٔ تخصصی شما."));

  return { overall, legal, professional, psychological, bonus, gaps, strengths, weaknesses };
}

export function analysisSummary(p: Profile): Bilingual {
  const band =
    p.overall >= 75
      ? L(
          "Your profile is strong and close to action-ready. The main task is sequencing: complete the administrative foundation first, then convert your professional profile into Finnish-market form.",
          "پروفایل شما قوی و نزدیک به آمادگی اجرایی است. کار اصلی، چینش درست گام‌ها است: نخست بنیاد اداری را کامل کنید و سپس پروفایل حرفه‌ای خود را به شکل قابل‌پذیرش بازار فنلاند دربیاورید.",
        )
      : p.overall >= 55
        ? L(
            "Your profile is viable with clear, fixable gaps. Prioritizing documentation and financial evidence will move your readiness up the fastest.",
            "پروفایل شما قابل‌اتکاست و شکاف‌های آن مشخص و قابل رفع است. اولویت‌دادن به مستندسازی و شواهد مالی، سریع‌ترین بهبود آمادگی شما را رقم می‌زند.",
          )
        : L(
            "Your profile needs foundational work before applying. Start with documents, financial evidence and language, and re-run this assessment as each improves.",
            "پروفایل شما پیش از اقدام به کارهای بنیادی نیاز دارد. از مدارک، شواهد مالی و زبان آغاز کنید و با بهبود هر مورد، این ارزیابی را دوباره اجرا کنید.",
          );
  return band;
}
