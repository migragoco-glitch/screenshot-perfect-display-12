# Homepage informational card icons and entrances

## Scope
- Update only the seven specified informational cards on the homepage.
- Preserve all existing copy, colors, spacing/layout structure, and flat non-interactive card styling.
- Apply identically in English and Persian.

## Changes
- Use existing Lucide line icons above each title:
  - Definition: Compass
  - Mission: Target
  - Boundaries: Scale
  - Social integration is a process: RefreshCw
  - Structured assessment: ClipboardList
  - Smart Integration Profile: Contact
  - 12-week roadmap: CalendarDays
- Reuse the existing teal or gold semantic accents; default to teal where no distinct accent exists.
- Add a once-only in-view entrance for each card: opacity 0 to 1 and translateY 8–10px to 0.
- Stagger each three-card row by roughly 90ms; animate the process card independently.
- Respect reduced-motion preferences.

## Validation
- Verify English and Persian rendering.
- Confirm each card animates once when scrolled into view.
- Confirm no shadow, hover lift, press state, scale, or button-like treatment was introduced.
- Check the homepage at desktop and mobile widths and confirm no unrelated sections changed.
