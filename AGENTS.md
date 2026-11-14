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

- Keep full-assessment access gated by the existing stored Navigator tier before rendering questions or results; reuse the existing early-access modal and simulated checkout so shared answers and storage remain intact.
- Route simulated-checkout completion to the full assessment when incomplete, and to existing results when complete; never generate results from partial Quick Check answers.
- Keep the needs-first /start flow URL-only and derive its steps in area-flow from shared answers and existing roadmap knowledge; its checkout return target preserves the separate flow without changing assessment scoring.
- Keep checkout pass selection local to the checkout screen and preserve simulated tier updates and return targets; selecting a pass must not introduce expiry enforcement or change shared assessment storage.
- Reuse FoundersCircleModal for landing Premium entry and preserve its checkout return target through consent, so email capture and the needs-first flow share the existing behavior.
- Keep /start question completion and later-stage guards on the same applicability-aware counts, treating Q2 as complete with an effective route; keep all hooks before the hydration return to preserve hook order.
- Keep completed-Premium profile links in the pure profile-link helper, reusing knowledge entries and /start completion IDs without changing either roadmap generator; omit check dates without a matching overlay source.
- Premium dashboard progress derives from the same area steps, profile additions and stored completion IDs as /start; resolve knowledge weeks in the profile-link helper and use the existing phase start for overlay-only steps, so no second roadmap is generated.
- Share roadmap summary and profile preview presentation between /start and dashboard; keep persisted step/document IDs unchanged so both views reflect the same progress.
