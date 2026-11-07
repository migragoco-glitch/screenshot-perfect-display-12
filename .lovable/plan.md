# Build A — /start

Change only these application files, in order:

1. **`src/lib/i18n.tsx`** — Add the seven supplied keys with exact English text first, then exact Persian text. Preserve all existing translations.
2. **`src/lib/area-flow.ts`** — Replace or add only the twelve specified overlay `sourceUrl` values.
3. **`src/routes/start.tsx`** — Reuse existing styles, tokens, `cn`, and `InstitutionBadge` (`Institution` from `src/lib/roadmap.ts`). Align the six stage panels, controls, area tiles, step cards, phase headers, title pills, completion checkboxes and Details panels as specified. Keep existing detail visibility, tags, source dates and local links. Add the upgrade inclusion, Navigator-only profile cards and the exact confirmed device-data reset action.

## Boundaries

Preserve scoring, assessment access gates, answers, restore behavior, existing handlers and checkout return flow; only add the explicitly requested profile navigation and delete action. Use conditional spreads for optional properties and never assign `undefined` to them. Use existing design-system controls and semantic color tokens while matching the requested appearance.

Existing required roadmap keys, styles, components and state methods are available. Bank, landlord and Traficom are outside the existing `Institution` union; the requested cast keeps the badge's existing fallback icon and supplied display name without changing other files.

No packages, tests, browser checks, screenshots or publishing. One automatic build; stop and report the first error without retrying. Do not edit `AGENTS.md` or `roadmap.md` (skip those documentation updates as requested). No application edits before APPROVED.

Completion reply: “Build A complete” followed by the three changed files, one line each.
