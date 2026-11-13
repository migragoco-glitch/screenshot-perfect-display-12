# Header SVG flags and lg breakpoint

## Files
After APPROVED, change only `src/components/BrandHeader.tsx`.
No application files are changed during planning.

## 1. Flags — chosen option (a)
Use nine local inline SVG definitions within `BrandHeader.tsx`, rendered as SVG image data URLs through `<img alt="" aria-hidden="true">`. This is the lowest-overhead option: no package, new asset files, network requests, or image-generation cost.

- Replace the emoji values used by the existing country control with the corresponding SVG image definitions for Finland, Germany, Canada, United Kingdom, Türkiye, United States, Australia, Netherlands, and Sweden.
- Render the images at all three existing flag positions: Finland trigger, active Finland list row, and locked country list rows.
- Use a stable 20 × 16 px image box with preserved proportions and no shrinking, matching the current small flags.
- Include each flag’s recognizable symbols, not just approximate colored stripes.
- Keep the existing country order and every EN/FA name exactly unchanged.
- Preserve the caret, Lock icon, active Finland behavior, `aria-disabled="true"`, `nav.comingSoonTip` tooltip, and the exact existing `trackEvent({ type: "country_click", country: c.name.en })` call. No navigation or selection changes.

## 2. Breakpoint — class names only
Change only the three classes controlling inline-header versus Menu visibility:
- Inline controls wrapper: `md:flex` → `lg:flex`.
- Menu button wrapper: `md:hidden` → `lg:hidden`.
- Menu panel: `md:hidden` → `lg:hidden`.

Inline links, country control, language switch, and account controls therefore appear from lg (1024 px) upward; below lg, they remain inside the existing Menu panel. No state, event-handler, or menu logic changes.

Leave every other `md:` class unchanged, including logo sizing, header spacing, CTA sizing, and footer layout.

## Unchanged
Logo image, size, and alt; all texts and i18n keys; CTA and its conditions/destination; sticky behavior; language switch; account logic; existing popovers and accessibility behavior; footer; homepage; every other file, package, global style, backend, assessment, and storage. No refactor.

## Execution limits
Wait for APPROVED. Then make one focused edit and use one automatic build only. No manual build, browser or preview checks, retries, or Publish. Stop and report the first error or missing required element; ask before any broader change.
