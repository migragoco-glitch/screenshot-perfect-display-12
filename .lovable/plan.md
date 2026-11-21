# Text-only update (EN + FA)

Only two files change: `src/lib/i18n.tsx` (EN and FA only — no other languages exist) and one number in `src/routes/faq.tsx`.

## Changes
- **A) `pay.demoNote`** — replace EN (line 486) and FA (line 1448) with the supplied text.
- **B) `privacy.body`** — replace only the first paragraph (text before the first `\n\n`, ending "fully launched." / "جایگزین خواهد شد."). The "Payments." / "پرداخت‌ها." paragraph and everything after stay byte-identical. No restructuring needed.
- **C) `pricing.future`, `pricing.stabFutureLabel`, `contact.sub`** — replace EN and FA values.
- **D) FAQ** — add `faq.q12`–`faq.q15` and `faq.a12`–`faq.a15` right after the existing `faq.a11` in EN and FA. In `faq.tsx` line 28, change `length: 11` to `length: 15`. Existing FAQ keys untouched.
- **E) `pay.emailNote`** (found, lines 790/1754) — append the supplied sentence in EN and FA.

## Not touched
Checkout logic, tier logic, pricing cards, database, server functions, styles, `checkout.testMode`, /founder-metrics text, AGENTS.md, roadmap.md, routeTree.gen.ts.

## Verification
One typecheck. Stop at first error, no retry. No browser checks, no publish.
