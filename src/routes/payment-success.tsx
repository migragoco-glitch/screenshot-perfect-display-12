import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [
      { title: "Payment received — MigraGo" },
      { name: "description", content: "Your MigraGo Premium payment was received and access is being activated." },
      { property: "og:title", content: "Payment received — MigraGo" },
      { property: "og:description", content: "Your MigraGo Premium access is being activated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page legal-page mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="glass-card rounded-3xl border-t-[5px] border-t-[var(--plum)] p-7 md:p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--institution-active-foreground)] shadow-sm" aria-hidden><CheckCircle2 className="size-6" /></div>
          <h1 className="mt-5 text-2xl md:text-3xl">{t("payment.success.title")}</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("payment.success.body")}</p>
          <p className="legal-notice mt-6">{t("payment.success.help")}</p>
          <Link
            to="/start"
            className="mt-7 inline-flex text-sm font-semibold text-[var(--plum)] underline decoration-[var(--plum)] underline-offset-4 hover:opacity-85 dark:text-foreground"
          >
            {t("payment.back")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
