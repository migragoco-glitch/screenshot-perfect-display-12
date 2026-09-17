# Smart Guided Assessment redesign

## Scope
Redesign only `/assessment` and its assessment-only presentation pieces. Preserve all 42 questions, their order, scoring, conditional rules, saved answers, and the existing desktop ring sidebar.

## Experience flow
1. Add an assessment-only guided state flow:
   - before Q1: static penguin moment, then Level 1 introduction;
   - before every level: icon, existing level name, and a concise bilingual one-line description;
   - after a completed level is advanced: show the exact bilingual completion message for about 1.4 seconds;
   - after Level 4 completion: show the midpoint static penguin moment before Level 5 introduction;
   - before Level 7: show the near-end static penguin moment after Level 6 completion and before the Level 7 introduction.
2. Keep Back available during questions and preserve answers. Returning to a previous level opens its questions without replaying already-seen transient screens in that visit.
3. Use the existing static penguin asset only at those three moments, fixed in place with fade-only entrance/exit and reduced-motion support.

## Progress presentation
1. On mobile only, replace the current simple progress strip with a compact overall progress ring and the exact localized `Level X of 7 — [Section Name]` label.
2. Add a seven-segment level bar to the assessment header on mobile and desktop. Completed levels fill; the current level is distinguishable without implying completion.
3. Leave the desktop main ring and three dimension rings unchanged.

## Question presentation
1. Add a check indicator to single-select, multi-select, scale, and conditional option controls. Selection changes from empty to filled/checkmarked with a 200–300ms subtle animation and no text or points.
2. Apply a roughly 300ms slide-down/fade-in only when existing conditional content appears: Q6, Q16, Q20, Q39–41, Q31 detail, and Q7 child-age/detail content. No conditional logic changes.
3. Remove the existing generic encouragement sentence from the progress header so encouragement appears only in the seven completion moments and three specified penguin moments.

## Bilingual content
Add matching English and Persian keys for the three penguin messages, seven intro descriptions, level label, completion template, and intro action. Persian follows the existing RTL behavior and localized numerals.

## Verification
- Confirm exactly 42 questions remain in the same order and scoring files are unchanged.
- Verify English and Persian mobile/desktop layouts, including RTL and ring/segment updates.
- Verify all three penguin moments are static and fade-only, and the existing desktop sidebar is unchanged.
- Verify all listed conditional questions animate with their existing visibility rules.
- Verify answer selection, autosave, Back/Next navigation, page reload restoration, and final submission still work.
- Confirm a clean preview build with no runtime or console errors.
