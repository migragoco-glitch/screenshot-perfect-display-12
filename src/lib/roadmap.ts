import type { Bilingual } from "./questions";
import type { GapFlag, Profile } from "./scoring";

/**
 * Structured, versioned knowledge table: gap/dimension -> real Finnish services.
 * The generator matches, prioritizes and sequences against THIS table only —
 * nothing is invented at runtime.
 */
export const KNOWLEDGE_TABLE_VERSION = "fi-2026.02";

export type Institution =
  | "Migri"
  | "DVV"
  | "Vero"
  | "Kela"
  | "TE Services"
  | "Valvira / OPH"
  | "International House Helsinki"
  | "Municipal health services";

export type Phase = 1 | 2 | 3 | 4;

export type KnowledgeEntry = {
  id: string;
  phase: Phase;
  week: number;
  institution: Institution;
  title: Bilingual;
  detail: Bilingual;
  priority: "high" | "medium" | "normal";
  /** gap flags that make this step relevant; empty = always included */
  requires?: GapFlag[];
};

export const KNOWLEDGE_TABLE: KnowledgeEntry[] = [
  // ── Phase 1 · Weeks 1–3 — Legal & Administrative Foundation
  {
    id: "migri-permit",
    phase: 1,
    week: 1,
    institution: "Migri",
    priority: "high",
    title: {
      en: "Confirm your residence permit category and file the correct application",
      fa: "دستهٔ اجازهٔ اقامت خود را تأیید و درخواست درست را ثبت کنید",
    },
    detail: {
      en: "Verify which permit track (work, study, startup, self-sufficiency) matches your answers, then submit through Enter Finland with the exact attachment list for that track.",
      fa: "بررسی کنید کدام مسیر اجازهٔ اقامت (کاری، تحصیلی، استارتاپ، خودکفایی مالی) با پاسخ‌های شما مطابقت دارد و سپس در سامانهٔ Enter Finland با فهرست دقیق پیوست‌های همان مسیر درخواست دهید.",
    },
  },
  {
    id: "doc-legalization",
    phase: 1,
    week: 1,
    institution: "Migri",
    priority: "high",
    requires: ["documents_not_ready"],
    title: {
      en: "Complete official translation, notarization and apostille of core documents",
      fa: "ترجمهٔ رسمی، تأیید محضری و آپوستیل مدارک اصلی را کامل کنید",
    },
    detail: {
      en: "Passport, birth certificate, marriage/divorce records and degree certificates must be legalized before any Finnish authority accepts them.",
      fa: "گذرنامه، شناسنامه، اسناد ازدواج یا طلاق و مدارک تحصیلی باید پیش از پذیرش توسط هر مرجع فنلاندی، تأیید و قانونی‌سازی شوند.",
    },
  },
  {
    id: "dvv-id-code",
    phase: 1,
    week: 2,
    institution: "DVV",
    priority: "high",
    title: {
      en: "Register your personal identity code and municipality of residence",
      fa: "کد شناسایی شخصی و شهرداری محل سکونت خود را ثبت کنید",
    },
    detail: {
      en: "The personal identity code is the key that unlocks banking, health care and employment. Book the appointment as early as your permit allows.",
      fa: "کد شناسایی شخصی، کلید دسترسی به خدمات بانکی، درمانی و اشتغال است. به‌محض اینکه اجازهٔ اقامت امکان دهد، وقت مراجعه بگیرید.",
    },
  },
  {
    id: "dvv-family",
    phase: 1,
    week: 2,
    institution: "DVV",
    priority: "medium",
    requires: ["family_relocation"],
    title: {
      en: "Register family relationships and dependants in the population system",
      fa: "روابط خانوادگی و افراد تحت تکفل را در نظام ثبت جمعیت ثبت کنید",
    },
    detail: {
      en: "Marriage and dependency records registered abroad must be entered into the Finnish population information system with legalized documents.",
      fa: "اسناد ازدواج و تکفل که در خارج ثبت شده‌اند باید با مدارک قانونی‌سازی‌شده در سامانهٔ اطلاعات جمعیتی فنلاند وارد شوند.",
    },
  },
  {
    id: "vero-tax",
    phase: 1,
    week: 3,
    institution: "Vero",
    priority: "high",
    title: {
      en: "Obtain your tax card and Finnish tax number",
      fa: "کارت مالیاتی و شمارهٔ مالیاتی فنلاند خود را دریافت کنید",
    },
    detail: {
      en: "No salary can be paid at the correct rate without a tax card. Bring your identity code decision and employment contract if you already have one.",
      fa: "بدون کارت مالیاتی، حقوق شما با نرخ صحیح پرداخت نمی‌شود. تصمیم مربوط به کد شناسایی و در صورت وجود، قرارداد کاری خود را همراه ببرید.",
    },
  },
  {
    id: "legal-history-advice",
    phase: 1,
    week: 3,
    institution: "Migri",
    priority: "high",
    requires: ["legal_history", "visa_refusal"],
    title: {
      en: "Prepare a factual explanation file for your immigration history",
      fa: "یک پروندهٔ توضیحی مستند برای سابقهٔ مهاجرتی خود آماده کنید",
    },
    detail: {
      en: "Collect decisions, dates and any corrective steps taken. A clear, document-backed account reduces processing delays; consult a licensed legal adviser before filing.",
      fa: "تصمیم‌ها، تاریخ‌ها و اقدامات اصلاحی انجام‌شده را گردآوری کنید. شرحی روشن و مستند، تأخیر در بررسی را کاهش می‌دهد؛ پیش از ثبت درخواست با مشاور حقوقی دارای مجوز مشورت کنید.",
    },
  },
  {
    id: "finance-evidence",
    phase: 1,
    week: 3,
    institution: "Migri",
    priority: "medium",
    requires: ["finance_docs", "finance_thin"],
    title: {
      en: "Assemble verifiable proof of sufficient funds",
      fa: "مدارک قابل‌راستی‌آزمایی برای اثبات تمکن مالی را گردآوری کنید",
    },
    detail: {
      en: "Bank statements, payslips, contracts or deeds must show the required monthly means for your permit category — unexplained deposits are a common refusal reason.",
      fa: "صورت‌حساب بانکی، فیش حقوقی، قرارداد یا سند مالکیت باید حداقل منابع ماهانهٔ لازم برای دستهٔ اجازهٔ اقامت شما را نشان دهد — واریزهای بدون توضیح یکی از دلایل رایج ریجکتی است.",
    },
  },

  // ── Phase 2 · Weeks 4–6 — Daily Life & Language Stability
  {
    id: "kela-social",
    phase: 2,
    week: 4,
    institution: "Kela",
    priority: "high",
    title: {
      en: "Apply for social security coverage and the Kela card",
      fa: "برای پوشش تأمین اجتماعی و کارت Kela درخواست دهید",
    },
    detail: {
      en: "Coverage depends on the permanence of your move and your work. Submit form Y77 with your residence and employment details.",
      fa: "پوشش، به دائمی‌بودن جابه‌جایی و وضعیت کاری شما بستگی دارد. فرم Y77 را همراه اطلاعات اقامت و اشتغال خود ارسال کنید.",
    },
  },
  {
    id: "health-registration",
    phase: 2,
    week: 4,
    institution: "Municipal health services",
    priority: "medium",
    title: {
      en: "Register with your local health station and confirm your care route",
      fa: "در مرکز درمانی محل سکونت خود ثبت‌نام و مسیر دریافت خدمات را مشخص کنید",
    },
    detail: {
      en: "Your wellbeing services county assigns a health station by address. Register early and note the emergency and non-urgent care numbers.",
      fa: "استان خدمات رفاهی شما بر اساس نشانی محل سکونت، مرکز درمانی تعیین می‌کند. زودتر ثبت‌نام کنید و شماره‌های اورژانس و خدمات غیرفوری را ثبت نمایید.",
    },
  },
  {
    id: "school-daycare",
    phase: 2,
    week: 5,
    institution: "Municipal health services",
    priority: "medium",
    requires: ["children"],
    title: {
      en: "Apply for early childhood education or school placement",
      fa: "برای مهدکودک یا ثبت‌نام مدرسهٔ فرزندان درخواست دهید",
    },
    detail: {
      en: "Municipal applications have fixed lead times; preparatory education for newly arrived pupils is available in most municipalities.",
      fa: "درخواست‌های شهرداری زمان‌بندی مشخصی دارد؛ در بیشتر شهرداری‌ها آموزش آماده‌سازی برای دانش‌آموزان تازه‌وارد فراهم است.",
    },
  },
  {
    id: "finnish-course",
    phase: 2,
    week: 5,
    institution: "TE Services",
    priority: "high",
    requires: ["language_weak", "cultural_adaptation"],
    title: {
      en: "Enrol in an integration-track Finnish language course",
      fa: "در دورهٔ زبان فنلاندی مسیر ادغام ثبت‌نام کنید",
    },
    detail: {
      en: "Ask for an initial assessment and integration plan; course places are allocated through the employment and integration services in your area.",
      fa: "درخواست ارزیابی اولیه و طرح ادغام کنید؛ ظرفیت دوره‌ها از طریق خدمات اشتغال و ادغام منطقهٔ شما تخصیص می‌یابد.",
    },
  },
  {
    id: "ihh-onboarding",
    phase: 2,
    week: 6,
    institution: "International House Helsinki",
    priority: "normal",
    title: {
      en: "Book a one-stop settlement advisory session",
      fa: "یک جلسهٔ مشاورهٔ یکجای استقرار رزرو کنید",
    },
    detail: {
      en: "One visit covers registration guidance, tax, social insurance and employment advice for newcomers in the capital region.",
      fa: "در یک مراجعه، راهنمایی ثبت‌نام، مالیات، بیمهٔ اجتماعی و مشاورهٔ اشتغال برای تازه‌واردان منطقهٔ پایتخت ارائه می‌شود.",
    },
  },
  {
    id: "budget-plan",
    phase: 2,
    week: 6,
    institution: "Kela",
    priority: "medium",
    requires: ["finance_thin"],
    title: {
      en: "Build a 6-month settling-in budget and check benefit eligibility",
      fa: "بودجهٔ ۶ ماهه استقرار بسازید و شرایط دریافت مزایا را بررسی کنید",
    },
    detail: {
      en: "Model rent, deposit, transport and insurance against your available capital, and check housing allowance eligibility before signing a lease.",
      fa: "اجاره، ودیعه، حمل‌ونقل و بیمه را در برابر سرمایهٔ در دسترس خود مدل کنید و پیش از امضای قرارداد اجاره، شرایط کمک‌هزینهٔ مسکن را بررسی نمایید.",
    },
  },

  // ── Phase 3 · Weeks 7–9 — Employment & Professional Pathway
  {
    id: "te-jobseeker",
    phase: 3,
    week: 7,
    institution: "TE Services",
    priority: "high",
    title: {
      en: "Register as a jobseeker and agree your employment plan",
      fa: "به‌عنوان جویای کار ثبت‌نام کنید و طرح اشتغال خود را نهایی کنید",
    },
    detail: {
      en: "Registration unlocks coaching, wage-subsidy roles and training. Keep the plan updated — obligations are tied to it.",
      fa: "ثبت‌نام، دسترسی به مربی‌گری، مشاغل با یارانهٔ دستمزد و دوره‌های آموزشی را فراهم می‌کند. طرح را به‌روز نگه دارید؛ تعهدات شما به آن گره خورده است.",
    },
  },
  {
    id: "oph-recognition",
    phase: 3,
    week: 7,
    institution: "Valvira / OPH",
    priority: "high",
    requires: ["credential_recognition"],
    title: {
      en: "File for recognition of your qualification or professional licence",
      fa: "برای تأیید مدرک یا پروانهٔ حرفه‌ای خود درخواست دهید",
    },
    detail: {
      en: "Regulated health professions go through Valvira; academic and teaching qualifications through the national education agency. Both require legalized degree documents.",
      fa: "مشاغل تحت نظارت حوزهٔ سلامت از طریق Valvira و مدارک دانشگاهی و آموزشی از طریق سازمان ملی آموزش بررسی می‌شود. هر دو نیازمند مدارک تحصیلی قانونی‌سازی‌شده است.",
    },
  },
  {
    id: "cv-finnish-format",
    phase: 3,
    week: 8,
    institution: "TE Services",
    priority: "medium",
    title: {
      en: "Rewrite your CV and application in Finnish hiring format",
      fa: "رزومه و درخواست کاری خود را به قالب استخدامی فنلاند بازنویسی کنید",
    },
    detail: {
      en: "Two pages, no photo, competence-first structure, with references and an explicit work-permit status line.",
      fa: "دو صفحه، بدون عکس، با ساختار مهارت‌محور، همراه معرف‌ها و ذکر صریح وضعیت اجازهٔ کار.",
    },
  },
  {
    id: "employment-bridge",
    phase: 3,
    week: 8,
    institution: "TE Services",
    priority: "medium",
    requires: ["employment_gap"],
    title: {
      en: "Target bridge employment and wage-subsidy openings",
      fa: "مشاغل پل‌زننده و فرصت‌های با یارانهٔ دستمزد را هدف بگیرید",
    },
    detail: {
      en: "A first Finnish contract — even below your seniority — creates references, language exposure and pension record.",
      fa: "نخستین قرارداد کاری در فنلاند — حتی پایین‌تر از سطح ارشدیت شما — معرف، تماس زبانی و سابقهٔ بازنشستگی ایجاد می‌کند.",
    },
  },
  {
    id: "startup-permit",
    phase: 3,
    week: 9,
    institution: "Migri",
    priority: "medium",
    requires: ["startup_path", "talent_track"],
    title: {
      en: "Prepare the startup / specialist fast-track submission",
      fa: "پروندهٔ مسیر سریع استارتاپ یا متخصص را آماده کنید",
    },
    detail: {
      en: "Eligibility statement, team and funding evidence, and a scalable business case are assessed before the permit application itself.",
      fa: "بیانیهٔ واجد شرایط بودن، مدارک تیم و تأمین سرمایه و طرح کسب‌وکار مقیاس‌پذیر، پیش از خود درخواست اجازهٔ اقامت بررسی می‌شود.",
    },
  },
  {
    id: "study-path",
    phase: 3,
    week: 9,
    institution: "Valvira / OPH",
    priority: "medium",
    requires: ["study_path"],
    title: {
      en: "Map admission windows and study-permit financial requirements",
      fa: "بازه‌های پذیرش و شرایط مالی اجازهٔ اقامت تحصیلی را مشخص کنید",
    },
    detail: {
      en: "Application periods, tuition and the annual funds requirement determine your realistic intake; insurance proof is mandatory.",
      fa: "دوره‌های ارسال درخواست، شهریه و شرایط تمکن مالی سالانه، ترم واقع‌بینانهٔ شما را تعیین می‌کند؛ ارائهٔ مدرک بیمه الزامی است.",
    },
  },

  // ── Phase 4 · Weeks 10–12 — Social Belonging & Community
  {
    id: "community-network",
    phase: 4,
    week: 10,
    institution: "International House Helsinki",
    priority: "medium",
    title: {
      en: "Join a professional network and a local community group",
      fa: "به یک شبکهٔ حرفه‌ای و یک گروه اجتماعی محلی بپیوندید",
    },
    detail: {
      en: "Newcomer meetups, sector associations and mentoring programmes are the fastest route to hidden job markets.",
      fa: "گردهمایی تازه‌واردان، انجمن‌های صنفی و برنامه‌های منتورینگ، سریع‌ترین راه دسترسی به بازار کار پنهان است.",
    },
  },
  {
    id: "support-buddy",
    phase: 4,
    week: 10,
    institution: "Municipal health services",
    priority: "medium",
    requires: ["support_network"],
    title: {
      en: "Set up a local support routine and know your mental-health services",
      fa: "یک روتین حمایتی محلی بسازید و خدمات سلامت روان را بشناسید",
    },
    detail: {
      en: "Low-threshold counselling exists in every municipality; scheduling contact before a crisis is part of a realistic integration plan.",
      fa: "خدمات مشاورهٔ کم‌آستانه در همهٔ شهرداری‌ها وجود دارد؛ برنامه‌ریزی تماس پیش از بحران، بخشی از یک طرح ادغام واقع‌بینانه است.",
    },
  },
  {
    id: "language-practice",
    phase: 4,
    week: 11,
    institution: "TE Services",
    priority: "medium",
    title: {
      en: "Move from course Finnish to daily-use Finnish",
      fa: "از فنلاندی کلاسی به فنلاندی کاربردی روزمره برسید",
    },
    detail: {
      en: "Language cafés, library tandem programmes and workplace Finnish sessions consolidate what the course started.",
      fa: "کافه‌های زبان، برنامه‌های تاندم کتابخانه‌ها و جلسات فنلاندی محیط کار، آموخته‌های دورهٔ زبان را تثبیت می‌کند.",
    },
  },
  {
    id: "long-term-status",
    phase: 4,
    week: 12,
    institution: "Migri",
    priority: "normal",
    title: {
      en: "Plan your permit extension and long-term status timeline",
      fa: "زمان‌بندی تمدید اجازهٔ اقامت و وضعیت بلندمدت خود را برنامه‌ریزی کنید",
    },
    detail: {
      en: "Extension, continuous-permit and eventual permanent-residence conditions depend on unbroken residence and income records — start collecting them now.",
      fa: "شرایط تمدید، اجازهٔ اقامت مستمر و در نهایت اقامت دائم به سابقهٔ پیوستهٔ اقامت و درآمد بستگی دارد — از همین حالا آن‌ها را گردآوری کنید.",
    },
  },
  {
    id: "review-profile",
    phase: 4,
    week: 12,
    institution: "DVV",
    priority: "normal",
    title: {
      en: "Update your records and re-run your MigraGo assessment",
      fa: "اطلاعات خود را به‌روز و ارزیابی میگراگو را دوباره اجرا کنید",
    },
    detail: {
      en: "Address, family and employment changes must be reported. Re-running the assessment shows measurable movement in your readiness score.",
      fa: "تغییر نشانی، وضعیت خانوادگی و اشتغال باید گزارش شود. اجرای دوبارهٔ ارزیابی، تغییر قابل‌سنجش نمرهٔ آمادگی شما را نشان می‌دهد.",
    },
  },
];

export type RoadmapItem = KnowledgeEntry;
export type RoadmapPhase = { phase: Phase; items: RoadmapItem[] };

const priorityRank = { high: 0, medium: 1, normal: 2 } as const;

/**
 * Matching + gap-to-pathway mapping + prioritization + sequencing against the
 * knowledge table. Returns exactly 4 phases covering weeks 1–12.
 */
export function generateRoadmap(profile: Profile): RoadmapPhase[] {
  const gaps = new Set<GapFlag>(profile.gaps);
  const matched = KNOWLEDGE_TABLE.filter(
    (e) => !e.requires || e.requires.some((r) => gaps.has(r)),
  );

  const phases: Phase[] = [1, 2, 3, 4];
  return phases.map((phase) => ({
    phase,
    items: matched
      .filter((e) => e.phase === phase)
      .sort((a, b) => a.week - b.week || priorityRank[a.priority] - priorityRank[b.priority]),
  }));
}

export const PHASE_TITLE_KEYS = ["road.phase1", "road.phase2", "road.phase3", "road.phase4"] as const;
