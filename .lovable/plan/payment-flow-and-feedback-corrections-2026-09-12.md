# Payment-flow and feedback corrections

## Scope
- Keep the original pre-assessment consent screen unchanged.
- After early-access email capture or skipping it, go directly to checkout instead of reopening consent.
- Add one short bilingual payment-confirmation line on checkout.
- Make discount state deterministic: a successful early-access email submission always applies the early-access code; skipping always clears it and uses standard pricing.
- Remove signup-count fetching, slot calculations, and numeric scarcity copy from the early-access modal; replace it with the supplied non-numeric bilingual message.
- Correct any remaining post-roadmap recommendation-survey brand typo to “MigraGo” in English and Persian.

## Technical details
- Update only the dashboard upgrade continuation, early-access modal, checkout copy, and related bilingual translation entries.
- Preserve the existing test checkout behavior, prices, visual classes, assessment structure, scoring, and Step 6 → Step 7 code.
- Verify both discounted and standard-price paths, plus English/Persian text and the current build status.
