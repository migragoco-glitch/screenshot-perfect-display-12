<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Gate full-assessment rendering through the existing tier API backed by authenticated server pass status, never persisted payment tiers; this preserves shared answers without trusting browser purchase claims.
- Keep payment-provider details in payment-provider.server.ts and expose signed webhooks under /api/public; this isolates replacements and permits verified external callbacks after publishing.
- Record pass stacking atomically through a service-role-only database function; per-user locking prevents concurrent payments from overlapping.
- After verified payment activation, continue to the assessment when incomplete or dashboard when complete; never generate results from partial Quick Check answers.
- Keep the needs-first /start flow URL-only and derive its steps in area-flow from shared answers and existing roadmap knowledge; its checkout return target preserves the separate flow without changing assessment scoring.
- Keep checkout selection local and carry it through account sign-in in a validated same-origin return; only server-recorded payments grant time-limited access, without changing shared assessment storage.
- Reuse FoundersCircleModal for landing Premium entry and preserve its checkout return target through consent, so email capture and the needs-first flow share the existing behavior.
- Keep /start question completion and later-stage guards on the same applicability-aware counts, treating Q2 as complete with an effective route; keep all hooks before the hydration return to preserve hook order.
- Keep completed-Premium profile links in the pure profile-link helper, reusing knowledge entries and /start completion IDs without changing either roadmap generator; omit check dates without a matching overlay source.
- Premium dashboard progress derives from the same area steps, profile additions and stored completion IDs as /start; resolve knowledge weeks in the profile-link helper and use the existing phase start for overlay-only steps, so no second roadmap is generated.
- Share roadmap summary and profile preview presentation between /start and dashboard; keep persisted step/document IDs unchanged so both views reflect the same progress.
- Snapshot submitted answers with their skip flag and scoring context; recorded-answer links use an explicit read-only view so viewing preserves drafts, while confirmed re-assessment alone reopens them.
