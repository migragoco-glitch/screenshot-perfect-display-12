# Roadmap label and questionnaire context updates

## Scope
Implement only the requested bilingual roadmap label, Q7 conditional age follow-up and roadmap personalization, and Q35 option. Keep 42 numbered questions, scoring architecture, and visual styling unchanged. Investigate feedback storage without modifying it.

## Implementation
1. Replace the technical roadmap version display with the exact English/Persian human-readable text in its existing position and styling.
2. Extend the existing sub-question mechanism to support a conditional multi-select follow-up on Q7 when “Yes” is selected, using the four supplied bilingual age ranges.
3. Keep the Q7 age selection outside all score calculations and prune it when Q7 changes to “No”.
4. Use selected age ranges only to match age-appropriate childcare, pre-primary, compulsory-school, or upper-secondary roadmap actions.
5. Add the supplied bilingual “A combination of the above” option to context-only Q35.
6. Report where NPS scores/comments are stored and what the current owner-facing view exposes, without changing feedback code.

## Verification
- Confirm there are still exactly 42 questions in the same order.
- Confirm Q7 ages appear only for “Yes”, support multiple selections, and do not change any readiness score.
- Confirm each selected age range maps to the corresponding roadmap action and stale ages are removed after selecting “No”.
- Confirm Q35 remains unscored and the new option appears in both languages.
- Confirm the bilingual roadmap data label and a clean build.
