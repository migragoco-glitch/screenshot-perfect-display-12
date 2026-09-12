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
  | "Local Employment Services"
  | "Valvira / OPH"
  | "International House Helsinki"
  | "Local municipality services"
  | "PRH / YTJ"
  | "Business Finland"
  | "Municipal health services";

/** Full public-facing label for each institution. */
export const INSTITUTION_LABEL: Record<Institution, string> = {
  Migri: "Migri",
  DVV: "DVV",
  Vero: "Vero",
  Kela: "Kela",
  "Local Employment Services": "Local Employment Services (via Job Market Finland — tyomarkkinatori.fi)",
  "Valvira / OPH": "Valvira / OPH",
  "International House Helsinki": "International House Helsinki",
  "Local municipality services": "Local municipality / employment area services",
  "PRH / YTJ": "PRH / YTJ",
  "Business Finland": "Business Finland",
  "Municipal health services": "Municipal health services",
};

export type Phase = 1 | 2 | 3 | 4;

export type KnowledgeEntry = {
  id: string;
  phase: Phase;
  week: number;
  institution: Institution;
  title: Bilingual;
  detail: Bilingual;
  officialSource: string;
  dependency: Bilingual;
  completionCondition: Bilingual;
  priority: "high" | "medium" | "normal";
  /** gap flags that make this step relevant; empty = always included */
  requires?: GapFlag[];
};

type KnowledgeEntryBase = Omit<KnowledgeEntry, "officialSource" | "dependency" | "completionCondition">;

const KNOWLEDGE_TABLE_BASE: KnowledgeEntryBase[] = [
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
    requires: ["kela_relevant"],
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
    institution: "Local Employment Services",
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
    requires: ["helsinki_region"],
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
    id: "municipal-onboarding",
    phase: 2,
    week: 6,
    institution: "Local municipality services",
    priority: "normal",
    requires: ["outside_helsinki"],
    title: {
      en: "Book a settlement advisory session with your municipality or employment area",
      fa: "یک جلسهٔ مشاورهٔ استقرار با شهرداری یا منطقهٔ اشتغال محل سکونت خود رزرو کنید",
    },
    detail: {
      en: "Local municipality and employment area services advise on registration, taxation, social insurance and job seeking for newcomers.",
      fa: "خدمات شهرداری و منطقهٔ اشتغال محل سکونت، در زمینهٔ ثبت‌نام، مالیات، بیمهٔ اجتماعی و کاریابی به تازه‌واردان مشاوره می‌دهند.",
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
    institution: "Local Employment Services",
    priority: "high",
    requires: ["employment_pathway", "pathway_unconfirmed", "employment_gap"],
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
      en: "File for recognition of your qualification with the competent authority",
      fa: "برای تأیید مدرک خود به مرجع صالح درخواست دهید",
    },
    detail: {
      en: "Academic and teaching qualifications are handled by the Finnish National Agency for Education (OPH); other fields may have their own competent authority. Legalized degree documents are required.",
      fa: "مدارک دانشگاهی و آموزشی توسط سازمان ملی آموزش فنلاند (OPH) بررسی می‌شود و برخی حوزه‌ها مرجع صالح جداگانه دارند. ارائهٔ مدارک تحصیلی قانونی‌سازی‌شده لازم است.",
    },
  },
  {
    id: "valvira-health-recognition",
    phase: 3,
    week: 7,
    institution: "Valvira / OPH",
    priority: "high",
    requires: ["health_profession"],
    title: {
      en: "Apply for healthcare professional recognition with Valvira",
      fa: "برای تأیید صلاحیت حرفه‌ای حوزهٔ سلامت به Valvira درخواست دهید",
    },
    detail: {
      en: "Regulated healthcare professions are licensed by Valvira. Requirements depend on your profession and where you qualified; Valvira confirms what applies to you.",
      fa: "مشاغل تحت نظارت حوزهٔ سلامت توسط Valvira پروانه می‌گیرد. شرایط به حرفه و کشور صدور مدرک بستگی دارد؛ Valvira مورد دقیق شما را تأیید می‌کند.",
    },
  },
  {
    id: "cv-finnish-format",
    phase: 3,
    week: 8,
    institution: "Local Employment Services",
    priority: "medium",
    requires: ["employment_pathway", "pathway_unconfirmed", "employment_gap"],
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
    institution: "Local Employment Services",
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
    institution: "Business Finland",
    priority: "medium",
    requires: ["startup_path"],
    title: {
      en: "Prepare the start-up entrepreneur eligibility submission",
      fa: "پروندهٔ تأیید صلاحیت کارآفرینی استارتاپی را آماده کنید",
    },
    detail: {
      en: "For the start-up entrepreneur pathway specifically, Business Finland issues the Eligibility Statement that Migri requires before the residence permit application. Ordinary entrepreneurship follows a different route — confirm which applies with Migri.",
      fa: "تنها برای مسیر کارآفرینی استارتاپی، Business Finland بیانیهٔ صلاحیت را صادر می‌کند که Migri پیش از درخواست اجازهٔ اقامت آن را می‌خواهد. کارآفرینی معمولی مسیر دیگری دارد — مورد خود را با Migri تأیید کنید.",
    },
  },
  {
    id: "business-registration",
    phase: 3,
    week: 9,
    institution: "PRH / YTJ",
    priority: "medium",
    requires: ["business_registration"],
    title: {
      en: "Prepare your business registration through PRH / YTJ",
      fa: "ثبت کسب‌وکار خود را از طریق PRH / YTJ آماده کنید",
    },
    detail: {
      en: "Company form, trade register filing and Business ID are handled via the YTJ service; tax registrations follow from the same notification.",
      fa: "شکل حقوقی شرکت، ثبت در دفتر تجاری و دریافت شناسهٔ کسب‌وکار از طریق سامانهٔ YTJ انجام می‌شود؛ ثبت‌های مالیاتی نیز از همان اظهار پیگیری می‌شود.",
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
    institution: "Local municipality services",
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
    institution: "Local Employment Services",
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

const OFFICIAL_SOURCE: Record<Institution, string> = {
  Migri: "https://migri.fi/en/home",
  DVV: "https://dvv.fi/en/individuals",
  Vero: "https://www.vero.fi/en/individuals/",
  Kela: "https://www.kela.fi/",
  "Local Employment Services": "https://tyomarkkinatori.fi/en",
  "Valvira / OPH": "https://www.oph.fi/en/services/recognition-and-international-comparability-qualifications",
  "International House Helsinki": "https://ihhelsinki.fi/",
  "Local municipality services": "https://www.suomi.fi/citizen",
  "PRH / YTJ": "https://www.ytj.fi/en/",
  "Business Finland": "https://www.businessfinland.fi/en/do-business-with-finland/startup-in-finland/startup-permit/",
  "Municipal health services": "https://www.suomi.fi/citizen/health-and-medical-care",
};

const D = (en: string, fa: string): Bilingual => ({ en, fa });

const ACTION_METADATA: Record<string, { dependency: Bilingual; completionCondition: Bilingual }> = {
  "migri-permit": {
    dependency: D("A confirmed intended pathway and the required supporting documents.", "تأیید مسیر موردنظر و آماده‌بودن مدارک پشتیبان لازم."),
    completionCondition: D("The correct application is submitted with all required attachments.", "درخواست درست همراه همهٔ پیوست‌های لازم ثبت شده باشد."),
  },
  "doc-legalization": {
    dependency: D("Original identity, civil-status and qualification documents.", "اصل مدارک هویتی، وضعیت مدنی و تحصیلی."),
    completionCondition: D("Required documents are translated and legalized in the form accepted by the relevant authority.", "مدارک لازم با قالب موردپذیرش مرجع مربوط ترجمه و قانونی‌سازی شده باشند."),
  },
  "dvv-id-code": {
    dependency: D("A residence basis and documents accepted by DVV.", "مبنای اقامت و مدارک موردپذیرش DVV."),
    completionCondition: D("Your Finnish personal identity code and municipality details are recorded.", "کد شناسایی شخصی فنلاندی و اطلاعات شهرداری شما ثبت شده باشد."),
  },
  "dvv-family": {
    dependency: D("Legalized family-status documents and identity records.", "مدارک قانونی‌سازی‌شدهٔ وضعیت خانوادگی و هویتی."),
    completionCondition: D("Relevant family relationships and dependants appear in the population information system.", "روابط خانوادگی و افراد تحت تکفل مرتبط در سامانهٔ اطلاعات جمعیتی ثبت شده باشند."),
  },
  "vero-tax": {
    dependency: D("A Finnish personal identity code and employment details, where applicable.", "کد شناسایی شخصی فنلاندی و در صورت ارتباط، اطلاعات اشتغال."),
    completionCondition: D("You have a valid tax card and any required tax number.", "کارت مالیاتی معتبر و شمارهٔ مالیاتی لازم را دریافت کرده باشید."),
  },
  "legal-history-advice": {
    dependency: D("Previous decisions, dates and supporting evidence.", "تصمیم‌های پیشین، تاریخ‌ها و مدارک پشتیبان."),
    completionCondition: D("A factual explanation file is complete and reviewed before submission.", "پروندهٔ توضیحی مستند کامل و پیش از ثبت مرور شده باشد."),
  },
  "finance-evidence": {
    dependency: D("The financial requirements for your intended permit category.", "شرایط مالی دستهٔ اجازهٔ اقامت موردنظر شما."),
    completionCondition: D("Every claimed source of funds is supported by current, traceable evidence.", "هر منبع مالی اعلام‌شده با مدرک جاری و قابل‌ردیابی پشتیبانی شود."),
  },
  "kela-social": {
    dependency: D("Residence and work details showing how the move applies to your situation.", "اطلاعات اقامت و کار که وضعیت جابه‌جایی شما را روشن کند."),
    completionCondition: D("Kela has received the application and issued a coverage decision.", "Kela درخواست را دریافت و تصمیم پوشش را صادر کرده باشد."),
  },
  "health-registration": {
    dependency: D("A registered Finnish address or municipality of residence.", "نشانی ثبت‌شده در فنلاند یا شهرداری محل سکونت."),
    completionCondition: D("Your assigned care route and local contact details are saved.", "مسیر دریافت خدمات و اطلاعات تماس محلی شما مشخص و ذخیره شده باشد."),
  },
  "school-daycare": {
    dependency: D("A municipality, child records and the intended start date.", "شهرداری محل سکونت، مدارک فرزند و تاریخ شروع موردنظر."),
    completionCondition: D("The application is submitted and its receipt or placement decision is saved.", "درخواست ثبت و رسید یا تصمیم جایابی آن ذخیره شده باشد."),
  },
  "finnish-course": {
    dependency: D("An initial assessment or contact with local employment and integration services.", "ارزیابی اولیه یا تماس با خدمات محلی اشتغال و ادغام."),
    completionCondition: D("A suitable course is selected and enrolment or a start date is confirmed.", "دورهٔ مناسب انتخاب و ثبت‌نام یا تاریخ شروع تأیید شده باشد."),
  },
  "ihh-onboarding": {
    dependency: D("A confirmed destination in the Helsinki region.", "مقصد تأییدشده در منطقهٔ هلسینکی."),
    completionCondition: D("The advisory appointment is completed and next steps are recorded.", "جلسهٔ مشاوره انجام و گام‌های بعدی ثبت شده باشند."),
  },
  "municipal-onboarding": {
    dependency: D("A confirmed municipality or employment area outside the Helsinki region.", "شهرداری یا منطقهٔ اشتغال تأییدشده خارج از منطقهٔ هلسینکی."),
    completionCondition: D("The local advisory session is completed and referrals are recorded.", "جلسهٔ مشاورهٔ محلی انجام و ارجاع‌های لازم ثبت شده باشند."),
  },
  "budget-plan": {
    dependency: D("Current capital, expected income and realistic housing costs.", "سرمایهٔ کنونی، درآمد موردانتظار و هزینه‌های واقع‌بینانهٔ مسکن."),
    completionCondition: D("A six-month budget is documented and any relevant benefit conditions have been checked.", "بودجهٔ شش‌ماهه ثبت و شرایط مزایای مرتبط بررسی شده باشد."),
  },
  "te-jobseeker": {
    dependency: D("A pathway that permits job seeking and the required registration details.", "مسیر دارای امکان کاریابی و اطلاعات لازم برای ثبت‌نام."),
    completionCondition: D("Jobseeker registration is active and an employment plan is agreed.", "ثبت‌نام جویای کار فعال و طرح اشتغال توافق شده باشد."),
  },
  "oph-recognition": {
    dependency: D("Legalized qualification documents and confirmation of the competent authority.", "مدارک تحصیلی قانونی‌سازی‌شده و تعیین مرجع صالح."),
    completionCondition: D("The recognition application is submitted and its case reference is saved.", "درخواست تأیید مدرک ثبت و شمارهٔ پرونده ذخیره شده باشد."),
  },
  "valvira-health-recognition": {
    dependency: D("Profession-specific documents and the qualification country confirmed with Valvira.", "مدارک مختص حرفه و کشور محل اخذ مدرک که با Valvira بررسی شده باشد."),
    completionCondition: D("The correct Valvira application is submitted with all requested evidence.", "درخواست درست Valvira همراه همهٔ مدارک خواسته‌شده ثبت شده باشد."),
  },
  "cv-finnish-format": {
    dependency: D("A confirmed employment pathway and current work history.", "مسیر اشتغال تأییدشده و سابقهٔ کاری به‌روز."),
    completionCondition: D("A tailored CV and application template are ready for Finnish vacancies.", "رزومه و الگوی درخواست متناسب برای فرصت‌های شغلی فنلاند آماده باشد."),
  },
  "employment-bridge": {
    dependency: D("An active jobseeker profile and a defined bridge-role target.", "پروفایل فعال جویای کار و هدف مشخص برای شغل پل‌زننده."),
    completionCondition: D("Suitable openings are shortlisted and at least one targeted application is submitted.", "فرصت‌های مناسب فهرست و دست‌کم یک درخواست هدفمند ثبت شده باشد."),
  },
  "startup-permit": {
    dependency: D("A start-up pathway choice, team information and a scalable business case.", "انتخاب مسیر استارتاپ، اطلاعات تیم و طرح کسب‌وکار مقیاس‌پذیر."),
    completionCondition: D("The eligibility submission is complete and sent to Business Finland.", "پروندهٔ صلاحیت کامل و برای Business Finland ارسال شده باشد."),
  },
  "business-registration": {
    dependency: D("A chosen company form and confirmation that entrepreneurship is the intended pathway.", "شکل حقوقی انتخاب‌شده و تأیید کارآفرینی به‌عنوان مسیر موردنظر."),
    completionCondition: D("The start-up notification is submitted and the Business ID is received.", "اعلام شروع کسب‌وکار ثبت و شناسهٔ کسب‌وکار دریافت شده باشد."),
  },
  "study-path": {
    dependency: D("A study pathway choice and a shortlist of suitable programmes.", "انتخاب مسیر تحصیلی و فهرست کوتاه برنامه‌های مناسب."),
    completionCondition: D("Admission dates, tuition, insurance and permit-fund requirements are documented.", "تاریخ‌های پذیرش، شهریه، بیمه و شرایط مالی اجازهٔ اقامت ثبت شده باشند."),
  },
  "community-network": {
    dependency: D("A local area and professional field or community interest.", "منطقهٔ محلی و حوزهٔ حرفه‌ای یا علاقهٔ اجتماعی مشخص."),
    completionCondition: D("You have joined one relevant professional network and one local community group.", "به یک شبکهٔ حرفه‌ای مرتبط و یک گروه اجتماعی محلی پیوسته باشید."),
  },
  "support-buddy": {
    dependency: D("Local service contact details and one trusted support contact.", "اطلاعات تماس خدمات محلی و یک فرد قابل‌اعتماد برای حمایت."),
    completionCondition: D("A repeatable support routine and appropriate low-threshold service contacts are recorded.", "روتین حمایتی قابل‌تکرار و تماس خدمات کم‌آستانهٔ مناسب ثبت شده باشند."),
  },
  "language-practice": {
    dependency: D("A current language-learning plan or course.", "برنامه یا دورهٔ جاری یادگیری زبان."),
    completionCondition: D("At least one recurring real-life language practice activity is scheduled.", "دست‌کم یک فعالیت تکرارشوندهٔ تمرین زبان در زندگی واقعی برنامه‌ریزی شده باشد."),
  },
  "long-term-status": {
    dependency: D("Your current permit decision and accurate residence and income records.", "تصمیم اجازهٔ اقامت کنونی و سوابق دقیق اقامت و درآمد."),
    completionCondition: D("Key extension dates, evidence requirements and reminders are documented.", "تاریخ‌های اصلی تمدید، مدارک لازم و یادآورها ثبت شده باشند."),
  },
  "review-profile": {
    dependency: D("Completed earlier roadmap actions and updated personal records.", "اقدامات قبلی تکمیل‌شده و اطلاعات شخصی به‌روز."),
    completionCondition: D("Relevant authority records are updated and the MigraGo assessment is completed again.", "اطلاعات مراجع مرتبط به‌روز و ارزیابی میگراگو دوباره تکمیل شده باشد."),
  },
};

export const KNOWLEDGE_TABLE: KnowledgeEntry[] = KNOWLEDGE_TABLE_BASE.map((entry) => {
  const metadata = ACTION_METADATA[entry.id];
  if (!metadata) throw new Error(`Missing roadmap metadata for ${entry.id}`);
  return {
    ...entry,
    officialSource: OFFICIAL_SOURCE[entry.institution],
    ...metadata,
  };
});

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
