import { Mail, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const CONTACT_EMAIL = "migrago.co@gmail.com";
export const WHATSAPP_NUMBER = "995595413537";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=MigraGo%20support`;

/** Email + WhatsApp, shown identically everywhere support is offered. */
export function SupportChannels({ compact }: { compact?: boolean }) {
  const { t } = useI18n();

  if (compact) {
    return (
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <a
          href={MAILTO_URL}
          className="inline-flex items-center gap-1.5 text-secondary underline underline-offset-4"
        >
          <Mail className="size-4" aria-hidden />
          {CONTACT_EMAIL}
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-secondary underline underline-offset-4"
        >
          <MessageCircle className="size-4" aria-hidden />
          {t("support.whatsapp")}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Mail className="size-3.5" aria-hidden />
          {t("support.email")}
        </span>
        <p className="mt-3 text-sm font-semibold">{CONTACT_EMAIL}</p>
        <a
          href={MAILTO_URL}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90"
        >
          <Mail className="size-4" aria-hidden />
          {t("contact.emailCta")}
        </a>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <MessageCircle className="size-3.5" aria-hidden />
          {t("support.whatsapp")}
        </span>
        <p className="mt-3 text-sm font-semibold" dir="ltr">
          +{WHATSAPP_NUMBER}
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-secondary px-5 py-2.5 text-sm font-semibold text-secondary transition-colors duration-200 ease-out hover:bg-secondary/10"
        >
          <MessageCircle className="size-4" aria-hidden />
          {t("support.whatsappCta")}
        </a>
      </div>
    </div>
  );
}
