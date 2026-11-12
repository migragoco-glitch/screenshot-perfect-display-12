# Homepage removals and illustrated How it works

## Files and exact scope
Only two application files will change after APPROVED, with translations edited first. No implementation changes now.

### 1. `src/lib/i18n.tsx`
- Only English and Persian exist; there are no other languages to change.
- Replace `how.s1.t`, `how.s1.d`, `how.s2.t`, `how.s2.d`, `how.s3.t`, and `how.s3.d` in English first, then Persian, with the exact supplied text.
- Store the two Step 3 paragraphs in `how.s3.d` separated by a line break; render them as two paragraphs.
- Keep EN `how.title` as “How it works”; use the requested FA «چگونه کار می‌کند؟» (the current value lacks the question mark).
- Add only these mock-panel labels, in both dictionaries:
  - `how.mock.city`: EN “City”; FA «شهر».
  - `how.mock.matters`: EN “Your matters”; FA «امور شما».
  - `how.mock.more`: EN “… and more”; FA «… و موارد دیگر».
- Preserve every `hero.discover*` and `about.*` key, including those no longer rendered.

### 2. `src/routes/index.tsx`
- In `Landing`, remove the `<DiscoverPreviewCard />` rendering at current line 367 (the dark navy discover-items box). Remove its now-unused local component and `DISCOVER_ITEMS` constant, and only imports made unused by these removals.
- Remove the entire About section at current lines 435–456: `about.title` and the Definition, Mission, and Boundaries cards. Keep the separate “Integration is a process” section unchanged.
- Replace only the existing How it works `<ol>` and its three animated `InformationalCard` items at current lines 473–493 with three static illustrated cards. Preserve the section, its `id="how-it-works"`, and its heading.
- Desktop: three equal-width, equal-height cards in one row; small circular white arrow chips between them, reversed in RTL. Mobile: stacked cards without chips.
- Cards: large rounded corners, a soft white-to-light-teal vertical gradient, thin border, soft existing shadow, centered number badge/title/text, and a white mock panel with rounded top corners anchored to each card’s bottom. Use existing white surface, teal, border, text, and shadow tokens; add no colours or global styles. No animation or interactive controls.
- Use ordinary static markup and existing Lucide icons for mock select caret, checkboxes, and arrows. Mark each mock panel and decorative chips `aria-hidden="true"`.

## Existing keys reused by the mock panels
- Mock 1 placeholder: `start.chooseCity`.
- Mock 1 city rows: `start.city.Helsinki`, `start.city.Espoo`, `start.city.Vantaa`, `start.city.Tampere`.
- Mock 2 first four matters, verified from `AREAS` order: `start.area.status.title`, `start.area.id.title`, `start.area.bank.title`, `start.area.housing.title`. First two checked; last two unchecked; then `how.mock.more`.
- Mock 3 options: `start.choose.info.title` and `start.choose.road.title`. The roadmap tile adds only linked numbered circles “1 2 3” in existing teal, olive, and gold tokens.

## Boundaries and completion
Nothing else changes: no `/start` edits, other routes, navigation, assessment/scoring, selection logic, saved answers, storage keys, checkout, pricing, header/footer, remaining homepage sections, packages, images, libraries, animation, or refactor.

After APPROVED: one focused implementation pass and one automatic build only; no manual build, browser/preview checks, publishing, or retries. Stop and report the first error or missing required element; ask before any broader change.