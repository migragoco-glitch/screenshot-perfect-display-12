# Webhook HMAC key compatibility

## Scope
- Change only key derivation and the adjacent signature comparison in `verifyAndParseWebhook` in `src/lib/payment-provider.server.ts`.
- Update only `src/lib/payments.test.js` to add one small decoded-key acceptance test. Preserve existing tests and expectations unless an expectation specifically assumes only legacy derivation.

## Implementation
- For a secret starting with `whsec_`, try standard base64 decoding of the remainder, adding missing padding. If decoding fails, skip this candidate without throwing.
- Always include the UTF-8 bytes of the full stored secret as the legacy candidate.
- Compute HMAC-SHA256 for each candidate over the unchanged `${id}.${timestamp}.${rawBody}` payload, base64-encode the digest, and accept if any candidate matches any `v1,...` signature using the existing constant-time comparison.
- Leave headers, timestamp tolerance, parsing, payment behavior, mismatch handling and generic errors unchanged. Never log secrets, signatures or bodies.

## Verification and report
- Run typecheck once and the existing payment test file once; allow only the automatic platform build, with no manual build.
- Stop at the first error; no retries or further fix attempts.
- No browser checks, publishing, settings, secrets, database or dependency changes.
- Do not edit `AGENTS.md`, `roadmap.md`, `routeTree.gen.ts`, `package.json` or lock files.
- Report the function and exact changed line ranges, test result and anything skipped. All requested code elements were found.