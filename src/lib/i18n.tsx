import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fa";

export const en = {
  "nav.country": "Country",
  "nav.language": "Language",
  "nav.cta": "Start your free assessment",
  "nav.profile": "My Profile",
  "nav.dashboard": "Dashboard",
  "nav.comingSoon": "Coming Soon",
  "nav.comingSoonTip": "Not available in this version — coming soon.",

  "hero.title": "Know where you stand. Know what's next.",
  "hero.sub":
    "MigraGo uses a smart assessment to map your current status and readiness for integration, then builds you a personalized 12-week roadmap — grounded in real rules, procedures, and services.",
  "hero.badge": "Finland · Evidence-based integration pathway",
  "hero.time": "9–12 minutes · 42 questions · Save & resume anytime",

  "about.title": "What MigraGo is",
  "about.definitionTitle": "Definition",
  "about.definition":
    "A technology-led digital pathway tool that analyzes structured migrant data to assess social-integration readiness.",
  "about.missionTitle": "Mission",
  "about.mission":
    "Turning scattered information into a clear, actionable path toward integration.",
  "about.boundariesTitle": "Boundaries",
  "about.boundaries":
    "MigraGo does not replace legal advice or official authorities, and does not guarantee residence or integration outcomes.",

  "how.title": "How it works",
  "how.s1.t": "Structured assessment",
  "how.s1.d": "7 sections, 42 questions, autosaved as you go.",
  "how.s2.t": "Smart Integration Profile",
  "how.s2.d": "Legal Status, Professional Skills and Psychological Readiness scored 0–100.",
  "how.s3.t": "12-week roadmap",
  "how.s3.d": "Four phases, each step traced to a real Finnish institution.",

  "inst.title": "Grounded in real institutions",
  "inst.sub":
    "Every roadmap step is mapped to the authority or service that actually handles it.",

  "pricing.title": "Access tiers",
  "pricing.free": "Free",
  "pricing.freePrice": "€0",
  "pricing.freeDesc":
    "Questionnaire + brief AI analysis + a general overview of your current status and direction.",
  "pricing.freeExcl": "Does not include the full Smart Integration Profile or the 12-Week Roadmap.",
  "pricing.nav": "SettleSmart Navigator",
  "pricing.navPrice": "€9.90",
  "pricing.perMonth": "/month",
  "pricing.navDesc":
    "Full Smart Integration Profile (all three dimensions), full 12-Week Roadmap, step-by-step execution guidance, live editing and recalculation.",
  "pricing.stab": "Stabilization Package",
  "pricing.stabPrice": "€249",
  "pricing.stabDesc":
    "Monitoring, evaluation, guidance and service referral. Future offering — not active in this MVP.",
  "pricing.future": "Future · not active",
  "pricing.recommended": "Recommended",
  "pricing.upgrade": "Upgrade to Navigator",

  "consent.title": "Before you start: data & consent",
  "consent.p1":
    "This assessment collects structured information about your legal status, education and career, financial capacity, psychological readiness, legal history and your Finland strategy. It is used for one purpose only: to calculate your integration-readiness profile and to personalize your 12-week roadmap.",
  "consent.p2":
    "The visa-refusal question (Q31) and the immigration-violation / unauthorized-overstay question (Q33) are answered on a fixed-choice basis. Where an optional free-text reason is offered, it is used only for roadmap personalization and is never shared with government authorities.",
  "consent.p3":
    "MigraGo does not replace legal advice or official authorities, and does not guarantee residence or integration outcomes. You can request deletion of all of your data at any time from Profile Settings.",
  "consent.privacy": "Read the short privacy note",
  "consent.privacyBody":
    "We store only the answers you give, plus your score history, to show how your profile evolves. No answer is sold, shared with authorities, or used to identify you in aggregate statistics. Deleting your data removes your answers, scores and roadmap permanently.",
  "consent.check":
    "I have read the above and consent to MigraGo processing these answers, including sensitive-adjacent details, to generate my profile and roadmap (GDPR Art. 6/9 lawful basis).",
  "consent.continue": "I consent — start the assessment",
  "consent.back": "Back",

  "q.progress": "Progress",
  "q.section": "Section",
  "q.of": "of",
  "q.estimate": "Estimated time",
  "q.min": "min",
  "q.next": "Next section",
  "q.prev": "Previous",
  "q.saved": "Answers saved",
  "q.saveResume": "Saved automatically — you can close this and resume later.",
  "q.submit": "Analyze my profile",
  "q.optionalSection": "Optional — Special Track",
  "q.optionalNote":
    "These four questions are excluded from your core score. They can unlock fast-track and talent-pathway content in your roadmap.",
  "q.required": "Please answer the questions in this section to continue.",
  "q.detail": "Details",
  "q.number": "Number",
  "q.selectCountry": "Select a country",
  "q.bracketNote": "Bracket-based only — we never ask for an exact figure.",

  "loading.analyzing": "Analyzing your answers…",
  "loading.analyzingSub":
    "Matching your profile against the Finnish institutional knowledge base.",
  "loading.roadmap": "Building your 12-week roadmap…",
  "loading.roadmapSub": "Sequencing steps by phase, priority and responsible institution.",

  "dash.title": "Smart Integration Profile",
  "dash.overall": "Baseline readiness score",
  "dash.dim1": "Legal Status",
  "dash.dim2": "Professional Skills",
  "dash.dim3": "Psychological Readiness",
  "dash.weight": "weight",
  "dash.bonus": "Bonus Pathway Indicator",
  "dash.bonusNote":
    "Talent & Founder potential — reported separately, never part of the 100-point base score.",
  "dash.composition": "Dimension composition",
  "dash.byDimension": "Score by dimension",
  "dash.analysis": "AI analysis — overview",
  "dash.strengths": "Strengths",
  "dash.gaps": "Priority gaps",
  "dash.editAnswers": "Edit my answers",
  "dash.recalc": "Recalculated live from your latest answers.",
  "dash.history": "Score history",
  "dash.noHistory": "Your first snapshot is saved. Edit an answer to see your profile evolve.",
  "dash.roadmapTab": "12-Week Roadmap",
  "dash.profileTab": "Profile",
  "dash.settingsTab": "Settings",
  "dash.deleteData": "Delete all my data",
  "dash.deleteDone": "All of your data has been deleted.",
  "dash.langSection": "Language",

  "pay.title": "Your profile is ready",
  "pay.sub":
    "Your free analysis gives you the general direction. Unlock the full Smart Integration Profile and your 12-week roadmap with SettleSmart Navigator.",
  "pay.teaser": "Locked preview",
  "pay.unlock": "Unlock for €9.90/month",
  "pay.later": "Stay on the free overview",
  "pay.demoNote": "Demo checkout — no payment is taken in this MVP.",

  "road.title": "12-Week Roadmap",
  "road.sub": "Four phases. Every step traced to the institution that handles it.",
  "road.phase1": "Weeks 1–3 — Legal & Administrative Foundation",
  "road.phase2": "Weeks 4–6 — Daily Life & Language Stability",
  "road.phase3": "Weeks 7–9 — Employment & Professional Pathway",
  "road.phase4": "Weeks 10–12 — Social Belonging & Community",
  "road.institution": "Source institution",
  "road.priority": "Priority",
  "road.high": "High",
  "road.medium": "Medium",
  "road.normal": "Normal",
  "road.week": "Week",
  "road.composition": "Phase composition",
  "road.steps": "steps",
  "road.locked": "Unlock your roadmap with SettleSmart Navigator.",

  "metrics.title": "Founder Validation Dashboard",
  "metrics.banner": "Internal validation metrics — for evaluator demonstration purposes.",
  "metrics.gate": "This dashboard is private.",
  "metrics.password": "Access password",
  "metrics.enter": "Enter",
  "metrics.wrong": "Incorrect password.",
  "metrics.registrations": "Registrations over time",
  "metrics.completion": "Questionnaire completion rate",
  "metrics.started": "Started",
  "metrics.finished": "Finished",
  "metrics.funnel": "Free → paywall conversion funnel",
  "metrics.wtp": "Willingness-to-pay signal",
  "metrics.upgradeClicks": "\"Upgrade to Navigator\" clicks",
  "metrics.checkoutStarted": "€9.90 checkouts initiated",
  "metrics.checkoutDone": "€9.90 checkouts completed",
  "metrics.nationalities": "Top nationalities (aggregate)",
  "metrics.pathways": "Top Finland pathways selected",
  "metrics.countryInterest": "\"Coming Soon\" country interest",
  "metrics.aggregateNote": "Aggregate only — no individually identifiable data is shown.",
  "metrics.logout": "Lock dashboard",

  "footer.legal":
    "MigraGo does not replace legal advice or official authorities, and does not guarantee residence or integration outcomes.",
  "footer.rights": "MigraGo — SettleSmart Navigator",
  "common.back": "Back",
  "common.continue": "Continue",
  "common.close": "Close",
  "common.yes": "Yes",
  "common.no": "No",
};

export const fa: Record<keyof typeof en, string> = {
  "nav.country": "کشور",
  "nav.language": "زبان",
  "nav.cta": "شروع ارزیابی رایگان",
  "nav.profile": "پروفایل من",
  "nav.dashboard": "داشبورد",
  "nav.comingSoon": "به‌زودی",
  "nav.comingSoonTip": "در این نسخه فعال نیست — به‌زودی.",

  "hero.title": "بدانید کجا ایستاده‌اید. بدانید قدم بعدی چیست.",
  "hero.sub":
    "میگراگو با یک ارزیابی هوشمند، وضعیت فعلی و میزان آمادگی شما برای ادغام اجتماعی را ترسیم می‌کند و سپس یک نقشه‌راه شخصی‌سازی‌شدهٔ ۱۲ هفته‌ای بر پایهٔ قوانین، رویه‌ها و خدمات واقعی برای شما می‌سازد.",
  "hero.badge": "فنلاند · مسیر ادغام مبتنی بر شواهد",
  "hero.time": "۹ تا ۱۲ دقیقه · ۴۲ پرسش · ذخیره و ادامه در هر زمان",

  "about.title": "میگراگو چیست",
  "about.definitionTitle": "تعریف",
  "about.definition":
    "یک ابزار دیجیتال مسیرساز و فناورانه که داده‌های ساختارمند مهاجران را تحلیل می‌کند تا آمادگی آنان برای ادغام اجتماعی را بسنجد.",
  "about.missionTitle": "مأموریت",
  "about.mission":
    "تبدیل اطلاعات پراکنده به یک مسیر روشن و قابل اجرا به سوی ادغام.",
  "about.boundariesTitle": "محدودهٔ مسئولیت",
  "about.boundaries":
    "میگراگو جایگزین مشاورهٔ حقوقی یا مراجع رسمی نیست و هیچ تضمینی برای دریافت اقامت یا نتیجهٔ ادغام ارائه نمی‌دهد.",

  "how.title": "چگونه کار می‌کند",
  "how.s1.t": "ارزیابی ساختارمند",
  "how.s1.d": "۷ بخش، ۴۲ پرسش، با ذخیرهٔ خودکار در هر پاسخ.",
  "how.s2.t": "پروفایل هوشمند ادغام",
  "how.s2.d": "وضعیت حقوقی، مهارت‌های حرفه‌ای و آمادگی روانی با نمرهٔ ۰ تا ۱۰۰.",
  "how.s3.t": "نقشه‌راه ۱۲ هفته‌ای",
  "how.s3.d": "چهار فاز؛ هر گام به یک نهاد رسمی فنلاند متصل است.",

  "inst.title": "متصل به نهادهای واقعی",
  "inst.sub": "هر گام نقشه‌راه به مرجع یا سازمانی که واقعاً متولی آن است نسبت داده می‌شود.",

  "pricing.title": "سطوح دسترسی",
  "pricing.free": "رایگان",
  "pricing.freePrice": "۰ یورو",
  "pricing.freeDesc":
    "پرسش‌نامه + تحلیل کوتاه هوش مصنوعی + نمای کلی از وضعیت و جهت‌گیری فعلی شما.",
  "pricing.freeExcl": "شامل پروفایل کامل هوشمند ادغام یا نقشه‌راه ۱۲ هفته‌ای نمی‌شود.",
  "pricing.nav": "SettleSmart Navigator",
  "pricing.navPrice": "۹٫۹۰ یورو",
  "pricing.perMonth": "/ماه",
  "pricing.navDesc":
    "پروفایل کامل هوشمند ادغام (هر سه بُعد)، نقشه‌راه کامل ۱۲ هفته‌ای، راهنمای اجرای گام‌به‌گام، ویرایش زنده و محاسبهٔ مجدد.",
  "pricing.stab": "بستهٔ تثبیت",
  "pricing.stabPrice": "۲۴۹ یورو",
  "pricing.stabDesc":
    "پایش، ارزیابی، راهنمایی و ارجاع به خدمات. محصول آینده — در این نسخه فعال نیست.",
  "pricing.future": "آینده · غیرفعال",
  "pricing.recommended": "پیشنهاد ما",
  "pricing.upgrade": "ارتقا به Navigator",

  "consent.title": "پیش از شروع: داده‌ها و رضایت آگاهانه",
  "consent.p1":
    "این ارزیابی اطلاعاتی ساختارمند دربارهٔ وضعیت حقوقی، تحصیلات و سابقهٔ شغلی، توان مالی، آمادگی روانی، سابقهٔ حقوقی و راهبرد شما برای فنلاند گردآوری می‌کند. این داده‌ها تنها برای یک هدف به کار می‌رود: محاسبهٔ پروفایل آمادگی ادغام شما و شخصی‌سازی نقشه‌راه ۱۲ هفته‌ای.",
  "consent.p2":
    "پرسش مربوط به ریجکتی ویزا (پرسش ۳۱) و پرسش مربوط به تخلف مهاجرتی / اقامت غیرمجاز (پرسش ۳۳) صرفاً به‌صورت گزینه‌ای پاسخ داده می‌شوند. در مواردی که شرح اختیاری متنی ارائه شود، تنها برای شخصی‌سازی نقشه‌راه استفاده می‌گردد و هرگز با مراجع دولتی به اشتراک گذاشته نمی‌شود.",
  "consent.p3":
    "میگراگو جایگزین مشاورهٔ حقوقی یا مراجع رسمی نیست و تضمینی برای اقامت یا نتیجهٔ ادغام نمی‌دهد. شما می‌توانید در هر زمان از بخش تنظیمات پروفایل، حذف کامل داده‌های خود را درخواست کنید.",
  "consent.privacy": "مطالعهٔ یادداشت کوتاه حریم خصوصی",
  "consent.privacyBody":
    "ما تنها پاسخ‌هایی که می‌دهید و تاریخچهٔ نمرهٔ شما را ذخیره می‌کنیم تا روند تحول پروفایل‌تان را نشان دهیم. هیچ پاسخی فروخته نمی‌شود، با مراجع دولتی به اشتراک گذاشته نمی‌شود و برای شناسایی شما در آمار تجمیعی به کار نمی‌رود. حذف داده‌ها، پاسخ‌ها، نمرات و نقشه‌راه شما را برای همیشه پاک می‌کند.",
  "consent.check":
    "متن بالا را خوانده‌ام و رضایت می‌دهم که میگراگو این پاسخ‌ها، از جمله جزئیات نزدیک به دادهٔ حساس، را برای تولید پروفایل و نقشه‌راه من پردازش کند (مبنای قانونی مواد ۶ و ۹ مقررات GDPR).",
  "consent.continue": "رضایت می‌دهم — شروع ارزیابی",
  "consent.back": "بازگشت",

  "q.progress": "پیشرفت",
  "q.section": "بخش",
  "q.of": "از",
  "q.estimate": "زمان تقریبی",
  "q.min": "دقیقه",
  "q.next": "بخش بعدی",
  "q.prev": "بخش قبلی",
  "q.saved": "پاسخ‌ها ذخیره شد",
  "q.saveResume": "به‌صورت خودکار ذخیره می‌شود — می‌توانید ببندید و بعداً ادامه دهید.",
  "q.submit": "تحلیل پروفایل من",
  "q.optionalSection": "اختیاری — مسیر ویژه",
  "q.optionalNote":
    "این چهار پرسش در نمرهٔ اصلی شما محاسبه نمی‌شود و می‌تواند محتوای مسیر سریع و مسیر استعدادهای برجسته را در نقشه‌راه شما فعال کند.",
  "q.required": "برای ادامه، لطفاً پرسش‌های این بخش را پاسخ دهید.",
  "q.detail": "توضیح",
  "q.number": "تعداد",
  "q.selectCountry": "کشور را انتخاب کنید",
  "q.bracketNote": "تنها بر پایهٔ بازهٔ عددی — هرگز رقم دقیق پرسیده نمی‌شود.",

  "loading.analyzing": "در حال تحلیل پاسخ‌های شما…",
  "loading.analyzingSub": "تطبیق پروفایل شما با پایگاه دانش نهادهای رسمی فنلاند.",
  "loading.roadmap": "در حال ساخت نقشه‌راه ۱۲ هفته‌ای شما…",
  "loading.roadmapSub": "چینش گام‌ها بر اساس فاز، اولویت و نهاد مسئول.",

  "dash.title": "پروفایل هوشمند ادغام",
  "dash.overall": "نمرهٔ پایهٔ آمادگی",
  "dash.dim1": "وضعیت حقوقی",
  "dash.dim2": "مهارت‌های حرفه‌ای",
  "dash.dim3": "آمادگی روانی",
  "dash.weight": "وزن",
  "dash.bonus": "شاخص مسیر مکمل",
  "dash.bonusNote":
    "توان استعداد و کارآفرینی — جداگانه گزارش می‌شود و هرگز بخشی از نمرهٔ پایهٔ ۱۰۰ نیست.",
  "dash.composition": "ترکیب ابعاد",
  "dash.byDimension": "نمره بر اساس بُعد",
  "dash.analysis": "تحلیل هوش مصنوعی — نمای کلی",
  "dash.strengths": "نقاط قوت",
  "dash.gaps": "شکاف‌های اولویت‌دار",
  "dash.editAnswers": "ویرایش پاسخ‌های من",
  "dash.recalc": "به‌صورت زنده از آخرین پاسخ‌های شما محاسبه شده است.",
  "dash.history": "تاریخچهٔ نمره",
  "dash.noHistory": "نخستین وضعیت ثبت شد. یک پاسخ را ویرایش کنید تا تحول پروفایل‌تان را ببینید.",
  "dash.roadmapTab": "نقشه‌راه ۱۲ هفته‌ای",
  "dash.profileTab": "پروفایل",
  "dash.settingsTab": "تنظیمات",
  "dash.deleteData": "حذف همهٔ داده‌های من",
  "dash.deleteDone": "همهٔ داده‌های شما حذف شد.",
  "dash.langSection": "زبان",

  "pay.title": "پروفایل شما آماده است",
  "pay.sub":
    "تحلیل رایگان، جهت کلی مسیر شما را نشان می‌دهد. برای دیدن پروفایل کامل هوشمند ادغام و نقشه‌راه ۱۲ هفته‌ای، اشتراک SettleSmart Navigator را فعال کنید.",
  "pay.teaser": "پیش‌نمایش قفل‌شده",
  "pay.unlock": "فعال‌سازی با ۹٫۹۰ یورو در ماه",
  "pay.later": "ادامه با نمای رایگان",
  "pay.demoNote": "پرداخت نمایشی — در این نسخه هیچ مبلغی دریافت نمی‌شود.",

  "road.title": "نقشه‌راه ۱۲ هفته‌ای",
  "road.sub": "چهار فاز. هر گام به نهاد متولی آن نسبت داده شده است.",
  "road.phase1": "هفتهٔ ۱ تا ۳ — بنیاد حقوقی و اداری",
  "road.phase2": "هفتهٔ ۴ تا ۶ — زندگی روزمره و تثبیت زبان",
  "road.phase3": "هفتهٔ ۷ تا ۹ — اشتغال و مسیر حرفه‌ای",
  "road.phase4": "هفتهٔ ۱۰ تا ۱۲ — تعلق اجتماعی و جامعهٔ محلی",
  "road.institution": "نهاد مرجع",
  "road.priority": "اولویت",
  "road.high": "بالا",
  "road.medium": "متوسط",
  "road.normal": "معمول",
  "road.week": "هفته",
  "road.composition": "ترکیب فازها",
  "road.steps": "گام",
  "road.locked": "نقشه‌راه خود را با اشتراک SettleSmart Navigator باز کنید.",

  "metrics.title": "داشبورد اعتبارسنجی بنیان‌گذار",
  "metrics.banner": "شاخص‌های اعتبارسنجی داخلی — برای ارائه به ارزیاب.",
  "metrics.gate": "این داشبورد خصوصی است.",
  "metrics.password": "رمز دسترسی",
  "metrics.enter": "ورود",
  "metrics.wrong": "رمز نادرست است.",
  "metrics.registrations": "روند ثبت‌نام‌ها",
  "metrics.completion": "نرخ تکمیل پرسش‌نامه",
  "metrics.started": "شروع‌شده",
  "metrics.finished": "تکمیل‌شده",
  "metrics.funnel": "قیف تبدیل رایگان به صفحهٔ پرداخت",
  "metrics.wtp": "سیگنال تمایل به پرداخت",
  "metrics.upgradeClicks": "کلیک روی «ارتقا به Navigator»",
  "metrics.checkoutStarted": "پرداخت‌های ۹٫۹۰ یورویی آغازشده",
  "metrics.checkoutDone": "پرداخت‌های ۹٫۹۰ یورویی تکمیل‌شده",
  "metrics.nationalities": "بیشترین ملیت‌ها (تجمیعی)",
  "metrics.pathways": "پرانتخاب‌ترین مسیرهای فنلاند",
  "metrics.countryInterest": "علاقه به کشورهای «به‌زودی»",
  "metrics.aggregateNote": "تنها داده تجمیعی — هیچ اطلاعات قابل شناسایی فردی نمایش داده نمی‌شود.",
  "metrics.logout": "قفل داشبورد",

  "footer.legal":
    "میگراگو جایگزین مشاورهٔ حقوقی یا مراجع رسمی نیست و تضمینی برای اقامت یا نتیجهٔ ادغام ارائه نمی‌دهد.",
  "footer.rights": "میگراگو — SettleSmart Navigator",
  "common.back": "بازگشت",
  "common.continue": "ادامه",
  "common.close": "بستن",
  "common.yes": "بله",
  "common.no": "خیر",
};

const dicts = { en, fa };
export type TKey = keyof typeof en;

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  pick: <T>(v: { en: T; fa: T }) => T;
};

const LangContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "migrago.lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fa" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "fa" ? "rtl" : "ltr",
      setLang,
      t: (k: TKey) => dicts[lang][k] ?? en[k],
      pick: <T,>(v: { en: T; fa: T }) => v[lang],
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export function localizeNumber(value: number | string, lang: Lang) {
  const s = String(value);
  if (lang !== "fa") return s;
  return s.replace(/\d/g, (d) => faDigits[Number(d)] ?? d);
}
