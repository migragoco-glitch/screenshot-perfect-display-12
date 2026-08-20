import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MigraGo SettleSmart Navigator" },
      {
        name: "description",
        content:
          "How MigraGo handles assessment answers, Founder's Circle emails and anonymous feedback data.",
      },
      { property: "og:title", content: "Privacy Policy — MigraGo" },
      {
        property: "og:description",
        content: "Plain-language privacy notice for the MigraGo Finland integration prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="glass-card rise-in rounded-3xl p-7 md:p-10">
          <ShieldCheck className="size-7 text-secondary" aria-hidden />
          <h1 className="mt-5 text-2xl md:text-3xl">{t("privacy.title")}</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("privacy.body")}</p>
          <p className="mt-6 rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
            {t("set.placeholderNote")}
          </p>
          <Link
            to="/dashboard"
            className="mt-7 inline-flex text-sm font-semibold text-secondary underline underline-offset-4"
          >
            {t("common.back")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
