# Hero text update (EN + FA)

## Files
- `src/lib/i18n.tsx` — update 3 keys, add 2 keys (EN and FA dicts).
- `src/routes/index.tsx` — add two lines under the existing `hero.sub` paragraph.

## Keys

| Key | Old (EN / FA) | New (EN / FA) |
|---|---|---|
| hero.eyebrow (EN l.194, FA l.1015) | "A practical guide to settling in after arrival" / «راهنمای عملی استقرار پس از ورود» | "A step-by-step guide to settlement and social integration" / «راهنمای قدم‌به‌قدم استقرار و ادغام اجتماعی» |
| hero.title (EN l.191, FA l.1012) | "Settle in, step by step." / «قدم‌به‌قدم، برای استقرار در کشور جدید.» | "What path lies ahead of you as you start life in a new country?" / «برای شروع زندگی در کشور جدید، چه مسیری پیش روی شماست؟» |
| hero.sub (EN l.192, FA l.1013) | "Already in Finland or just arrived? … SettleSmart Navigator adds a week-by-week plan, step details and progress tracking." / «اگر در فنلاند زندگی می‌کنید … SettleSmart Navigator برنامهٔ هفته‌به‌هفته … اضافه می‌کند.» | Supplied "Arriving in a new country…" paragraph / supplied «ورود به کشوری جدید…» paragraph (SettleSmart sentence removed) |
| hero.sub2 (NEW) | — | Supplied "MigraGo helps you…" / supplied «میگراگو به شما کمک می‌کند…» |
| hero.tagline (NEW) | — | "From official information to practical actions, with a roadmap that fits your situation." / «از اطلاعات رسمی تا اقدامات عملی؛ با نقشهٔ راهی متناسب با شرایط شما.» |

## Layout (index.tsx)
Order: eyebrow, title, hero.sub, hero.sub2, hero.tagline, existing buttons.
- hero.sub2: new `<p>` with the same classes as hero.sub (`max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg`), `mt-4`.
- hero.tagline: `<p className="mt-4 max-w-2xl text-base font-semibold text-foreground md:text-lg">` (existing tokens, no new colors).

## Report: other uses
- hero.eyebrow, hero.title, hero.sub are used only in `src/routes/index.tsx` (lines 311, 315, 318). Not used in route head/meta/og tags, footer, header or other components. Page title and og:title are hardcoded strings and are not changed.

## Unchanged
Preview card, buttons (hero.startCta, hero.howCta), header, how-it-works, pricing, footer, titles/og, faq.*, logic. All other keys kept.
