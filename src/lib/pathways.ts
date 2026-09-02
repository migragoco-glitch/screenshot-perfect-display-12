import type { Bilingual } from "./questions";
import type { GapFlag, Profile } from "./scoring";
import { KNOWLEDGE_TABLE, type Institution, type RoadmapItem } from "./roadmap";

/**
 * Gap → pathway mapping table. Every entry is tied to a gap flag that the
 * scoring engine derives from the 42-question assessment, so nothing here is
 * invented at runtime.
 */
export type GapEntry = {
  flag: GapFlag;
  priority: "high" | "medium" | "low";
  institution: Institution;
  gap: Bilingual;
  why: Bilingual;
  action: Bilingual;
};

export const GAP_CATALOG: GapEntry[] = [
  {
    flag: "documents_not_ready",
    priority: "high",
    institution: "Migri",
    gap: { en: "Core documents are not legalized yet", fa: "مدارک اصلی هنوز قانونی‌سازی نشده‌اند" },
    why: {
      en: "Finnish authorities only accept translated, notarized and apostilled documents; every later step depends on them.",
      fa: "مراجع فنلاندی تنها مدارک ترجمه‌شده، تأییدشده و آپوستیل‌شده را می‌پذیرند و همهٔ گام‌های بعدی به آن‌ها وابسته است.",
    },
    action: {
      en: "Complete official translation, notarization and apostille of your identity and education documents.",
      fa: "ترجمهٔ رسمی، تأیید محضری و آپوستیل مدارک هویتی و تحصیلی خود را کامل کنید.",
    },
  },
  {
    flag: "credential_recognition",
    priority: "high",
    institution: "Valvira / OPH",
    gap: { en: "Qualification recognition is required", fa: "تأیید مدرک حرفه‌ای لازم است" },
    why: {
      en: "Your profession is regulated or academically assessed in Finland, so recognition determines whether you can work in your field.",
      fa: "حرفهٔ شما در فنلاند تحت نظارت یا نیازمند ارزیابی دانشگاهی است؛ بنابراین تأیید مدرک تعیین می‌کند که آیا می‌توانید در حوزهٔ خود کار کنید.",
    },
    action: {
      en: "File a recognition application for your degree or professional licence.",
      fa: "برای مدرک تحصیلی یا پروانهٔ حرفه‌ای خود درخواست تأیید ثبت کنید.",
    },
  },
  {
    flag: "language_weak",
    priority: "high",
    institution: "TE Services",
    gap: { en: "Language level is below labour-market expectation", fa: "سطح زبان پایین‌تر از انتظار بازار کار است" },
    why: {
      en: "Language capacity affects employment, services and daily life more than any other single factor in the first year.",
      fa: "توان زبانی در سال نخست بیش از هر عامل دیگری بر اشتغال، دریافت خدمات و زندگی روزمره اثر می‌گذارد.",
    },
    action: {
      en: "Request an initial assessment and enrol in an integration-track language course.",
      fa: "درخواست ارزیابی اولیه بدهید و در دورهٔ زبان مسیر ادغام ثبت‌نام کنید.",
    },
  },
  {
    flag: "finance_thin",
    priority: "high",
    institution: "Kela",
    gap: { en: "Short financial runway", fa: "توان مالی کوتاه‌مدت" },
    why: {
      en: "Settling-in costs arrive before the first salary; a thin runway increases the risk of an interrupted integration plan.",
      fa: "هزینه‌های استقرار پیش از نخستین حقوق می‌رسد و توان مالی کم، خطر توقف طرح ادغام را افزایش می‌دهد.",
    },
    action: {
      en: "Build a 6-month settling-in budget and check benefit and housing-allowance eligibility.",
      fa: "بودجهٔ ۶ ماههٔ استقرار بسازید و شرایط دریافت مزایا و کمک‌هزینهٔ مسکن را بررسی کنید.",
    },
  },
  {
    flag: "finance_docs",
    priority: "medium",
    institution: "Migri",
    gap: { en: "Financial evidence is incomplete", fa: "مدارک مالی ناقص است" },
    why: {
      en: "Permit categories require verifiable proof of monthly means; unexplained funds are a common source of delay.",
      fa: "دسته‌های اجازهٔ اقامت نیازمند مدرک قابل‌راستی‌آزمایی برای منابع ماهانه است و منابع بدون توضیح از دلایل رایج تأخیر است.",
    },
    action: {
      en: "Assemble bank statements, contracts and payslips covering the required monthly means.",
      fa: "صورت‌حساب بانکی، قراردادها و فیش‌های حقوقی متناسب با منابع ماهانهٔ لازم را گردآوری کنید.",
    },
  },
  {
    flag: "legal_history",
    priority: "high",
    institution: "Migri",
    gap: { en: "Immigration history needs a documented explanation", fa: "سابقهٔ مهاجرتی نیازمند توضیح مستند است" },
    why: {
      en: "Previous violations or overstays are assessed case by case; a factual, document-backed account reduces processing delays.",
      fa: "تخلف یا اقامت غیرمجاز پیشین موردی بررسی می‌شود و شرحی مستند و واقع‌محور، تأخیر در بررسی را کاهش می‌دهد.",
    },
    action: {
      en: "Prepare a factual explanation file and review it with a licensed legal adviser before filing.",
      fa: "یک پروندهٔ توضیحی مستند آماده کنید و پیش از ثبت، آن را با مشاور حقوقی دارای مجوز مرور کنید.",
    },
  },
  {
    flag: "visa_refusal",
    priority: "high",
    institution: "Migri",
    gap: { en: "Previous visa refusal on record", fa: "سابقهٔ ریجکتی ویزا در پرونده" },
    why: {
      en: "A refusal history means the next application must directly address the original refusal grounds.",
      fa: "سابقهٔ ریجکتی به این معناست که درخواست بعدی باید مستقیماً به دلایل اصلی رد پاسخ دهد.",
    },
    action: {
      en: "Collect the refusal decision, dates and any corrective steps taken since.",
      fa: "تصمیم رد، تاریخ‌ها و اقدامات اصلاحی انجام‌شده پس از آن را گردآوری کنید.",
    },
  },
  {
    flag: "support_network",
    priority: "medium",
    institution: "Municipal health services",
    gap: { en: "Limited support network at destination", fa: "شبکهٔ حمایتی محدود در مقصد" },
    why: {
      en: "A weak local network slows access to information and increases the load of the first months.",
      fa: "شبکهٔ محلی ضعیف، دسترسی به اطلاعات را کند می‌کند و فشار ماه‌های نخست را افزایش می‌دهد.",
    },
    action: {
      en: "Set up a local support routine and note the low-threshold services in your municipality.",
      fa: "یک روتین حمایتی محلی بسازید و خدمات کم‌آستانهٔ شهرداری خود را یادداشت کنید.",
    },
  },
  {
    flag: "cultural_adaptation",
    priority: "medium",
    institution: "International House Helsinki",
    gap: { en: "Limited familiarity with Finnish norms and services", fa: "آشنایی محدود با هنجارها و خدمات فنلاند" },
    why: {
      en: "Knowing how services, workplaces and communication work locally shortens the time from arrival to participation.",
      fa: "شناخت نحوهٔ کار خدمات، محیط کاری و ارتباطات محلی، فاصلهٔ میان ورود تا مشارکت را کوتاه می‌کند.",
    },
    action: {
      en: "Attend a newcomer orientation session and a local community activity.",
      fa: "در یک جلسهٔ آشناسازی تازه‌واردان و یک فعالیت اجتماعی محلی شرکت کنید.",
    },
  },
  {
    flag: "employment_gap",
    priority: "medium",
    institution: "TE Services",
    gap: { en: "Gap in recent employment record", fa: "وقفه در سابقهٔ شغلی اخیر" },
    why: {
      en: "Finnish employers read continuity closely; a first local contract restores references and pension record.",
      fa: "کارفرمایان فنلاندی به پیوستگی سابقه توجه دارند؛ نخستین قرارداد محلی، معرف و سابقهٔ بازنشستگی را بازمی‌گرداند.",
    },
    action: {
      en: "Target bridge employment and wage-subsidy openings while your main search continues.",
      fa: "هم‌زمان با جست‌وجوی اصلی، مشاغل پل‌زننده و فرصت‌های با یارانهٔ دستمزد را هدف بگیرید.",
    },
  },
  {
    flag: "family_relocation",
    priority: "medium",
    institution: "DVV",
    gap: { en: "Family relationships need registration", fa: "روابط خانوادگی نیازمند ثبت است" },
    why: {
      en: "Marriage and dependency records established abroad are not valid in Finland until entered in the population system.",
      fa: "اسناد ازدواج و تکفل ثبت‌شده در خارج، تا زمانی که در سامانهٔ اطلاعات جمعیتی وارد نشوند در فنلاند معتبر نیستند.",
    },
    action: {
      en: "Register your family relationships with legalized documents.",
      fa: "روابط خانوادگی خود را با مدارک قانونی‌سازی‌شده ثبت کنید.",
    },
  },
  {
    flag: "children",
    priority: "medium",
    institution: "Municipal health services",
    gap: { en: "Children need education or daycare placement", fa: "فرزندان نیازمند جایگاه آموزشی یا مهدکودک هستند" },
    why: {
      en: "Municipal applications have fixed lead times, so a late application delays both schooling and your own availability for work.",
      fa: "درخواست‌های شهرداری زمان‌بندی مشخصی دارد و تأخیر در درخواست، هم آموزش فرزند و هم فرصت کاری شما را به تعویق می‌اندازد.",
    },
    action: {
      en: "Apply for early childhood education or school placement in your municipality.",
      fa: "برای مهدکودک یا ثبت‌نام مدرسه در شهرداری محل سکونت درخواست دهید.",
    },
  },
  {
    flag: "study_path",
    priority: "medium",
    institution: "Valvira / OPH",
    gap: { en: "Study pathway requires admission planning", fa: "مسیر تحصیلی نیازمند برنامه‌ریزی پذیرش است" },
    why: {
      en: "Application periods, tuition and the annual funds requirement determine which intake is realistic for you.",
      fa: "بازه‌های ارسال درخواست، شهریه و شرط تمکن مالی سالانه تعیین می‌کند کدام ترم برای شما واقع‌بینانه است.",
    },
    action: {
      en: "Map admission windows and the financial requirements of a study permit.",
      fa: "بازه‌های پذیرش و شرایط مالی اجازهٔ اقامت تحصیلی را مشخص کنید.",
    },
  },
  {
    flag: "startup_path",
    priority: "medium",
    institution: "Migri",
    gap: { en: "Startup pathway requires an eligibility statement", fa: "مسیر استارتاپ نیازمند بیانیهٔ واجد شرایط بودن است" },
    why: {
      en: "The eligibility statement is assessed before the permit application itself, so it sets your real timeline.",
      fa: "بیانیهٔ واجد شرایط بودن پیش از خود درخواست اجازهٔ اقامت بررسی می‌شود و زمان‌بندی واقعی شما را تعیین می‌کند.",
    },
    action: {
      en: "Prepare team, funding and business-case evidence for the startup track.",
      fa: "مدارک تیم، تأمین سرمایه و طرح کسب‌وکار را برای مسیر استارتاپ آماده کنید.",
    },
  },
  {
    flag: "talent_track",
    priority: "low",
    institution: "Migri",
    gap: { en: "Talent / specialist fast-track is available to you", fa: "مسیر سریع استعداد یا متخصص برای شما در دسترس است" },
    why: {
      en: "Your answers indicate founder or specialist signals that open faster processing tracks.",
      fa: "پاسخ‌های شما نشانه‌های کارآفرینی یا تخصص را نشان می‌دهد که مسیرهای بررسی سریع‌تر را باز می‌کند.",
    },
    action: {
      en: "Check the specialist fast-track criteria before choosing your permit route.",
      fa: "پیش از انتخاب مسیر اجازهٔ اقامت، معیارهای مسیر سریع متخصص را بررسی کنید.",
    },
  },
  {
    flag: "urgent_timeline",
    priority: "high",
    institution: "Migri",
    gap: { en: "Very short intended timeline", fa: "بازهٔ زمانی موردنظر بسیار کوتاه است" },
    why: {
      en: "Permit and registration processing times are fixed; a compressed timeline requires strict sequencing of the first steps.",
      fa: "زمان بررسی اجازهٔ اقامت و ثبت‌نام‌ها ثابت است و بازهٔ فشرده، ترتیب دقیق گام‌های نخست را ضروری می‌کند.",
    },
    action: {
      en: "Front-load the Weeks 1–3 administrative actions and verify current processing times.",
      fa: "اقدامات اداری هفته‌های ۱ تا ۳ را جلو بیندازید و زمان‌های بررسی جاری را راستی‌آزمایی کنید.",
    },
  },
];

export function buildGapAnalysis(profile: Profile): GapEntry[] {
  const order = { high: 0, medium: 1, low: 2 } as const;
  return GAP_CATALOG.filter((g) => profile.gaps.includes(g.flag)).sort(
    (a, b) => order[a.priority] - order[b.priority],
  );
}

/** Institution → pathway presentation (reference only, no government integration). */
export const INSTITUTION_PATHWAY: Record<Institution, Bilingual> = {
  Migri: { en: "Residence permit & status pathway (Migri)", fa: "مسیر اجازهٔ اقامت و وضعیت (Migri)" },
  DVV: { en: "Population registration pathway (DVV)", fa: "مسیر ثبت جمعیت (DVV)" },
  Vero: { en: "Taxation pathway (Vero)", fa: "مسیر مالیاتی (Vero)" },
  Kela: { en: "Social security pathway (Kela)", fa: "مسیر تأمین اجتماعی (Kela)" },
  "TE Services": { en: "Employment & integration services pathway", fa: "مسیر خدمات اشتغال و ادغام" },
  "Valvira / OPH": {
    en: "Qualification recognition pathway (Valvira / OPH)",
    fa: "مسیر تأیید مدارک (Valvira / OPH)",
  },
  "International House Helsinki": {
    en: "One-stop settlement pathway (International House Helsinki)",
    fa: "مسیر یکجای استقرار (International House Helsinki)",
  },
  "Municipal health services": {
    en: "Municipal health & family services pathway",
    fa: "مسیر خدمات درمانی و خانوادگی شهرداری",
  },
};

export type PathwayCard = {
  institution: Institution;
  title: Bilingual;
  relevance: Bilingual;
  action: Bilingual;
  priority: "high" | "medium" | "normal";
  timing: { from: number; to: number };
};

const priorityRank = { high: 0, medium: 1, normal: 2 } as const;

export function buildPathways(profile: Profile, items: RoadmapItem[]): PathwayCard[] {
  const byInstitution = new Map<Institution, RoadmapItem[]>();
  for (const item of items) {
    const list = byInstitution.get(item.institution) ?? [];
    list.push(item);
    byInstitution.set(item.institution, list);
  }

  const cards: PathwayCard[] = [];
  for (const [institution, list] of byInstitution) {
    const sorted = [...list].sort(
      (a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.week - b.week,
    );
    const lead = sorted[0]!;
    const matchedGaps = GAP_CATALOG.filter(
      (g) =>
        profile.gaps.includes(g.flag) &&
        list.some((i) => i.requires?.includes(g.flag)),
    );
    const relevance: Bilingual = matchedGaps.length
      ? {
          en: `Relevant because your assessment identified: ${matchedGaps.map((g) => g.gap.en).join("; ")}.`,
          fa: `به این دلیل مرتبط است که ارزیابی شما این موارد را شناسایی کرد: ${matchedGaps
            .map((g) => g.gap.fa)
            .join("؛ ")}.`,
        }
      : {
          en: "Baseline pathway included for every profile in the Finland track.",
          fa: "مسیر پایه که برای همهٔ پروفایل‌های مسیر فنلاند گنجانده می‌شود.",
        };

    cards.push({
      institution,
      title: INSTITUTION_PATHWAY[institution],
      relevance,
      action: lead.title,
      priority: lead.priority,
      timing: {
        from: Math.min(...list.map((i) => i.week)),
        to: Math.max(...list.map((i) => i.week)),
      },
    });
  }

  return cards.sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.timing.from - b.timing.from,
  );
}

/**
 * Traceable explanation for a roadmap item: assessment profile + matched gap
 * rules + pathway data. No internal logic or prompts are exposed.
 */
export function whyRecommended(item: RoadmapItem, profile: Profile): Bilingual {
  const matched = GAP_CATALOG.filter(
    (g) => profile.gaps.includes(g.flag) && item.requires?.includes(g.flag),
  );
  const reasonEn = matched.length
    ? matched.map((g) => g.gap.en.toLowerCase()).join("; ")
    : "it is a baseline requirement for every profile on this pathway";
  const reasonFa = matched.length
    ? matched.map((g) => g.gap.fa).join("؛ ")
    : "این گام برای همهٔ پروفایل‌های این مسیر یک الزام پایه است";
  const priorityEn =
    item.priority === "high" ? "high" : item.priority === "medium" ? "medium" : "normal";
  const priorityFa =
    item.priority === "high" ? "بالا" : item.priority === "medium" ? "متوسط" : "عادی";

  return {
    en: `Based on your assessment profile and the pathway information relevant to your situation, this action has been prioritized because ${reasonEn}. It is mapped to ${item.institution} and sequenced for week ${item.week} at ${priorityEn} priority.`,
    fa: `بر پایهٔ پروفایل ارزیابی شما و اطلاعات مسیرهای مرتبط با وضعیتتان، این اقدام اولویت‌بندی شده است زیرا ${reasonFa}. این گام به ${item.institution} نگاشت شده و برای هفتهٔ ${item.week} با اولویت ${priorityFa} چیده شده است.`,
  };
}

export const ALL_KNOWLEDGE_INSTITUTIONS = Array.from(
  new Set(KNOWLEDGE_TABLE.map((e) => e.institution)),
);
