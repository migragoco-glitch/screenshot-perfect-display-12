# Homepage hero: targeted removals and title sizing

## Scope
After your explicit **APPROVED**, change only `src/routes/index.tsx`. No change is needed in `src/lib/i18n.tsx`: all EN and FA keys and values remain intact. No implementation has started.

Line numbers below refer to the current file, before edits.

## Exact changes

| File and current lines | Change |
| --- | --- |
| `src/routes/index.tsx:293–308` | Remove the complete pill above the eyebrow, including its embedded Finland SVG. Stop rendering `hero.badgeLine1` and `hero.badgeLine2`. |
| `src/routes/index.tsx:314` | Replace only `text-4xl` with `text-3xl` and `md:text-6xl` with `md:text-5xl` on the `hero.title` h1. Keep every other class and its text unchanged. |
| `src/routes/index.tsx:357–359` | Remove the h2 rendering `hero.navigatorTitle`. |
| `src/routes/index.tsx:360–363` | Remove the entire disclaimer strip rendering `hero.navigatorNotice`, including its Info icon, so no empty tinted strip remains. |
| `src/routes/index.tsx:365–367` | Remove only the paragraph rendering `hero.previewTitle`; keep its surrounding score panel. |
| `src/routes/index.tsx:251–253` | Remove only the paragraph rendering `hero.roadmapStage` inside `RoadmapPreview`; keep the bar-chart container. |
| `src/routes/index.tsx:384–386` | Remove the closing paragraph rendering `hero.navigatorClosing`. |
| `src/routes/index.tsx:397` | Remove only the h2 rendering `about.processTitle`. Keep the section, RefreshCw icon, explanatory paragraph, and their existing classes. |
| `src/routes/index.tsx:3` | Remove only the now-unused `Info` import. |

## Whole-landing-page phrase search

Found **one rendered occurrence**, in the section immediately after the hero:

- Rendering: `src/routes/index.tsx:397`, key `about.processTitle`.
- EN value: `src/lib/i18n.tsx:559` — **“Social integration is a process”**.
- FA value: `src/lib/i18n.tsx:1380` — **«ادغام اجتماعی یک فرایند است»**.

The section's explanatory body uses different wording and will remain unchanged. No additional occurrence of the requested sentence was found in the landing page or its shared header/footer file. The source comment at `index.tsx:393` is not visible text and stays unchanged.

## Preview card after the five removals

The existing outer card, decorative arrow badge and teal backing remain. Inside it:

1. The bordered score panel starts with the large donut score, followed by the three score circles and their labels.
2. The sample note `hero.previewNote` remains, including its top dividing border.
3. The navy bar-chart block follows, retaining all four bars, icons and week labels.

No empty heading or disclaimer wrappers will remain. The card becomes shorter naturally; its columns, padding, borders and layout classes stay unchanged. The score panel retains its existing `mt-5`, the large donut its `mt-4`, and the chart grid its `mt-5`, so some top spacing remains where headings were removed. From the code, no border becomes broken or orphaned; no spacing adjustment is proposed. This is a code-based assessment, not a visual check.

The post-hero process section similarly retains its icon and body with their existing spacing; only its title disappears.

## Keys whose rendering stops

- `hero.badgeLine1`
- `hero.badgeLine2`
- `hero.navigatorTitle`
- `hero.navigatorNotice`
- `hero.previewTitle`
- `hero.roadmapStage`
- `hero.navigatorClosing`
- `about.processTitle`

All these keys remain in both dictionaries. No key value changes.

## Minimal cleanup and protected elements

Only `Info` becomes unused because of these changes and will be removed from the import. The pill's inline SVG disappears with the pill; it has no separate asset or helper to clean up. `RefreshCw`, `InformationalCard`, `SampleDonut`, `MiniDonut`, `RoadmapPreview`, `SAMPLE`, `ROADMAP_PHASES` and the arrow asset remain in use. No unrelated unused-code cleanup or refactor.

Unchanged: logo, header, eyebrow, title text, `hero.sub`, `hero.sub2`, `hero.tagline`, buttons, sample values, chart labels, animations, all other sections and their text, translations, metadata, packages, backend and all other application files.

## Execution limits

- Wait for your explicit **APPROVED** in Build mode before implementing.
- One focused edit pass and one automatic build only; no manual extra build.
- No browser or preview checks and no publishing.
- Stop and report the first error; do not retry or launch a corrective run.