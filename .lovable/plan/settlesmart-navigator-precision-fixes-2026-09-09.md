# SettleSmart Navigator precision fixes

## Changes
- Replace only the second preview badge glyph with the existing checklist icon, preserving its current badge colors and dimensions.
- Resize the gold arrow image to 13px within the unchanged 26px circular badge and keep it centered.
- Wrap the existing profile title, main ring, three mini-rings, and sample note in a distinct light cream card inside the Navigator card.
- Change that profile title to “Your Smart Integration Profile” / “پروفایل هوشمند شما”.
- Keep the roadmap labels as week ranges only; the current implementation already has no phase-name labels, so no roadmap markup change is needed.
- Change only the homepage pathway button below the preview card to Navigator teal with white text.

## Technical details
- Limit edits to `src/routes/index.tsx` and the two matching translations in `src/lib/i18n.tsx`.
- Preserve the profile ring components, their sizes, values, and all existing page placement.
- Verify English, Persian RTL, desktop, and mobile rendering after the edits.
