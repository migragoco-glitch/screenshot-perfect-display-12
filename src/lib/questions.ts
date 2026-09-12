export type QType =
  | "number"
  | "text"
  | "single"
  | "multi"
  | "scale"
  | "country";

export type Bilingual = { en: string; fa: string };

export type Question = {
  id: number;
  section: number;
  type: QType;
  label: Bilingual;
  hint?: Bilingual;
  options?: Bilingual[];
  /** score contribution (0..1) for each option index */
  optionScores?: number[];
  /** anchors for 1-5 scales */
  anchors?: { low: Bilingual; high: Bilingual };
  /** option index that reveals a free-text/number detail field */
  detailOn?: number;
  detailLabel?: Bilingual;
  detailType?: "text" | "number";
  /** index of an exclusive "None" option in a multi-select */
  noneIndex?: number;
  /** second part of the same question (answer index stored in `detail`) */
  sub?: { label: Bilingual; options: Bilingual[]; optionScores?: number[] };
  /** show question only when this predicate passes */
  showIf?: (answers: Answers) => boolean;
  /** excluded from every score bucket */
  unscored?: boolean;
};

export type AnswerValue = {
  value?: number | string | number[] | undefined;
  detail?: string | undefined;
};
export type Answers = Record<number, AnswerValue | undefined>;

export const SECTIONS: { id: number; title: Bilingual; minutes: number; optional?: boolean }[] = [
  { id: 1, title: { en: "Identity & Current Status", fa: "هویت و وضعیت کنونی" }, minutes: 2 },
  {
    id: 2,
    title: { en: "Education & Professional Capacity", fa: "تحصیلات و توان حرفه‌ای" },
    minutes: 2,
  },
  { id: 3, title: { en: "Financial Readiness", fa: "آمادگی مالی" }, minutes: 2 },
  {
    id: 4,
    title: { en: "Adaptability & Social Readiness", fa: "انطباق‌پذیری و آمادگی اجتماعی" },
    minutes: 2,
  },
  { id: 5, title: { en: "Legal & Document Readiness", fa: "آمادگی حقوقی و مدارک" }, minutes: 1 },
  {
    id: 6,
    title: {
      en: "Destination & Pathway Strategy",
      fa: "راهبرد مقصد و مسیر",
    },
    minutes: 1,
  },
  {
    id: 7,
    title: { en: "Personal Potential & Action Readiness", fa: "توان فردی و آمادگی اقدام" },
    minutes: 1,
    optional: true,
  },
];

/**
 * Which scoring dimension each level feeds into (for the ⓘ header hint).
 * Levels 6 and 7 are context only: they feed pathway matching and roadmap
 * sequencing, never the three readiness dimensions.
 */
export const SECTION_DIMENSION: Record<number, "legal" | "professional" | "psychological" | "bonus"> = {
  1: "legal",
  2: "professional",
  3: "professional",
  4: "psychological",
  5: "legal",
  6: "bonus",
  7: "bonus",
};

const o = (en: string, fa: string): Bilingual => ({ en, fa });

export const QUESTIONS: Question[] = [
  // ── Section 1 ───────────────────────────────────────────────
  {
    id: 1,
    section: 1,
    type: "number",
    unscored: true,
    label: o("What is your age?", "سن شما چند سال است؟"),
  },
  {
    id: 2,
    section: 1,
    type: "country",
    unscored: true,
    label: o("What is your current nationality?", "ملیت کنونی شما چیست؟"),
  },
  {
    id: 3,
    section: 1,
    type: "country",
    unscored: true,
    label: o("Which country do you currently reside in?", "در حال حاضر در کدام کشور زندگی می‌کنید؟"),
  },
  {
    id: 4,
    section: 1,
    type: "single",
    label: o(
      "Do you hold dual nationality or a second passport?",
      "آیا تابعیت دوگانه یا پاسپورت دوم دارید؟",
    ),
    options: [o("No", "خیر"), o("Yes", "بله")],
    optionScores: [0.55, 1],
    detailOn: 1,
    detailType: "text",
    detailLabel: o("Country name", "نام کشور"),
  },
  {
    id: 5,
    section: 1,
    type: "single",
    unscored: true,
    label: o("What is your current marital status?", "وضعیت تأهل کنونی شما چیست؟"),
    options: [o("Single", "مجرد"), o("Married", "متأهل"), o("Divorced", "جدا شده"), o("Widowed", "همسر از دست داده")],
  },
  {
    id: 6,
    section: 1,
    type: "single",
    label: o(
      "Is your marriage or divorce officially registered?",
      "آیا ازدواج یا طلاق شما به‌طور رسمی ثبت شده است؟",
    ),
    options: [o("Yes", "بله"), o("No", "خیر")],
    optionScores: [1, 0.5],
    showIf: (a) => {
      const v = a[5]?.value;
      return v === 1 || v === 2;
    },
  },
  {
    id: 7,
    section: 1,
    type: "single",
    label: o("Do you have dependent children under 18?", "آیا فرزند تحت تکفل زیر ۱۸ سال دارید؟"),
    options: [o("No", "خیر"), o("Yes", "بله")],
    optionScores: [1, 0.8],
    detailOn: 1,
    detailType: "number",
    detailLabel: o("Number of children", "تعداد فرزندان"),
  },
  {
    id: 8,
    section: 1,
    type: "multi",
    unscored: true,
    label: o("Who will be relocating to Finland with you?", "چه کسانی همراه شما به فنلاند مهاجرت می‌کنند؟"),
    options: [
      o("Alone", "تنها"),
      o("Spouse/partner", "همسر / شریک زندگی"),
      o("Child(ren)", "فرزند(ان)"),
      o("Parents or other relatives", "والدین یا سایر بستگان"),
      o("Not yet decided", "هنوز تصمیم نگرفته‌ام"),
    ],
    noneIndex: 4,
  },

  // ── Section 2 ───────────────────────────────────────────────
  {
    id: 9,
    section: 2,
    type: "single",
    label: o("What is your highest level of education?", "بالاترین مدرک تحصیلی شما چیست؟"),
    options: [
      o("Below high school diploma", "کمتر از دیپلم"),
      o("High school diploma", "دیپلم"),
      o("Associate degree", "فوق‌دیپلم"),
      o("Bachelor's degree", "کارشناسی"),
      o("Master's degree", "کارشناسی ارشد"),
      o("Doctorate", "دکتری"),
    ],
    optionScores: [0.2, 0.4, 0.6, 0.8, 0.92, 1],
  },
  {
    id: 10,
    section: 2,
    type: "text",
    unscored: true,
    label: o(
      "Briefly describe your field and current job title.",
      "به‌اختصار حوزهٔ کاری و عنوان شغلی کنونی خود را بنویسید.",
    ),
  },
  {
    id: 11,
    section: 2,
    type: "single",
    label: o("Which category best describes your field of work?", "کدام دسته بیشترین تطابق را با حوزهٔ کاری شما دارد؟"),
    options: [
      o("Engineering & Technology", "مهندسی و فناوری"),
      o("Health", "سلامت و درمان"),
      o("Business & Management", "کسب‌وکار و مدیریت"),
      o("Arts & Design", "هنر و طراحی"),
      o("Technical/Vocational", "فنی و حرفه‌ای"),
      o("Other", "سایر"),
    ],
    optionScores: [1, 1, 0.9, 0.7, 0.85, 0.6],
  },
  {
    id: 12,
    section: 2,
    type: "single",
    label: o(
      "How many years of experience do you have in your field of expertise?",
      "چند سال سابقهٔ کار در حوزهٔ تخصصی خود دارید؟",
    ),
    options: [
      o("Less than 1 year", "کمتر از ۱ سال"),
      o("1–3 years", "۱ تا ۳ سال"),
      o("4–7 years", "۴ تا ۷ سال"),
      o("8–15 years", "۸ تا ۱۵ سال"),
      o("More than 15 years", "بیش از ۱۵ سال"),
    ],
    optionScores: [0.2, 0.5, 0.75, 1, 0.95],
  },
  {
    id: 13,
    section: 2,
    type: "single",
    label: o("What is your current employment status?", "وضعیت اشتغال کنونی شما چیست؟"),
    options: [
      o("Full-time", "تمام‌وقت"),
      o("Freelancer", "فریلنسر"),
      o("Business owner", "صاحب کسب‌وکار"),
      o("Student", "دانشجو"),
      o("Unemployed", "بدون شغل"),
    ],
    optionScores: [1, 0.85, 0.9, 0.6, 0.4],
  },
  {
    id: 14,
    section: 2,
    type: "single",
    label: o(
      "How confident are you that your qualifications and professional credentials are ready for your intended work or study pathway?",
      "چقدر اطمینان دارید که مدارک تحصیلی و حرفه‌ای شما برای مسیر کاری یا تحصیلی موردنظرتان آماده است؟",
    ),
    options: [
      o("Fully ready", "کاملاً آماده"),
      o("Mostly ready", "تا حد زیادی آماده"),
      o("Partly ready", "تا حدی آماده"),
      o("Not ready yet", "هنوز آماده نیست"),
      o("I'm not sure", "مطمئن نیستم"),
    ],
    optionScores: [1, 0.8, 0.55, 0.3, 0.4],
  },
  {
    id: 15,
    section: 2,
    type: "single",
    label: o(
      "How would you describe your current English proficiency for living, working, or studying in Finland?",
      "سطح کنونی زبان انگلیسی خود را برای زندگی، کار یا تحصیل در فنلاند چگونه توصیف می‌کنید؟",
    ),
    options: [
      o("Beginner", "مبتدی"),
      o("Basic", "پایه"),
      o("Intermediate", "متوسط"),
      o("Upper-intermediate", "بالاتر از متوسط"),
      o("Advanced", "پیشرفته"),
    ],
    optionScores: [0.15, 0.35, 0.6, 0.85, 1],
    sub: {
      label: o(
        "How would you describe your current Finnish or Swedish proficiency?",
        "سطح کنونی زبان فنلاندی یا سوئدی خود را چگونه توصیف می‌کنید؟",
      ),
      options: [
        o("None", "هیچ"),
        o("Basic", "پایه"),
        o("Intermediate", "متوسط"),
        o("Advanced", "پیشرفته"),
      ],
      optionScores: [0.25, 0.55, 0.8, 1],
    },
  },
  {
    id: 16,
    section: 2,
    type: "single",
    label: o(
      "Do you hold a recognized international language certificate? (e.g., IELTS, TOEFL)",
      "آیا مدرک زبان بین‌المللی معتبر دارید؟ (مثلاً IELTS یا TOEFL)",
    ),
    options: [o("No", "خیر"), o("Yes", "بله")],
    optionScores: [0.5, 1],
    detailOn: 1,
    detailType: "text",
    detailLabel: o("Type and score", "نوع مدرک و نمره"),
    // Relevant when the reported English level may require supporting evidence.
    showIf: (a) => {
      const english = a[15]?.value;
      return typeof english !== "number" || english <= 3;
    },
  },

  // ── Section 3 ───────────────────────────────────────────────
  {
    id: 17,
    section: 3,
    type: "single",
    label: o(
      "What is your average current monthly income bracket? (EUR equivalent)",
      "بازهٔ میانگین درآمد ماهانهٔ کنونی شما چقدر است؟ (معادل یورو)",
    ),
    options: [
      o("Under 500", "کمتر از ۵۰۰"),
      o("500–1,500", "۵۰۰ تا ۱٫۵۰۰"),
      o("1,500–3,000", "۱٫۵۰۰ تا ۳٫۰۰۰"),
      o("3,000–5,000", "۳٫۰۰۰ تا ۵٫۰۰۰"),
      o("Over 5,000", "بیش از ۵٫۰۰۰"),
    ],
    optionScores: [0.2, 0.45, 0.65, 0.85, 1],
  },
  {
    id: 18,
    section: 3,
    type: "scale",
    label: o(
      "How confident are you in the stability and continuity of your current income?",
      "تا چه اندازه به پایداری و تداوم درآمد کنونی خود اطمینان دارید؟",
    ),
    anchors: {
      low: o("Not stable at all", "به‌هیچ‌وجه پایدار نیست"),
      high: o("Fully guaranteed and stable", "کاملاً تضمین‌شده و پایدار"),
    },
  },
  {
    id: 19,
    section: 3,
    type: "single",
    label: o(
      "What is the primary source of funding for your initial migration expenses?",
      "منبع اصلی تأمین هزینه‌های اولیهٔ مهاجرت شما چیست؟",
    ),
    options: [
      o("Personal savings", "پس‌انداز شخصی"),
      o("Sale of property/assets", "فروش ملک یا دارایی"),
      o("Family support", "حمایت خانواده"),
      o("Bank loan", "وام بانکی"),
      o("Combination of the above", "ترکیبی از موارد بالا"),
    ],
    optionScores: [1, 0.8, 0.7, 0.5, 0.85],
  },
  {
    id: 20,
    section: 3,
    type: "single",
    label: o(
      "What is the level of official documentation for your financial source (payslip, contract, deed)?",
      "سطح مستندسازی رسمی منبع مالی شما (فیش حقوقی، قرارداد، سند) چگونه است؟",
    ),
    options: [
      o("Complete and ready", "کامل و آماده"),
      o("Incomplete — needs work", "ناقص — نیازمند تکمیل"),
      o("Nothing prepared yet", "هنوز چیزی آماده نیست"),
    ],
    optionScores: [1, 0.6, 0.3],
    // Documentation is relevant when the user reports a financial source that
    // needs separate supporting evidence; pathway choice itself never scores.
    showIf: (a) => a[19]?.value !== 0,
  },
  {
    id: 21,
    section: 3,
    type: "single",
    label: o(
      "What is your total available cash capital for the migration process? (EUR)",
      "کل سرمایهٔ نقدی در دسترس شما برای فرایند مهاجرت چقدر است؟ (یورو)",
    ),
    options: [
      o("Under 2,000", "کمتر از ۲٫۰۰۰"),
      o("2,000–6,000", "۲٫۰۰۰ تا ۶٫۰۰۰"),
      o("6,000–15,000", "۶٫۰۰۰ تا ۱۵٫۰۰۰"),
      o("15,000–30,000", "۱۵٫۰۰۰ تا ۳۰٫۰۰۰"),
      o("Over 30,000", "بیش از ۳۰٫۰۰۰"),
    ],
    optionScores: [0.2, 0.45, 0.65, 0.85, 1],
  },
  {
    id: 22,
    section: 3,
    type: "single",
    label: o(
      "With your current budget and no new income, how many months could you sustain yourself in Finland?",
      "با بودجهٔ کنونی و بدون درآمد جدید، چند ماه می‌توانید در فنلاند هزینه‌های خود را تأمین کنید؟",
    ),
    hint: o(
      "Income requirements vary by permit type in Finland — check migri.fi for the exact figure.",
      "حداقل درآمد موردنیاز بسته به نوع مجوز اقامت در فنلاند متفاوت است — برای رقم دقیق به migri.fi مراجعه کنید.",
    ),
    options: [
      o("Less than 1 month", "کمتر از ۱ ماه"),
      o("1–3 months", "۱ تا ۳ ماه"),
      o("4–6 months", "۴ تا ۶ ماه"),
      o("7–12 months", "۷ تا ۱۲ ماه"),
      o("More than 12 months", "بیش از ۱۲ ماه"),
    ],
    optionScores: [0.15, 0.4, 0.6, 0.85, 1],
  },
  {
    id: 23,
    section: 3,
    type: "single",
    label: o(
      "Do you carry significant debt or heavy financial obligations (large installments) in your home country?",
      "آیا در کشور خود بدهی قابل‌توجه یا تعهدات مالی سنگین (اقساط بزرگ) دارید؟",
    ),
    options: [o("Yes", "بله"), o("No", "خیر")],
    optionScores: [0.3, 1],
  },

  // ── Section 4 ───────────────────────────────────────────────
  {
    id: 24,
    section: 4,
    type: "scale",
    label: o(
      "When facing ambiguous or difficult circumstances, how well can you stay calm and problem-solve?",
      "در شرایط مبهم یا سخت، تا چه اندازه می‌توانید آرام بمانید و مسئله را حل کنید؟",
    ),
    anchors: {
      low: o("I get stressed very quickly", "خیلی زود مضطرب می‌شوم"),
      high: o("I stay calm and solution-focused even in a crisis", "حتی در بحران آرام و راه‌حل‌محور می‌مانم"),
    },
  },
  {
    id: 25,
    section: 4,
    type: "scale",
    label: o(
      "How eager are you to connect with people from a completely different culture and language?",
      "چقدر مایل‌اید با افرادی از فرهنگ و زبانی کاملاً متفاوت ارتباط بگیرید؟",
    ),
    anchors: {
      low: o("I prefer to stay in familiar environments", "ترجیح می‌دهم در محیط آشنا بمانم"),
      high: o("I welcome cultural difference", "از تفاوت فرهنگی استقبال می‌کنم"),
    },
  },
  {
    id: 26,
    section: 4,
    type: "scale",
    label: o(
      "If a problem arises at your destination, how much can you rely on emotional support from family or friends?",
      "اگر در کشور مقصد مشکلی پیش بیاید، تا چه اندازه می‌توانید به حمایت عاطفی خانواده یا دوستان تکیه کنید؟",
    ),
    anchors: {
      low: o("I have no support available", "هیچ حمایتی در دسترس ندارم"),
      high: o("I have a strong support network", "شبکهٔ حمایتی قوی دارم"),
    },
  },
  {
    id: 27,
    section: 4,
    type: "single",
    label: o(
      "Would you accept a temporarily lower-level job than your expertise to start your new life?",
      "آیا برای شروع زندگی جدید، پذیرش موقت شغلی پایین‌تر از سطح تخصص خود را می‌پذیرید؟",
    ),
    options: [o("Yes", "بله"), o("No", "خیر"), o("Depends on the circumstances", "بستگی به شرایط دارد")],
    optionScores: [1, 0.5, 0.75],
  },
  {
    id: 28,
    section: 4,
    type: "single",
    label: o(
      "What is your biggest concern on your migration path?",
      "بزرگ‌ترین دلواپسی شما در مسیر مهاجرت چیست؟",
    ),
    options: [
      o("Loneliness and distance from family", "تنهایی و دوری از خانواده"),
      o("Financial issues", "مسائل مالی"),
      o("Legal/administrative complexity", "پیچیدگی حقوقی و اداری"),
      o("Learning the language", "یادگیری زبان"),
      o("None", "هیچ‌کدام"),
    ],
    optionScores: [0.6, 0.6, 0.65, 0.7, 1],
  },
  {
    id: 29,
    section: 4,
    type: "scale",
    label: o(
      "When entering a new social environment, how comfortable are you starting conversations and building new connections?",
      "هنگام ورود به یک محیط اجتماعی جدید، تا چه اندازه در آغاز گفت‌وگو و ساختن ارتباط‌های تازه راحت هستید؟",
    ),
    anchors: {
      low: o("I usually need time before connecting", "معمولاً برای ارتباط‌گرفتن به زمان نیاز دارم"),
      high: o(
        "I comfortably start conversations and build new connections",
        "به‌راحتی گفت‌وگو را آغاز می‌کنم و ارتباط‌های تازه می‌سازم",
      ),
    },
  },

  // ── Section 5 ───────────────────────────────────────────────
  {
    id: 30,
    section: 5,
    type: "single",
    label: o(
      "Have you previously taken formal steps to migrate to any country?",
      "آیا پیش‌تر برای مهاجرت به کشوری اقدام رسمی کرده‌اید؟",
    ),
    options: [o("Yes", "بله"), o("No", "خیر")],
    optionScores: [0.9, 0.7],
  },
  {
    id: 31,
    section: 5,
    type: "single",
    label: o(
      "Have you had a visa refusal in the past 5 years? (reason is optional)",
      "آیا در ۵ سال گذشته ریجکتی ویزا داشته‌اید؟ (ذکر دلیل اختیاری است)",
    ),
    options: [o("No", "خیر"), o("Yes", "بله")],
    optionScores: [1, 0.5],
    detailOn: 1,
    detailType: "text",
    detailLabel: o("Reason (optional)", "دلیل (اختیاری)"),
  },
  {
    id: 32,
    section: 5,
    type: "single",
    label: o(
      "Do you currently hold an active visa or residence permit for another country?",
      "آیا در حال حاضر ویزا یا اجازهٔ اقامت فعال برای کشور دیگری دارید؟",
    ),
    options: [o("Yes", "بله"), o("No", "خیر")],
    optionScores: [1, 0.7],
  },
  {
    id: 33,
    section: 5,
    type: "single",
    label: o(
      "Have you had a history of immigration violations, unauthorized overstay, or deportation?",
      "آیا سابقهٔ تخلف مهاجرتی، اقامت غیرمجاز یا دیپورت داشته‌اید؟",
    ),
    options: [o("No", "خیر"), o("Yes", "بله")],
    optionScores: [1, 0.2],
  },
  {
    id: 34,
    section: 5,
    type: "scale",
    label: o(
      "What is the readiness level of your identity documents (official translation, notarization, apostille)?",
      "میزان آمادگی مدارک هویتی شما (ترجمهٔ رسمی، تأییدات، آپوستیل) در چه سطحی است؟",
    ),
    anchors: {
      low: o("I haven't started yet", "هنوز شروع نکرده‌ام"),
      high: o("All documents are ready and certified", "همهٔ مدارک آماده و تأییدشده است"),
    },
  },

  // ── Section 6 — context only (pathway matching & roadmap) ───
  {
    id: 35,
    section: 6,
    type: "single",
    unscored: true,
    label: o("What is your main reason for choosing Finland?", "دلیل اصلی شما برای انتخاب فنلاند چیست؟"),
    options: [
      o("Safety and quality of life", "امنیت و کیفیت زندگی"),
      o("Career growth and income", "رشد شغلی و درآمد"),
      o("Education for yourself or your children", "تحصیل خود یا فرزندان"),
      o("Starting a business", "راه‌اندازی کسب‌وکار"),
    ],
  },
  {
    id: 36,
    section: 6,
    type: "single",
    unscored: true,
    label: o(
      "What is your main intended basis for moving to Finland?",
      "مبنای اصلی موردنظر شما برای نقل مکان به فنلاند چیست؟",
    ),
    options: [
      o("Employment", "اشتغال"),
      o("Studies", "تحصیل"),
      o("Start-up entrepreneurship", "کارآفرینی استارتاپی"),
      o("Entrepreneurship", "کارآفرینی"),
      o("Family ties", "پیوندهای خانوادگی"),
      o("Other / Not sure yet", "سایر / هنوز مطمئن نیستم"),
    ],
  },
  {
    id: 37,
    section: 6,
    type: "single",
    unscored: true,
    label: o("How long do you intend to stay in Finland?", "قصد دارید چه مدت در فنلاند بمانید؟"),
    options: [
      o("Less than one year", "کمتر از یک سال"),
      o("More than one year / permanent", "بیش از یک سال / دائمی"),
    ],
  },
  {
    id: 38,
    section: 6,
    type: "single",
    unscored: true,
    label: o(
      "What is your intended timeframe for leaving your home country and settling in the destination country?",
      "بازهٔ زمانی مورد نظر شما برای خروج از کشور مبدأ و استقرار در کشور مقصد چقدر است؟",
    ),
    options: [
      o("Less than 3 months", "کمتر از ۳ ماه"),
      o("3–6 months", "۳ تا ۶ ماه"),
      o("6–12 months", "۶ تا ۱۲ ماه"),
      o("More than 1 year", "بیش از ۱ سال"),
      o("More than 2 years", "بیش از ۲ سال"),
    ],
  },

  // ── Section 7 (bonus) ───────────────────────────────────────
  {
    id: 39,
    section: 7,
    type: "single",
    label: o(
      "Do you have experience managing a team, an organization, or owning a business?",
      "آیا سابقهٔ مدیریت تیم، سازمان یا مالکیت کسب‌وکار دارید؟",
    ),
    options: [o("No", "خیر"), o("Yes", "بله")],
    optionScores: [0.3, 1],
    detailOn: 1,
    detailType: "number",
    detailLabel: o("Number of people managed", "تعداد افراد تحت مدیریت"),
  },
  {
    id: 40,
    section: 7,
    type: "multi",
    label: o("Which of these achievements do you have?", "کدام یک از این دستاوردها را دارید؟"),
    options: [
      o("International award", "جایزهٔ بین‌المللی"),
      o("Registered patent", "ثبت اختراع"),
      o("Authored a book/scientific paper", "تألیف کتاب یا مقالهٔ علمی"),
      o("Spoke at a specialized conference", "سخنرانی در کنفرانس تخصصی"),
      o("None", "هیچ‌کدام"),
    ],
    optionScores: [1, 1, 0.9, 0.85, 0.2],
    noneIndex: 4,
  },
  {
    id: 41,
    section: 7,
    type: "single",
    label: o("What is your level of professional recognition?", "سطح شناخته‌شدگی حرفه‌ای شما چقدر است؟"),
    options: [o("Local", "محلی"), o("National", "ملی"), o("International", "بین‌المللی")],
    optionScores: [0.4, 0.7, 1],
  },
  {
    id: 42,
    section: 7,
    type: "scale",
    // Action readiness: feeds the pacing/intensity of the 12-week roadmap only.
    unscored: true,
    label: o(
      "If you received your roadmap today, how ready are you to start acting on it operationally?",
      "اگر امروز نقشه‌راه خود را دریافت کنید، چقدر آمادهٔ اجرای عملی آن هستید؟",
    ),
    anchors: {
      low: o("I'm just at the curiosity stage", "فقط در مرحلهٔ کنجکاوی هستم"),
      high: o("I'm ready to act immediately", "آمادهٔ اقدام فوری هستم"),
    },
  },
];

/** Questions shown only when the user opts into the Founder & Talent track. */
export const FOUNDER_TRACK_IDS = [39, 40, 41] as const;

/** Whether a question applies to the current answer set. Hidden questions are Not Applicable. */
export function isQuestionApplicable(q: Question, answers: Answers) {
  return !q.showIf || q.showIf(answers);
}

export function questionsForSection(section: number, answers: Answers) {
  return QUESTIONS.filter((q) => q.section === section && isQuestionApplicable(q, answers));
}

export function isAnswered(q: Question, a: AnswerValue | undefined) {
  if (!a) return false;
  if (q.type === "multi") return Array.isArray(a.value) && a.value.length > 0;
  if (q.type === "text") return typeof a.value === "string" && a.value.trim().length > 1;
  if (q.sub && !(typeof a.detail === "string" && a.detail !== "")) return false;
  return a.value !== undefined && a.value !== "";
}

/** Index chosen for the second part of a two-part question, if any. */
export function subAnswerIndex(q: Question, a: AnswerValue | undefined): number | undefined {
  if (!q.sub || typeof a?.detail !== "string" || a.detail === "") return undefined;
  const n = Number(a.detail);
  return Number.isInteger(n) && n >= 0 && n < q.sub.options.length ? n : undefined;
}

export const COUNTRIES: Bilingual[] = [
  o("Afghanistan", "افغانستان"),
  o("Armenia", "ارمنستان"),
  o("Australia", "استرالیا"),
  o("Azerbaijan", "آذربایجان"),
  o("Bangladesh", "بنگلادش"),
  o("Brazil", "برزیل"),
  o("Canada", "کانادا"),
  o("China", "چین"),
  o("Egypt", "مصر"),
  o("Estonia", "استونی"),
  o("Finland", "فنلاند"),
  o("France", "فرانسه"),
  o("Georgia", "گرجستان"),
  o("Germany", "آلمان"),
  o("India", "هند"),
  o("Indonesia", "اندونزی"),
  o("Iran", "ایران"),
  o("Iraq", "عراق"),
  o("Italy", "ایتالیا"),
  o("Jordan", "اردن"),
  o("Kazakhstan", "قزاقستان"),
  o("Kenya", "کنیا"),
  o("Lebanon", "لبنان"),
  o("Malaysia", "مالزی"),
  o("Mexico", "مکزیک"),
  o("Morocco", "مراکش"),
  o("Nepal", "نپال"),
  o("Netherlands", "هلند"),
  o("Nigeria", "نیجریه"),
  o("Pakistan", "پاکستان"),
  o("Philippines", "فیلیپین"),
  o("Poland", "پلند"),
  o("Russia", "روسیه"),
  o("Saudi Arabia", "عربستان سعودی"),
  o("Spain", "اسپانیا"),
  o("Sweden", "سوئد"),
  o("Syria", "سوریه"),
  o("Türkiye", "ترکیه"),
  o("Ukraine", "اوکراین"),
  o("United Arab Emirates", "امارات متحدهٔ عربی"),
  o("United Kingdom", "بریتانیا"),
  o("United States", "ایالات متحده"),
  o("Uzbekistan", "ازبکستان"),
  o("Vietnam", "ویتنام"),
  o("Other", "سایر"),
];
