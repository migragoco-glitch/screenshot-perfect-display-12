import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { SupportChannels } from "@/components/SupportChannels";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — MigraGo" },
      {
        name: "description",
        content:
          "Contact MigraGo by email or WhatsApp about your Finland integration assessment or roadmap.",
      },
      { property: "og:title", content: "Contact us — MigraGo" },
      {
        property: "og:description",
        content: "Contact MigraGo by email or WhatsApp about your Finland integration assessment or roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page visual-contact mx-auto w-full max-w-3xl flex-1 px-4 py-14 md:px-8">
        <Mail className="size-7 text-secondary" aria-hidden />
        <h1 className="mt-5 text-3xl">{t("contact.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("contact.sub")}</p>

        <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("support.channels")}
        </h2>
        <div className="mt-3">
          <SupportChannels />
        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
