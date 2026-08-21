import { createFileRoute } from "@tanstack/react-router";
import { Mail, Sparkles } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { SupportChannels } from "@/components/SupportChannels";
import { useI18n } from "@/lib/i18n";

export { CONTACT_EMAIL } from "@/components/SupportChannels";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — MigraGo SettleSmart Navigator" },
      {
        name: "description",
        content:
          "Reach the MigraGo team by email or WhatsApp for support with your Finland integration assessment or roadmap.",
      },
      { property: "og:title", content: "Contact us — MigraGo SettleSmart Navigator" },
      {
        property: "og:description",
        content: "Email and WhatsApp support for the MigraGo Finland integration prototype.",
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 md:px-8">
        <Mail className="size-7 text-secondary" aria-hidden />
        <h1 className="mt-5 text-3xl">{t("contact.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("contact.sub")}</p>

        <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("support.channels")}
        </h2>
        <div className="mt-3">
          <SupportChannels />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/50 p-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden />
            {t("contact.futureTitle")}
          </span>
          <p className="mt-3 text-sm text-muted-foreground">{t("contact.futureBody")}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
