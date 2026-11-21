import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/payment-cancelled")({
  head: () => ({
    meta: [
      { title: "Payment not completed — MigraGo" },
      { name: "description", content: "Your MigraGo Premium payment was not completed and no money was taken." },
      { property: "og:title", content: "Payment not completed — MigraGo" },
      { property: "og:description", content: "No money was taken. You can try again at any time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentCancelledPage,
});

function PaymentCancelledPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page legal-page mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="glass-card rounded-3xl border-t-[5px] border-t-[var(--plum)] p-7 md:p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--institution-active-foreground)] shadow-sm" aria-hidden><XCircle className="size-6" /></div>
          <h1 className="mt-5 text-2xl md:text-3xl">{t("payment.cancel.title")}</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("payment.cancel.body")}</p>
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
