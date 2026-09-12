# Final content and scoring corrections

## Scope
Change only questionnaire content, scoring/applicability logic, the Profile-screen disclaimer, and the existing 12-week roadmap content structure. Preserve all 42 questions, their order, seven levels, three dimensions, current visual styling, and all unrelated pages/content.

## Implementation

1. **Q22 awareness hint**
   - Add the exact English and Persian `hint` text to Q22.
   - Render a question’s bilingual hint through the existing question card typography, without changing card layout or styles.

2. **Profile-only disclaimer**
   - Replace only the `dash.dim3Note` English and Persian strings with the supplied softer wording.
   - Leave the homepage Boundaries copy and every other disclaimer unchanged.

3. **Conditional answers as Not Applicable**
   - Centralize question applicability so hidden questions are excluded before scoring and profile signal generation.
   - Ensure stale saved answers for hidden conditional questions cannot contribute a zero, lower a denominator, create a gap, or activate bonus/profile signals.
   - Keep conditional answers absent from the active answer set when a controlling answer changes or the Founder & Talent track is declined, while preserving all applicable answers.
   - Treat optional follow-up details as absent when their trigger is not selected.

4. **Scoring boundaries**
   - Keep Q36 context-only and outside all three readiness buckets; use it only for pathway flags and roadmap matching.
   - Keep Q33 exclusively in the Legal / Status bucket and legal-history pathway logic; verify it has no psychological score path.
   - Add focused regression checks proving hidden conditionals do not affect scores, changing Q36 does not itself score, and Q33 changes only Legal / Status.

5. **Structured roadmap actions**
   - Extend each existing roadmap knowledge item with bilingual content for Dependency and Completion Condition, plus an official source URL where available.
   - Present every matched roadmap card using the existing card style and these labels: User Action, Why it matters, Relevant Authority, Official Source, Dependency, and Completion Condition.
   - Show an authority only on roadmap items that remain relevant after pathway/gap matching; do not add a separate institution-only list.
   - Keep official links restricted to the corresponding Finnish authority/service page and open them safely in a new tab.
   - Preserve the existing week, priority, status, completion controls, phase ordering, and visual treatment.

## Verification
- Confirm the question array still contains exactly 42 questions in the same order and sections.
- Run focused scoring scenarios for hidden Q6/Q16/Q20/Q39–41, Q31 follow-up handling, Q36 independence, and Q33 dimension isolation.
- Verify both English and Persian assessment/profile/roadmap output, including RTL, official links, conditional authorities, and all six roadmap fields.
- Confirm the project type check/build and current preview diagnostics are clean.
