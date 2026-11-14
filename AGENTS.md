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
