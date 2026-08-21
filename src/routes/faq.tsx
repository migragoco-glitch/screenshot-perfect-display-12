import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — MigraGo SettleSmart Navigator" },
      {
        name: "description",
        content:
          "Answers about MigraGo's Finland integration assessment, scoring, pricing, data handling and the 12-week roadmap.",
      },
      { property: "og:title", content: "FAQ — MigraGo SettleSmart Navigator" },
      {
        property: "og:description",
        content: "Common questions about the assessment, scoring model, pricing and your data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

const ITEMS = Array.from({ length: 10 }, (_, i) => i + 1);

function FaqPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 md:px-8">
        <HelpCircle className="size-7 text-secondary" aria-hidden />
        <h1 className="mt-5 text-3xl">{t("faq.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("faq.sub")}</p>

        <div className="mt-8 space-y-3">
          {ITEMS.map((n) => (
            <details
              key={n}
              className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                {t(`faq.q${n}` as never)}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(`faq.a${n}` as never)}
              </p>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
