# Remove the integration-process box

## Located box

- File: `src/routes/index.tsx`, inside `Landing`, current lines **360–368**, immediately between the hero and “How it works”.
- Structure: a section wrapper containing `InformationalCard`, the `RefreshCw` circular-arrows icon, and one paragraph.
- Rendered key: `about.processBody`.
- The former `about.processTitle` heading is already absent; its key will remain untouched.

**Exact EN text** — `src/lib/i18n.tsx:560–561`:

“Social integration is not a single-step action, but a continuous journey. Your needs and priorities evolve throughout the stages of pre-migration, arrival, settlement, and adaptation to legal, economic, and social frameworks. At every step, MigraGo assesses your status and determines the precise next action in accordance with the rules and procedures of the relevant institutions.”

**Exact FA text** — `src/lib/i18n.tsx:1381–1382`:

«ادغام اجتماعی یک اقدام تک‌مرحله‌ای نیست، بلکه یک مسیر پیوسته است. نیازها و اولویت‌های شما در طول مراحل پیش از مهاجرت، ورود، استقرار و سازگاری با ساختارهای حقوقی، اقتصادی و اجتماعی تحول می‌یابند. میگراگو در هر گام، وضعیت شما را می‌سنجد و دقیق‌ترین اقدام بعدی را منطبق با ضوابط و رویه‌های نهادهای مرتبط مشخص می‌کند.»

## Changes after APPROVED

Only application file changed: **`src/routes/index.tsx`**. Line numbers refer to the current file before edits.

| Current lines | Exact change |
| --- | --- |
| 360–368 | Remove the section comment and entire section, including the panel, refresh icon and paragraph rendering `about.processBody`. |
| 3 | Remove only `RefreshCw` from the Lucide import because it has no other use in this file. |
| 119–150 | Remove the local `InformationalCard` function because this box is its only call site and removing the box leaves the function unused. No refactoring or replacement. |

The shared `useInViewOnce` and `useReducedMotion` hooks remain: the existing score and roadmap previews still use them. No other import cleanup.

## Wrappers and spacing

Remove the outer section as well as the panel, so no empty wrapper or its `pb-4` spacing remains. “How it works” follows the hero directly, retaining its own existing spacing and borders. Do not change any surrounding class, border or spacing to compensate. This conclusion is based on the code; no browser check is proposed.

## Unchanged

Both EN and FA `about.processBody` values and all other i18n keys remain intact. No changes to `src/lib/i18n.tsx`, header, logo, hero, previews, buttons, other sections, styles, packages or backend. No other application file changes.

## Execution guardrails

- Wait for your **APPROVED** in Build mode before implementation.
- One focused edit pass and one automatic build only; no manual extra build.
- Stop and report the first error without retrying or starting a corrective run.
- No browser or preview checks. No publishing.