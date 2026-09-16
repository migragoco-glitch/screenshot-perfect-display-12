# Scoped loading and progress color refinements

## Changes
- Slow the existing static penguin slide to span each loading interval with ease-in-out motion, removing the waddle cycle without changing its size or position.
- Keep profile loading bilingual and stage roadmap generation into the two supplied English and Persian messages at roughly two seconds each.
- Use solid warm fills for roadmap action priority labels, authority labels, and selected status controls; leave unselected controls outlined.
- Fill only active weekly progress cells with their phase color and white count text; preserve zero-week neutral styling.
- Strengthen the three specified Progress summary areas with solid brand fills while preserving all text, numbers, and layout.

## Technical details
- Reuse the existing palette variables only, including the established destructive color for high priority.
- Scope the solid authority treatment to roadmap action cards so other authority labels remain unchanged.
- Do not modify Dashboard journey pills or roadmap phase bars.

## Verification
- Check both loading screens and the staged roadmap copy in English and Persian.
- Check active and inactive roadmap statuses, labels, weekly cells, and summary areas.
- Confirm a clean preview build and no unintended changes to the protected elements.
