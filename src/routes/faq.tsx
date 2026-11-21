import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { SupportChannels } from "@/components/SupportChannels";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — MigraGo" },
      {
        name: "description",
        content:
          "Answers about MigraGo's Finland integration assessment, scoring, pricing, data handling and the step-by-step roadmap.",
      },
      { property: "og:title", content: "FAQ — MigraGo" },
      {
        property: "og:description",
        content: "Common questions about the assessment, scoring, pricing and your data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

const ITEMS = Array.from({ length: 15 }, (_, i) => i + 1);

function FaqPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page visual-faq mx-auto w-full max-w-3xl flex-1 px-4 py-14 md:px-8">
        <HelpCircle className="size-7 text-secondary" aria-hidden />
        <h1 className="mt-5 text-3xl">{t("faq.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("faq.sub")}</p>

        <div className="mt-8 space-y-3">
          {ITEMS.map((n) => (
            <details
              key={n}
              className="group glass-card rounded-3xl p-5"
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

        <h2 className="visual-label mt-10 text-xs font-bold uppercase tracking-wider">
          {t("support.channels")}
        </h2>
        <div className="mt-3">
          <SupportChannels compact />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
