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
  "hero.badge": "Evidence-based integration pathway",
  "hero.badgeLine1": "Evidence-based integration path",
  "hero.badgeLine2": "Built on Finland's integration knowledge and ecosystem",
  "hero.time": "9–12 minutes — 42 questions — save and resume anytime",

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
  "how.s2.d":
    "Legal Status, Economic & Professional Capacity and Soft Skills & Psychological Readiness, each scored 0–100.",
  "how.s3.t": "12-week roadmap",
  "how.s3.d":
    "Every roadmap step is linked to the relevant official institution in Finland (such as Migri or DVV).",

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
    "In addition to SettleSmart Navigator's capabilities, this package guides you toward the relevant government authorities and institutions, as well as a network of verified individuals and organizations — including certified translators and translation offices, lawyers and advisors (financial, tax, career, legal, family), daycare centres, schools, universities, vocational and technical education institutions, and cultural and arts centres. It also includes monitoring and evaluation of your progress, and ongoing support-team guidance to answer questions during roadmap execution.",
  "pricing.stabFutureLabel": "Future vision (beyond current MVP scope)",
  "pricing.stabFuture":
    "In later development stages — following the necessary coordination, contractual agreements, and relevant licenses/permits with the institutions involved — this package could connect you directly to each institution's service desk at every roadmap phase, including scheduling and assigning a responsible caseworker, and, with your explicit consent, make your information visible on that institution's staff dashboard. This corresponds to the planned Connect+ (B2B) and institutional dashboard (B2G) capabilities, to be developed only after the core product has been validated. This package is not active in the current version.",
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
  "q.live.title": "Live progress",
  "q.live.overall": "Overall progress",
  "q.live.inProgress": "In progress",
  "q.live.note": "These rings show how much of the questionnaire you have completed — not your score. Your full scored profile unlocks on the dashboard.",
  "dash.snapshot": "Snapshot",
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
  "dash.dim2": "Economic & Professional Capacity",
  "dash.dim3": "Soft Skills & Psychological Readiness",
  "dash.weight": "weight",
  "dash.bonus": "Bonus Pathway Indicator",
  "dash.bonusNote":
    "Talent & Founder potential — reported separately, never part of the 100-point base score.",
  "dash.composition": "Dimension composition",
  "dash.byDimension": "Dimension balance",
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
  "road.sub":
    "Every roadmap step is linked to the relevant official institution in Finland (such as Migri or DVV).",
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

  "nav.signIn": "Sign in",
  "nav.logout": "Log out",

  "auth.subtitle": "Sign in to save your roadmap progress across devices. Your assessment answers stay on this device.",
  "auth.email": "Email",
  "auth.password": "Password (min. 8 characters)",
  "auth.signIn": "Sign in",
  "auth.signUp": "Create account",
  "auth.google": "Continue with Google",
  "auth.toggleToSignUp": "No account yet? Create one",
  "auth.toggleToSignIn": "Already have an account? Sign in",
  "auth.checkEmail": "Check your inbox to confirm your email address.",

  "csat.q": "Does this analysis match your real situation?",
  "csat.sub": "One tap. It helps us validate the model — no personal data is stored.",
  "csat.yes": "Yes, it matches",
  "csat.partly": "Partly",
  "csat.no": "Not really",
  "csat.thanks": "Thank you — your signal was recorded.",

  "pay.emailTitle": "Early access pricing",
  "pay.emailSub":
    "The first 100 members get SettleSmart Navigator at a special early-access rate.",
  "pay.emailLabel": "Your email",
  "pay.emailCta": "Get my code and continue",
  "pay.counter": "members registered so far",
  "pay.counterSpots": "early-access places left",
  "pay.counterFull":
    "All 100 early-access places are taken — standard pricing applies from here.",
  "pay.emailInvalid": "Please enter a valid email address.",
  "pay.emailThanks": "Your early-access code is reserved. Continuing to checkout…",
  "pay.emailSkip": "Continue at standard pricing",

  "set.account": "Account",
  "set.email": "Signed in as",
  "set.notSignedIn": "You are not signed in. Sign in to save roadmap progress across devices.",
  "set.legal": "Legal",
  "set.privacy": "Privacy Policy",
  "set.terms": "Terms of Service",
  "set.gdpr": "Built with GDPR principles",
  "set.placeholderNote": "Placeholder document for this prototype — not legal advice.",

  "road.done": "Done",
  "road.progress": "steps completed",
  "road.signInToSave": "Sign in to save your roadmap progress across all your devices.",

  "nps.title": "How likely are you to recommend MigraGo to another newcomer?",
  "nps.sub": "0 = not at all likely · 10 = extremely likely",
  "nps.comment": "What would make it more useful? (optional)",
  "nps.submit": "Send feedback",
  "nps.thanks": "Thank you — your feedback was recorded.",

  "metrics.prototype": "Prototype mode",
  "metrics.prototypeBody":
    "Figures combine simulated demonstration data with real pilot signups collected since August 2026.",
  "metrics.csat": "AI Accuracy Signal (CSAT)",
  "metrics.csatMatch": "positive",
  "metrics.nps": "Recommendation score (NPS)",
  "metrics.npsAvg": "average score",
  "metrics.emailLeads": "Email captures (early-access signups)",
  "metrics.responses": "email captures",
  "metrics.live": "Live prototype data",

  "privacy.title": "Privacy Policy",
  "privacy.body":
    "This is a placeholder privacy notice for the MigraGo prototype. Assessment answers are stored in your browser only. Email addresses submitted for early-access pricing are stored securely and used solely to contact you about early access. Feedback responses are stored without any identifying information. You can delete your local data at any time from Settings.",
  "terms.title": "Terms of Service",
  "terms.body":
    "This is a placeholder terms document for the MigraGo prototype. MigraGo provides informational guidance only. It does not replace legal advice or official authorities, and it does not guarantee residence permits or integration outcomes. Always verify requirements with the responsible Finnish institution.",

  // ── Corrective build v2 ───────────────────────────────────
  "hero.country": "Finland",
  "hero.finlandPartner": "Built in partnership with Finland's integration ecosystem",
  "hero.previewTitle": "Sample Smart Integration Profile",
  "hero.previewNote": "Illustrative sample — your own scores are calculated from your answers.",

  "about.processTitle": "Social integration is a process...",
  "about.processBody":
    "It begins the moment someone decides to migrate, continues throughout the relocation itself, and carries on after arrival — through adaptation and integration into the new country's social, legal and economic structures. MigraGo measures this full process — before migration, during migration and after arrival — and provides a personalized roadmap.",

  "country.eu": "Europe / Schengen",
  "country.global": "Global expansion — coming soon",
  "country.active": "Live now",

  "q.feedsInto": "Answers in this section contribute to your",
  "q.scoreWord": "score",
  "q.bonusNote2": "Optional questions — reported separately from the three core dimensions.",
  "q.sectionsDone": "sections completed",
  "q.encourage1": "Great start — the first sections are the quickest.",
  "q.encourage2": "You're almost halfway there.",
  "q.encourage3": "Final stretch — your profile is nearly ready.",

  "nav.faq": "FAQ",
  "nav.contact": "Contact us",
  "set.support": "Support",

  "faq.title": "Frequently asked questions",
  "faq.sub": "The short answers to what newcomers ask us most.",
  "faq.q1": "Do I need an account to use MigraGo?",
  "faq.a1":
    "No. You can complete the assessment and see your free overview without an account. Creating an account only saves your roadmap progress so it follows you across devices.",
  "faq.q2": "What is included in the free tier?",
  "faq.a2":
    "The full 42-question assessment, a brief AI analysis and a general overview of your current status and direction. It does not include the full Smart Integration Profile or the 12-week roadmap.",
  "faq.q3": "What do I get with SettleSmart Navigator (€9.90/month)?",
  "faq.a3":
    "All three dimension scores in full, the complete 12-week roadmap with institution-linked steps, live editing and recalculation, and progress tracking.",
  "faq.q4": "How is my roadmap generated?",
  "faq.a4":
    "Your answers produce three dimension scores and a set of gap flags. Each gap is matched against a curated knowledge table of Finnish procedures and mapped to the institution that actually handles it, then sequenced across four phases over 12 weeks.",
  "faq.q5": "Is this legal advice?",
  "faq.a5":
    "No. MigraGo does not replace legal advice or official authorities and does not guarantee residence permits or integration outcomes. Always verify requirements with the responsible institution.",
  "faq.q6": "Where is my data stored, and how do I delete it?",
  "faq.a6":
    "Assessment answers are stored in your browser. Roadmap progress, feedback responses and early-access emails are stored in our secure backend. You can erase your local data at any time from Settings → Delete all my data.",
  "faq.q7": "How accurate are the scores?",
  "faq.a7":
    "The model is transparent and rule-based, not a black box: each question maps to a known weight. It is a readiness indicator, not a prediction of any authority's decision.",
  "faq.q8": "Which countries are supported?",
  "faq.a8":
    "Finland is live today. Germany, Sweden and the Netherlands are planned next, with Canada as the first market outside Europe.",
  "faq.q9": "Can I change my answers later?",
  "faq.a9":
    "Yes. Edit any answer from your profile and your scores and roadmap recalculate immediately, with your score history preserved.",
  "faq.q10": "How do I get support?",
  "faq.a10":
    "Use the Contact page: email us at migrago.co@gmail.com or start a WhatsApp chat with the team. Both channels are staffed during this MVP stage; an in-app assistant is a planned future capability, not a live feature.",
  "faq.q11": "What does the €249 Stabilization Package include?",
  "faq.a11":
    "In addition to SettleSmart Navigator's capabilities, this package guides you toward the relevant government authorities and institutions, as well as a network of verified individuals and organizations — including certified translators and translation offices, lawyers and advisors (financial, tax, career, legal, family), daycare centres, schools, universities, vocational and technical education institutions, and cultural and arts centres. It also includes monitoring and evaluation of your progress, and ongoing support-team guidance during roadmap execution. Future vision (beyond current MVP scope): in later development stages — following the necessary coordination, contractual agreements, and relevant licenses/permits with the institutions involved — this package could connect you directly to each institution's service desk at every roadmap phase, including scheduling and assigning a responsible caseworker, and, with your explicit consent, make your information visible on that institution's staff dashboard. This corresponds to the planned Connect+ (B2B) and institutional dashboard (B2G) capabilities, to be developed only after the core product has been validated. This package is not active in the current version.",

  "contact.title": "Contact us",
  "contact.sub": "Email and WhatsApp are our support channels during this MVP stage. We reply within a few working days.",
  "contact.emailCta": "Email the MigraGo team",
  "contact.subject": "Subject",
  "contact.message": "Message",
  "contact.send": "Open in my email app",
  "contact.futureTitle": "Planned — not active yet",
  "contact.futureBody":
    "An in-app AI support assistant is on the roadmap as a future capability. It is not available in this version.",

  "checkout.title": "Secure checkout",
  "checkout.sub": "SettleSmart Navigator — full Smart Integration Profile and 12-week roadmap.",
  "checkout.plan": "SettleSmart Navigator (monthly)",
  "checkout.discountLabel": "Early-access discount",
  "checkout.total": "Total due today",
  "checkout.pay": "Pay and unlock my roadmap",
  "checkout.cancel": "Back to my profile",
  "checkout.testMode":
    "Test mode — this prototype runs a simulated payment step. No card is charged.",
  "checkout.processing": "Processing payment…",
  "checkout.done": "Payment confirmed. Unlocking your roadmap…",
  "checkout.codeApplied": "Early-access code applied",

  "pay.emailNote":
    "This step reserves your discount only. The roadmap unlocks after checkout.",
  "pay.standard": "Standard pricing",

  "road.completion": "tasks completed",
  "road.tasksOf": "of",

  "metrics.emailVsPay":
    "Email captures are a lead-generation signal. Checkouts are the willingness-to-pay signal. They are counted separately.",
  "metrics.checkoutSection": "€9.90 checkouts (Stripe test mode)",

  // ── Corrective build: final round ─────────────────────────
  "support.email": "Email",
  "support.whatsapp": "WhatsApp",
  "support.whatsappCta": "Chat with us on WhatsApp",
  "support.channels": "Support channels",

  "dash.balance": "Balance across dimensions",
  "dash.balanceNote": "How evenly your three dimensions sit relative to each other.",
  "dash.compositionNote": "Each dimension's proportional contribution to your overall score.",
  "dash.historyNote":
    "Every time you edit an answer your score is recalculated and a new snapshot is added here.",
  "dash.trend": "Score history",
  "dash.trendNote": "A new snapshot is added every time you edit an answer and your score recalculates.",

  "metrics.demoTitle": "Temporary demonstration access",
  "metrics.demoBody":
    "Create a separate, read-only demo login to share with an external evaluator. The founder password stays private and the gate is never disabled.",
  "metrics.demoLabel": "Label (who it is for)",
  "metrics.demoEmail": "Demo account email",
  "metrics.demoCreate": "Create demo access",
  "metrics.demoRevoke": "Revoke access",
  "metrics.demoRestore": "Re-enable",
  "metrics.demoDelete": "Delete",
  "metrics.demoNone": "No demo accounts yet.",
  "metrics.demoActive": "Active",
  "metrics.demoRevoked": "Revoked",
  "metrics.demoCode": "Access code",
  "metrics.demoRole": "You are signed in with temporary demo access (read-only).",
  "metrics.gateEmail": "Email (demo accounts only)",
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
  "hero.badge": "مسیر ادغام مبتنی بر شواهد",
  "hero.badgeLine1": "مسیر ادغام مبتنی بر شواهد",
  "hero.badgeLine2": "با تکیه بر دانش و زیست بوم ادغام اجتماعی فنلاند ",
  "hero.time": "۹ تا ۱۲ دقیقه — ۴۲ پرسش — ذخیره و ادامه در هر زمان",

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
  "how.s2.d":
    "وضعیت حقوقی، ظرفیت اقتصادی و حرفه‌ای، و مهارت‌های نرم و آمادگی روانی؛ هر کدام با نمرهٔ ۰ تا ۱۰۰.",
  "how.s3.t": "نقشه‌راه ۱۲ هفته‌ای",
  "how.s3.d":
    "هر گام نقشهٔ راه به نهاد رسمی مربوط در فنلاند (مانند Migri یا DVV) متصل است.",

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
    "افزون بر قابلیت‌های SettleSmart Navigator، این بسته کاربر را به نهادها و مراجع دولتی مرتبط و نیز به شبکه‌ای از افراد و سازمان‌های راستی‌آزمایی‌شده راهنمایی می‌کند؛ از جمله مترجمان رسمی و دفاتر ترجمه، وکلا و مشاوران (مالی، مالیاتی، شغلی، حقوقی و خانواده)، مهدکودک‌ها، مدارس، دانشگاه‌ها، مراکز آموزش فنی‌وحرفه‌ای و مراکز فرهنگی و هنری. همچنین شامل پایش و ارزیابی پیشرفت کاربر و راهنمایی مستمر تیم پشتیبانی برای پاسخ به پرسش‌ها در حین اجرای نقشهٔ راه است.",
  "pricing.stabFutureLabel": "چشم‌انداز آینده (فراتر از دامنهٔ نسخهٔ کنونی)",
  "pricing.stabFuture":
    "در مراحل بعدی توسعه، این بسته می‌تواند کاربر را در هر مرحله از نقشهٔ راه مستقیماً به میز خدمت مربوط در هر نهاد وصل کند — از جمله زمان‌بندی و تخصیص کارشناس مسئول (بعد از هماهنگی های لازم، عقد قرارداد و اخذ مجوز از نهادهای مذکور) — و با رضایت صریح کاربر، اطلاعات او را در داشبورد کارکنان آن نهاد قابل مشاهده کند. این موضوع با قابلیت‌ های برنامه‌ریزی‌ شدهٔ Connect+ (B2B) و داشبورد نهادی (B2G) هم‌ راستا است و تنها پس از اعتبارسنجی محصول اصلی توسعه خواهد یافت.",
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
  "q.live.title": "پیشرفت زنده",
  "q.live.overall": "پیشرفت کلی",
  "q.live.inProgress": "در حال انجام",
  "q.live.note": "این نمودارها فقط میزان تکمیل پرسش‌ها را نشان می‌دهند، نه نمرهٔ شما. نمرهٔ کامل پس از پایان ارزیابی در داشبورد آزاد می‌شود.",
  "dash.snapshot": "ثبت",
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
  "dash.dim2": "ظرفیت اقتصادی و حرفه‌ای",
  "dash.dim3": "مهارت‌های نرم و آمادگی روانی",
  "dash.weight": "وزن",
  "dash.bonus": "شاخص مسیر مکمل",
  "dash.bonusNote":
    "توان استعداد و کارآفرینی — جداگانه گزارش می‌شود و هرگز بخشی از نمرهٔ پایهٔ ۱۰۰ نیست.",
  "dash.composition": "ترکیب ابعاد",
  "dash.byDimension": "توازن ابعاد",
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
  "road.sub":
    "هر گام نقشهٔ راه به نهاد رسمی مربوط در فنلاند (مانند Migri یا DVV) متصل است.",
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

  "nav.signIn": "ورود",
  "nav.logout": "خروج",

  "auth.subtitle":
    "برای ذخیرهٔ پیشرفت نقشهٔ راه خود روی همهٔ دستگاه‌ها وارد شوید. پاسخ‌های پرسش‌نامه روی همین دستگاه باقی می‌ماند.",
  "auth.email": "رایانامه",
  "auth.password": "گذرواژه (حداقل ۸ نویسه)",
  "auth.signIn": "ورود",
  "auth.signUp": "ساخت حساب",
  "auth.google": "ادامه با گوگل",
  "auth.toggleToSignUp": "هنوز حساب ندارید؟ یک حساب بسازید",
  "auth.toggleToSignIn": "حساب دارید؟ وارد شوید",
  "auth.checkEmail": "برای تأیید نشانی رایانامه، صندوق ورودی خود را بررسی کنید.",

  "csat.q": "آیا این تحلیل با وضعیت واقعی شما همخوانی دارد؟",
  "csat.sub": "فقط یک کلیک. این پاسخ به اعتبارسنجی مدل کمک می‌کند و هیچ داده‌ای شخصی ذخیره نمی‌شود.",
  "csat.yes": "بله، همخوانی دارد",
  "csat.partly": "تا حدی",
  "csat.no": "چندان نه",
  "csat.thanks": "سپاسگزاریم — پاسخ شما ثبت شد.",

  "pay.emailTitle": "قیمت دسترسی زودهنگام",
  "pay.emailSub":
    "صد عضو نخست، SettleSmart Navigator را با نرخ ویژهٔ دسترسی زودهنگام دریافت می‌کنند.",
  "pay.emailLabel": "رایانامهٔ شما",
  "pay.emailCta": "دریافت کد و ادامه",
  "pay.counter": "عضو تاکنون ثبت‌نام کرده‌اند",
  "pay.counterSpots": "جایگاه دسترسی زودهنگام باقی مانده است",
  "pay.counterFull":
    "هر ۱۰۰ جایگاه دسترسی زودهنگام تکمیل شده است — از این پس قیمت استاندارد اعمال می‌شود.",
  "pay.emailInvalid": "لطفاً یک نشانی رایانامهٔ معتبر وارد کنید.",
  "pay.emailThanks": "کد دسترسی زودهنگام شما رزرو شد. در حال رفتن به مرحلهٔ پرداخت…",
  "pay.emailSkip": "ادامه با قیمت استاندارد",

  "set.account": "حساب کاربری",
  "set.email": "واردشده با",
  "set.notSignedIn": "وارد نشده‌اید. برای ذخیرهٔ پیشرفت نقشهٔ راه روی همهٔ دستگاه‌ها وارد شوید.",
  "set.legal": "اسناد حقوقی",
  "set.privacy": "سیاست حریم خصوصی",
  "set.terms": "شرایط استفاده از خدمات",
  "set.gdpr": "ساخته‌شده بر پایهٔ اصول GDPR",
  "set.placeholderNote": "سند نمونه برای این نمونهٔ اولیه — مشاورهٔ حقوقی نیست.",

  "road.done": "انجام شد",
  "road.progress": "گام انجام‌شده",
  "road.signInToSave": "برای ذخیرهٔ پیشرفت نقشهٔ راه روی همهٔ دستگاه‌هایتان وارد شوید.",

  "nps.title": "چقدر احتمال دارد MigraGo را به مهاجر دیگری معرفی کنید؟",
  "nps.sub": "۰ = اصلاً · ۱۰ = بسیار زیاد",
  "nps.comment": "چه چیزی می‌توانست مفیدتر باشد؟ (اختیاری)",
  "nps.submit": "ارسال بازخورد",
  "nps.thanks": "سپاسگزاریم — بازخورد شما ثبت شد.",

  "metrics.prototype": "حالت نمونهٔ اولیه",
  "metrics.prototypeBody":
    "این ارقام ترکیبی از داده‌های نمایشی شبیه‌سازی‌شده و ثبت‌نام‌های واقعی آزمایشی گردآوری‌شده از اوت ۲۰۲۶ است.",
  "metrics.csat": "سیگنال دقت تحلیل هوش مصنوعی (CSAT)",
  "metrics.csatMatch": "پاسخ مثبت",
  "metrics.nps": "امتیاز توصیه (NPS)",
  "metrics.npsAvg": "میانگین امتیاز",
  "metrics.emailLeads": "ثبت رایانامه (دسترسی زودهنگام)",
  "metrics.responses": "ثبت رایانامه",
  "metrics.live": "دادهٔ زندهٔ نمونهٔ اولیه",

  "privacy.title": "سیاست حریم خصوصی",
  "privacy.body":
    "این متن، نسخهٔ نمونه برای پیش‌نمونهٔ MigraGo است. پاسخ‌های ارزیابی تنها در مرورگر شما ذخیره می‌شوند. نشانی رایانامه‌ای که برای قیمت دسترسی زودهنگام ثبت می‌کنید به‌صورت ایمن نگهداری و تنها برای اطلاع‌رسانی دسترسی زودهنگام استفاده می‌شود. پاسخ‌های بازخورد بدون هیچ اطلاعات شناسایی ذخیره می‌شوند. هر زمان بخواهید می‌توانید داده‌های محلی خود را از بخش تنظیمات حذف کنید.",
  "terms.title": "شرایط استفاده از خدمات",
  "terms.body":
    "این متن، نسخهٔ نمونه برای پیش‌نمونهٔ MigraGo است. MigraGo تنها راهنمایی اطلاع‌رسانی ارائه می‌دهد؛ جایگزین مشاورهٔ حقوقی یا مراجع رسمی نیست و هیچ تضمینی برای صدور اجازهٔ اقامت یا نتیجهٔ ادغام نمی‌دهد. همیشه الزامات را با نهاد مسئول فنلاندی راستی‌آزمایی کنید.",

  // ── ویرایش اصلاحی نسخهٔ ۲ ─────────────────────────────────
  "hero.country": "فنلاند",
  "hero.finlandPartner": "با همراهی زیست‌بوم ادغام اجتماعی فنلاند ساخته شده است",
  "hero.previewTitle": "نمونهٔ پروفایل هوشمند ادغام",
  "hero.previewNote": "این نمونه صرفاً نمایشی است؛ نمرهٔ شما از پاسخ‌های خودتان محاسبه می‌شود.",

  "about.processTitle": "ادغام اجتماعی یک فرایند است...",
  "about.processBody":
    "این فرایند از لحظه‌ای آغاز می‌شود که فرد تصمیم به مهاجرت می‌گیرد، در طول جابه‌جایی ادامه می‌یابد و پس از ورود نیز با سازگاری و ادغام در ساختارهای اجتماعی، حقوقی و اقتصادی کشور مقصد پی گرفته می‌شود. میگراگو همین فرایند کامل را — پیش از مهاجرت، در حین مهاجرت و پس از ورود — می‌سنجد و نقشه راه شخصی سازی شده میدهد.",

  "country.eu": "اروپا / شنگن",
  "country.global": "گسترش جهانی — به‌زودی",
  "country.active": "فعال",

  "q.feedsInto": "پاسخ‌های این بخش در نمرهٔ زیر لحاظ می‌شود:",
  "q.scoreWord": "",
  "q.bonusNote2": "پرسش‌های اختیاری — جدا از سه بُعد اصلی گزارش می‌شود.",
  "q.sectionsDone": "بخش تکمیل شد",
  "q.encourage1": "شروع خوبی بود — بخش‌های نخست سریع‌تر پیش می‌روند.",
  "q.encourage2": "تقریباً به نیمهٔ راه رسیده‌اید.",
  "q.encourage3": "مرحلهٔ پایانی — پروفایل شما تقریباً آماده است.",

  "nav.faq": "پرسش‌های پرتکرار",
  "nav.contact": "تماس با ما",
  "set.support": "پشتیبانی",

  "faq.title": "پرسش‌های پرتکرار",
  "faq.sub": "پاسخ کوتاه به پرسش‌هایی که تازه‌واردان بیش از همه می‌پرسند.",
  "faq.q1": "برای استفاده از میگراگو باید حساب کاربری بسازم؟",
  "faq.a1":
    "خیر. ارزیابی و نمای کلی رایگان بدون حساب کاربری در دسترس است. ساخت حساب تنها پیشرفت نقشهٔ راه شما را ذخیره می‌کند تا روی همهٔ دستگاه‌ها همراه‌تان باشد.",
  "faq.q2": "نسخهٔ رایگان شامل چه چیزهایی است؟",
  "faq.a2":
    "کل ارزیابی ۴۲ پرسشی، تحلیل کوتاه هوش مصنوعی و نمای کلی از وضعیت و جهت‌گیری فعلی شما. پروفایل کامل هوشمند ادغام و نقشه‌راه ۱۲ هفته‌ای در آن نیست.",
  "faq.q3": "اشتراک SettleSmart Navigator (ماهانه ۹٫۹۰ یورو) چه چیزی ارائه می‌دهد؟",
  "faq.a3":
    "نمرهٔ کامل هر سه بُعد، نقشه‌راه کامل ۱۲ هفته‌ای با گام‌های متصل به نهادهای رسمی، ویرایش زنده و محاسبهٔ مجدد، و پیگیری پیشرفت.",
  "faq.q4": "نقشهٔ راه چگونه ساخته می‌شود؟",
  "faq.a4":
    "پاسخ‌های شما سه نمرهٔ بُعدی و مجموعه‌ای از شکاف‌ها را می‌سازد. هر شکاف با جدول دانش رویه‌های رسمی فنلاند تطبیق داده می‌شود، به نهاد متولی نسبت می‌یابد و سپس در چهار فاز طی ۱۲ هفته چیده می‌شود.",
  "faq.q5": "آیا این مشاورهٔ حقوقی است؟",
  "faq.a5":
    "خیر. میگراگو جایگزین مشاورهٔ حقوقی یا مراجع رسمی نیست و تضمینی برای اقامت یا نتیجهٔ ادغام نمی‌دهد. همیشه الزامات را با نهاد مسئول راستی‌آزمایی کنید.",
  "faq.q6": "داده‌های من کجا ذخیره می‌شود و چگونه حذف می‌شود؟",
  "faq.a6":
    "پاسخ‌های ارزیابی در مرورگر شما ذخیره می‌شود. پیشرفت نقشهٔ راه، بازخوردها و رایانامه‌های دسترسی زودهنگام در بک‌اند امن ما نگهداری می‌شود. هر زمان می‌توانید از بخش تنظیمات، «حذف همهٔ داده‌های من» را اجرا کنید.",
  "faq.q7": "نمره‌ها چقدر دقیق‌اند؟",
  "faq.a7":
    "مدل شفاف و قاعده‌محور است، نه جعبه‌سیاه: هر پرسش وزن مشخصی دارد. این نمره یک شاخص آمادگی است، نه پیش‌بینی تصمیم هیچ مرجع رسمی.",
  "faq.q8": "چه کشورهایی پشتیبانی می‌شوند؟",
  "faq.a8":
    "امروز فنلاند فعال است. آلمان، سوئد و هلند در برنامهٔ بعدی هستند و کانادا نخستین بازار خارج از اروپا خواهد بود.",
  "faq.q9": "می‌توانم بعداً پاسخ‌هایم را تغییر دهم؟",
  "faq.a9":
    "بله. هر پاسخ را از پروفایل خود ویرایش کنید؛ نمره‌ها و نقشهٔ راه بی‌درنگ بازمحاسبه می‌شوند و تاریخچهٔ نمرهٔ شما حفظ می‌ماند.",
  "faq.q10": "چگونه پشتیبانی بگیرم؟",
  "faq.a10":
    "از صفحهٔ تماس با ما استفاده کنید: رایانامه به نشانی migrago.co@gmail.com یا گفت‌وگوی مستقیم در واتس‌اپ. هر دو کانال در این مرحلهٔ MVP فعال‌اند؛ دستیار درون‌برنامه‌ای یک قابلیت آینده است و اکنون فعال نیست.",
  "faq.q11": "بستهٔ تثبیت ۲۴۹ یورویی شامل چه چیزهایی است؟",
  "faq.a11":
    "افزون بر قابلیت‌های SettleSmart Navigator، این بسته کاربر را به نهادها و مراجع دولتی مرتبط و نیز به شبکه‌ای از افراد و سازمان‌های راستی‌آزمایی‌شده راهنمایی می‌کند؛ از جمله مترجمان رسمی و دفاتر ترجمه، وکلا و مشاوران (مالی، مالیاتی، شغلی، حقوقی و خانواده)، مهدکودک‌ها، مدارس، دانشگاه‌ها، مراکز آموزش فنی‌وحرفه‌ای و مراکز فرهنگی و هنری. همچنین شامل پایش و ارزیابی پیشرفت کاربر و راهنمایی مستمر تیم پشتیبانی در حین اجرای نقشهٔ راه است. چشم‌انداز آینده (فراتر از دامنهٔ نسخهٔ کنونی): در مراحل بعدی، این بسته می‌تواند کاربر را در هر مرحله از نقشهٔ راه مستقیماً به میز خدمت هر نهاد وصل کند — از جمله زمان‌بندی و تخصیص کارشناس مسئول (بعد از هماهنگی های لازم، عقد قرارداد و اخذ مجوزهای مرتبط از نهادهای مذکور)— و با رضایت صریح کاربر، اطلاعات او را در داشبورد کارکنان آن نهاد نمایان کند (قابلیت‌های برنامه‌ریزی‌شدهٔ Connect+ در حوزهٔ B2B و داشبورد نهادی در حوزهٔ B2G). این بسته در نسخهٔ کنونی فعال نیست.",


  "contact.title": "تماس با ما",
  "contact.sub": "در این مرحلهٔ MVP، رایانامه و واتس‌اپ کانال‌های پشتیبانی ما هستند. معمولاً ظرف چند روز کاری پاسخ می‌دهیم.",
  "contact.emailCta": "ارسال رایانامه به تیم میگراگو",
  "contact.subject": "موضوع",
  "contact.message": "پیام",
  "contact.send": "باز کردن در برنامهٔ رایانامه",
  "contact.futureTitle": "برنامهٔ آینده — هنوز فعال نیست",
  "contact.futureBody":
    "دستیار پشتیبانی هوش مصنوعی درون‌برنامه‌ای در نقشهٔ راه محصول قرار دارد و در این نسخه در دسترس نیست.",

  "checkout.title": "پرداخت امن",
  "checkout.sub": "SettleSmart Navigator — پروفایل کامل هوشمند ادغام و نقشه‌راه ۱۲ هفته‌ای.",
  "checkout.plan": "SettleSmart Navigator (ماهانه)",
  "checkout.discountLabel": "تخفیف دسترسی زودهنگام",
  "checkout.total": "مبلغ قابل پرداخت",
  "checkout.pay": "پرداخت و باز کردن نقشهٔ راه",
  "checkout.cancel": "بازگشت به پروفایل",
  "checkout.testMode":
    "حالت آزمایشی — این نمونهٔ اولیه یک مرحلهٔ پرداخت شبیه‌سازی‌شده اجرا می‌کند و هیچ مبلغی از کارت برداشت نمی‌شود.",
  "checkout.processing": "در حال پردازش پرداخت…",
  "checkout.done": "پرداخت تأیید شد. در حال باز کردن نقشهٔ راه…",
  "checkout.codeApplied": "کد دسترسی زودهنگام اعمال شد",

  "pay.emailNote":
    "این مرحله فقط تخفیف شما را رزرو می‌کند. نقشهٔ راه پس از پرداخت باز می‌شود.",
  "pay.standard": "قیمت استاندارد",

  "road.completion": "گام انجام‌شده",
  "road.tasksOf": "از",

  "metrics.emailVsPay":
    "ثبت رایانامه سیگنال جذب سرنخ است و پرداخت‌ها سیگنال تمایل واقعی به پرداخت. این دو جداگانه شمارش می‌شوند.",
  "metrics.checkoutSection": "پرداخت‌های ۹٫۹۰ یورویی (حالت آزمایشی Stripe)",

  // ── ویرایش اصلاحی: دور پایانی ─────────────────────────────
  "support.email": "رایانامه",
  "support.whatsapp": "واتس‌اپ",
  "support.whatsappCta": "گفت‌وگو در واتس‌اپ",
  "support.channels": "راه‌های پشتیبانی",

  "dash.balance": "توازن میان ابعاد",
  "dash.balanceNote": "نشان می‌دهد سه بُعد شما نسبت به یکدیگر چقدر متوازن‌اند.",
  "dash.compositionNote": "سهم نسبی هر بُعد در نمرهٔ کلی شما.",
  "dash.historyNote":
    "هر بار که پاسخی را ویرایش می‌کنید، نمرهٔ شما بازمحاسبه و یک نقطهٔ تازه به این نمودار افزوده می‌شود.",
  "dash.trend": "تاریخچهٔ نمره",
  "dash.trendNote": "هر بار که پاسخی را ویرایش کنید و نمره دوباره محاسبه شود، یک نقطهٔ جدید افزوده می‌شود.",

  "metrics.demoTitle": "دسترسی موقت برای ارائه",
  "metrics.demoBody":
    "یک حساب نمایشی جداگانه و فقط‌خواندنی بسازید تا با ارزیاب بیرونی به اشتراک بگذارید. گذرواژهٔ اصلی بنیان‌گذار محرمانه می‌ماند و قفل صفحه هرگز غیرفعال نمی‌شود.",
  "metrics.demoLabel": "برچسب (برای چه کسی)",
  "metrics.demoEmail": "رایانامهٔ حساب نمایشی",
  "metrics.demoCreate": "ایجاد دسترسی نمایشی",
  "metrics.demoRevoke": "لغو دسترسی",
  "metrics.demoRestore": "فعال‌سازی دوباره",
  "metrics.demoDelete": "حذف",
  "metrics.demoNone": "هنوز حساب نمایشی ساخته نشده است.",
  "metrics.demoActive": "فعال",
  "metrics.demoRevoked": "لغو شده",
  "metrics.demoCode": "کد دسترسی",
  "metrics.demoRole": "شما با دسترسی موقت نمایشی (فقط‌خواندنی) وارد شده‌اید.",
  "metrics.gateEmail": "رایانامه (فقط برای حساب‌های نمایشی)",
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
