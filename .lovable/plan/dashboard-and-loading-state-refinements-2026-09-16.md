# Dashboard and loading-state refinements

## Changes
- Change only the five Dashboard journey pills to the specified solid brand fills with white text, retaining a muted navy treatment when Progress is inactive.
- Restyle only the Integration Readiness Indicator box with the specified cream background and fixed inset-style highlight/shadow; leave adjacent buttons unchanged.
- Extend the shared penguin loader to cycle through a screen-specific pair of bilingual messages during each existing loading interval: profile analysis and roadmap generation remain separate.
- Replace the rigid penguin travel with eased horizontal movement plus a subtle synchronized waddle/bounce, including reduced-motion support.

## Technical details
- Add four translation entries to both English and Persian dictionaries without changing existing copy elsewhere.
- Pass each loading screen its own two-message sequence and rotate midway through the current delay.
- Use existing brand tokens for the Dashboard colors; add the requested olive and cream values as local presentation values only where explicitly required.

## Verification
- Check Dashboard fills, inactive Progress state, readiness-box styling, both message sequences, and penguin motion in English and Persian.
- Confirm the roadmap phase bars and all unrelated pages remain unchanged, and verify a clean preview build.
