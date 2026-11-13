# Official sources strip: shorter subtitle and independence note

## Files and lines
- `src/lib/i18n.tsx` lines 238–239 (EN) and 1060 (FA): change `inst.sub`; add `inst.note` right after it in both dictionaries.
- `src/routes/index.tsx` after line 424 (closing `</ul>` of the chips, inside the same box): add one `<p>`.

## Changed key: inst.sub
- EN old: "Each link opens that institution's own official website. MigraGo is not affiliated with these institutions."
- EN new: "Each link opens that institution's own official website."
- FA old: «پیوند هر نهاد به وب‌سایت رسمی خودش باز می‌شود. میگراگو وابسته به این نهادها نیست.»
- FA new: «پیوند هر نهاد به وب‌سایت رسمی خودش باز می‌شود.»

## New key: inst.note
- EN: "MigraGo is an independent service with no affiliation or official partnership with these institutions. Their names are shown only to point to the official source."
- FA: «میگراگو یک سرویس مستقل است و با این نهادها وابستگی یا همکاری رسمی ندارد. نام این نهادها فقط برای ارجاع به منبع رسمی آمده است.»

## Note markup
`<p className="mt-6 max-w-2xl text-xs leading-relaxed opacity-75">{t("inst.note")}</p>`
- Same start alignment as the chips; inherits the strip's light text colour, softened with opacity (reusing the subtitle's opacity approach).
- No fixed width, so it wraps normally at 400px in RTL and LTR.

## Unchanged
Title, chips, links, order, all other sections and files. One build, no browser check, no publish.
