# Navigator ring colors and entrance animations

## Changes
- Update only the homepage Navigator preview rings to use the existing vivid roadmap palette: light teal, teal, olive, and gold.
- Animate the main ring and three smaller rings once on first view, including synchronized number count-ups.
- Animate the four roadmap bars once on first view with direction-aware staggering: left-to-right in English and right-to-left in Persian.
- Animate the three 10-minute preview badges once on first view with staggered fade-and-scale entrances.
- Keep all text, dimensions, placement, spacing, and unrelated styling unchanged.

## Technical details
- Limit component changes to `src/routes/index.tsx` and animation/reduced-motion rules to `src/styles.css`.
- Use a shared Intersection Observer hook so each visual group triggers only once.
- Preserve immediate text rendering and support `prefers-reduced-motion` by showing final visual states without motion.
- Verify English, Persian RTL, desktop, and mobile behavior after implementation.
