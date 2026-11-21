# Plan: two early-access text keys in src/lib/i18n.tsx

Text-only change. One file: `src/lib/i18n.tsx`. Four strings (2 keys x EN + FA). No JSX, no styling, no new keys, no other files.

## 1. Key `pay.modalOffer`

**EN (line 122)**
- Old: `Enter your email to get a 70% early-access discount.`
- New: `Enter the same email you sign in with to get a 70% early-access discount.`

**FA (line 1095)**
- Old: `با ثبت ایمیل، ۷۰٪ تخفیف زودهنگام بگیرید.`
- New: `همان ایمیلی را که با آن وارد می‌شوید ثبت کنید و ۷۰٪ تخفیف زودهنگام بگیرید.`

## 2. Key `pay.emailNote`

**EN (line 798)**
- Old: `Your email is stored to reserve this price. Premium unlocks after payment. Use the same email you will sign in with.`
- New: `Your email is stored to reserve this price. Premium unlocks after payment. How to get the early-access price: 1) Enter your email here. 2) Sign in with Google or email using that same address. 3) Pay the discounted price. A different email means the standard price. Entered the wrong email? Write to migrago.co@gmail.com.`

**FA (line 1770)**
- Old: `ایمیل شما برای رزرو این قیمت ذخیره می‌شود. Premium پس از پرداخت فعال می‌شود. از همان ایمیلی استفاده کنید که با آن وارد می‌شوید.`
- New: `ایمیل شما برای رزرو این قیمت ذخیره می‌شود. Premium پس از پرداخت فعال می‌شود. برای قیمت ویژه: ۱) ایمیل خود را همین‌جا بنویسید. ۲) با گوگل یا ایمیل و با همان نشانی وارد شوید. ۳) مبلغ تخفیف‌خورده را بپردازید. ایمیل متفاوت یعنی قیمت عادی. ایمیل را اشتباه نوشتید؟ به migrago.co@gmail.com پیام دهید.`

## Not touched

`pay.emailTitle`, `pay.emailLabel`, `pay.emailCta`, `pay.emailSkip`, `checkout.reservedEmail`, `checkout.codeApplied`, `src/components/FeedbackWidgets.tsx`, `src/routes/checkout.tsx`, AGENTS.md, roadmap.md, routeTree.gen.ts.

## Verification

Typecheck once. No browser checks, no Publish. Stop and report at the first error without retrying.

## Report

The two keys changed, with old and new text of each.
