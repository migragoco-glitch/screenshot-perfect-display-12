# Preliminary assessment + free/paid clarity (Business Finland evaluator feedback)

Minimal, scoped changes. No redesign, no new backend, no publishing.

## What exists today (verified)

- Flow: homepage → /consent (checkbox + region) → /assessment → /dashboard. Auth is optional; assessment requires only `state.consent`.
- Answers live in localStorage `migrago.state.v1` under `answers` keyed by question ID; `sanitizeAnswers` prunes invalid/inapplicable entries on every write.
- `computeProfile` excludes unanswered questions inside a dimension but has opinionated missing-data defaults (e.g. missing Q34 → `documents_not_ready`, missing Q36 → `pathway_unconfirmed`) — so it must NOT be called on partial answers.
- Checkout is a 1.2s timer simulation, already labelled "Test mode / Demo checkout"; price €9.99/month is consistent (EARLY100 = 50% → displayed €5).
- No preliminary/quick-check route exists.

## Changes

### 1. New preliminary assessment (new files only, plus one navigation change)

- **New route `src/routes/quick-check.tsx`** (`/quick-check`): a single-screen short assessment reusing existing question definitions and the existing `QuestionField` component, with existing question IDs only:
  - Q36 pathway, Q8 who relocates, Q7 children (its conditional sub-questions work as-is), Q34 document readiness, Q15 English + Finnish/Swedish, Q22 financial runway.
  - Answers are written through the existing `setAnswer` into `migrago.state.v1` under their real IDs, so the full assessment later pre-fills them. No renumbering, no new answer format. `completed` is NOT set.
- **New `src/lib/preliminary.ts`** — isolated preliminary-result logic (does NOT call `computeProfile`):
  - A clearly labelled "Preliminary profile" (qualitative bands derived only from answered questions, e.g. documents/language/finances each: ready / partial / unknown).
  - 3–5 initial action recommendations mapped from the answered pathway/documents/language/finances, reusing existing roadmap knowledge-table entries where they match, labelled indicative.
  - An explicit "Not yet assessed" list naming the dimensions the full assessment covers.
  - A disclaimer: indicative, not a legal determination or eligibility guarantee.
- **Result view** (same route, after the ~6 questions): preliminary profile + initial actions + unknowns + two buttons: "Continue to full assessment" → `/assessment`, and "Explore my dashboard later" (secondary). Optional sign-in link ("Sign in to keep your progress on this device account") → `/auth`; auth stays optional, no verification-flow changes.

### 2. Navigation change (one line)

- `src/routes/consent.tsx`: normal Continue navigates to `/quick-check` instead of `/assessment`. Consent checkbox, region selector, and the `?upgrade=true` → `/checkout` path are unchanged. `/assessment` itself is untouched and still reachable.

### 3. Free vs paid clarity (copy only)

- Homepage pricing section (`src/routes/index.tsx`) and dashboard paywall card (`src/routes/dashboard.tsx`): add/adjust bilingual copy listing what Free includes (registration, quick check, preliminary profile + initial actions) vs Navigator €9.99/month (full 42-question profile, detailed personalized roadmap, action & progress tracking, curated resources and links). Price stays €9.99/month everywhere; no entitlement, checkout, or access-control changes.
- `src/lib/i18n.tsx`: new EN + FA keys for all of the above (quick-check UI, preliminary labels/disclaimer, free-vs-paid lists).

### 4. Payment-claim accuracy (one string)

- Founder-metrics copy currently says "Stripe test mode" though checkout is a local simulation — reword to "Simulated test checkout — no real payment" (EN+FA). The existing "Test mode"/"Demo checkout" labels on checkout and dashboard already comply and stay as-is.

## Explicitly NOT changed

- All 42 questions, IDs, order, weights, `computeProfile`, `sanitizeAnswers`, `storedAnswersAreConsistent`, roadmap generation, task IDs, completion tracking.
- Consent legal text/gate, auth/verification, checkout logic, pricing (€9.99), localStorage key, existing saved data.
- No new database tables, no sync claims, no AI claims, no publishing.

## Rollback

Git already tracks the project; all changes are additive (2 new files) plus small edits to 4 existing files (consent.tsx, index.tsx, dashboard.tsx, i18n.tsx, founder-metrics.tsx). Rollback = revert those edits; new files are inert without the consent navigation change.

## Verification (before reporting done)

1. Consent still required; Continue → quick check.
2. Quick check completes with ~6 answers; result shows preliminary profile, indicative actions, unknowns, disclaimer; no full score/flags computed.
3. "Continue to full assessment" → /assessment with quick-check answers pre-filled; full flow, scoring, roadmap unchanged.
4. Existing saved `migrago.state.v1` (completed profile) still loads; dashboard/roadmap/progress intact.
5. Sign-up/sign-in/Google still work; €9.99/month consistent; simulated checkout still labelled as such.
6. EN + FA parity, mobile + desktop, clean build.
