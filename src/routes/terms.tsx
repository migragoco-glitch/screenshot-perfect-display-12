import { createFileRoute, Link } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — MigraGo" },
      {
        name: "description",
        content:
          "The terms covering MigraGo's informational guidance for Finland integration planning.",
      },
      { property: "og:title", content: "Terms of Service — MigraGo" },
      {
        property: "og:description",
        content: "Informational-use terms for the MigraGo Finland integration prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page legal-page mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="glass-card rounded-3xl border-t-[5px] border-t-[var(--plum)] p-7 md:p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--institution-active-foreground)] shadow-sm" aria-hidden><ScrollText className="size-6" /></div>
          <h1 className="mt-5 text-2xl md:text-3xl">{t("terms.title")}</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("terms.body")}</p>
          <p className="legal-notice mt-6">
            {t("set.placeholderNote")}
          </p>
          <Link
            to="/dashboard"
            className="mt-7 inline-flex text-sm font-semibold text-[var(--plum)] underline decoration-[var(--plum)] underline-offset-4 hover:opacity-85 dark:text-foreground"
          >
            {t("common.back")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
