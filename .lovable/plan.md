# Compact header navigation and pricing heading

## Scope and files
After APPROVED, change only:
1. `src/components/BrandHeader.tsx` — compact country control, three navigation links, and mobile menu within the existing header.
2. `src/lib/i18n.tsx` — the four new keys and one changed heading key listed below, in EN and FA.
3. `src/routes/index.tsx` — add `id="pricing"` to the existing pricing section, which currently has no ID. Its heading already uses `pricing.title`; no other homepage markup changes.

## Exact translation keys
| Key | Action | EN | FA |
| --- | --- | --- | --- |
| `country.soonHeading` | New | Coming soon | به‌زودی |
| `nav.how` | New | How it works | چگونه کار می‌کند |
| `nav.pricing` | New | Pricing | قیمت‌ها |
| `nav.menu` | New | Menu | منو |
| `pricing.title` | Change from “Access tiers” / «سطوح دسترسی» | Pricing | قیمت‌ها |

Reuse `nav.faq` unchanged: EN “FAQ”, FA «پرسش‌های پرتکرار».
Reuse `nav.comingSoonTip` unchanged: EN “Not available in this version — coming soon.”, FA «در این نسخه فعال نیست — به‌زودی.».
Keep `country.eu` and `country.global` in the dictionaries, but remove their rendering from the header.

## Country control
- Replace the badge row with one compact trigger showing 🇫🇮 Finland in EN or 🇫🇮 فنلاند in FA, followed by a caret.
- Open a small list with Finland as the active, non-clickable item, followed by the translated “Coming soon” heading and these locked items in this exact order:

| Flag | EN | FA |
| --- | --- | --- |
| 🇩🇪 | Germany | آلمان |
| 🇨🇦 | Canada | کانادا |
| 🇬🇧 | United Kingdom | بریتانیا |
| 🇹🇷 | Türkiye | ترکیه |
| 🇺🇸 | United States | ایالات متحده |
| 🇦🇺 | Australia | استرالیا |
| 🇳🇱 | Netherlands | هلند |
| 🇸🇪 | Sweden | سوئد |

- Keep bilingual names in the existing `COUNTRY_OPTIONS` structure. Do not add France.
- Each locked item keeps its emoji, existing Lock icon, `aria-disabled="true"`, `title={t("nav.comingSoonTip")}`, and `trackEvent({ type: "country_click", country: c.name.en })` on click. No navigation or country change; do not use native `disabled`, which would prevent the requested analytics click.

## Navigation and mobile behavior
- Add inline desktop links: `nav.how` → `/#how-it-works`, `nav.pricing` → `/#pricing`, and `nav.faq` → `/faq`.
- Use `Link to="/" hash="how-it-works"` and `Link to="/" hash="pricing"` so the same links work both on the homepage and other routes.
- At `md` and above, show the links, country control, language switch, and existing account controls inline.
- Below `md`, show the unchanged logo, the existing primary CTA when `quickCheckCta` is enabled, and one Menu button. Move the three links, country control, unchanged language switch, Continue/Profile control when applicable, and Sign in/Log out control into its panel.
- Keep the primary CTA outside the mobile panel, using `hero.startCta` → `/start`. Preserve the existing `quickCheckCta` condition on other routes; do not add CTAs where none currently exist.
- The mobile panel closes when a navigation link is chosen, on outside click, or on Escape. Language switching remains usable within the panel. Persian layout follows the existing RTL setting.

## Technical details: state and markup
- Reuse the existing `Button` and `Popover` components; no package or shared-component changes.
- Use controlled `mobileMenuOpen` state in `AppHeader` and country-list open state in `CountrySelector`, wired through Popover `open` / `onOpenChange`.
- Each Popover trigger uses `Button` through `PopoverTrigger asChild`, with `aria-expanded` and an associated panel. Existing Popover behavior supplies outside-click dismissal, Escape handling, keyboard focus management, and focus return to the trigger.
- Mobile panel markup contains a labelled navigation block and the existing controls. Country content uses a semantic list with a static active Finland row and focusable locked item controls, allowing Tab and Enter/Space interaction without navigation.
- Constrain panels to the available viewport and allow scrolling for the country list. Use only existing surface, border, text, accent, and shadow styles.

## Explicitly unchanged
Logo image, size, alt text, and absence of text below it; sticky header behavior; `LanguageSwitch` implementation; CTA text and destination; Continue/Profile conditions and destinations; Sign in/Log out conditions and handlers; footer; pricing cards, prices, descriptions, and every other pricing key; all other sections, routes, assessment logic, storage, checkout, backend, packages, and global styles. No refactor or unrelated edits.

## Execution limits
No app edits before APPROVED. After approval, one focused implementation pass and one automatic build only; no manual build, browser or preview checks, publishing, or repeated test runs. Report any error immediately and stop rather than retrying. If a required element is missing or broader changes are needed, stop and ask first.