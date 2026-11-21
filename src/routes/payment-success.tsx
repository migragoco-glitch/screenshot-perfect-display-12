import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useAppState } from "@/lib/store";
import { getPremiumStatus } from "@/lib/payments.functions";
import type { PremiumStatus } from "@/lib/payments";

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
  const { t, lang } = useI18n();
  const { user, loading } = useSession();
  const { state: appState } = useAppState();
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setStatus(null);
    setTimedOut(false);
    if (!user) return () => { active = false; };
    const deadline = Date.now() + 60000;
    const timeout = setTimeout(() => { if (active) { active = false; setTimedOut(true); if (timer) clearTimeout(timer); } }, 60000);
    const poll = async () => {
      try {
        const result = await getPremiumStatus();
        if (!active) return;
        if (result.active) { setStatus(result); clearTimeout(timeout); return; }
      } catch { /* Show the existing help text if activation cannot be confirmed. */ }
      if (active && Date.now() + 3000 < deadline) timer = setTimeout(() => void poll(), 3000);
    };
    void poll();
    return () => { active = false; clearTimeout(timeout); if (timer) clearTimeout(timer); };
  }, [user?.id]);
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="visual-page legal-page mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="glass-card rounded-3xl border-t-[5px] border-t-[var(--plum)] p-7 md:p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--institution-active-foreground)] shadow-sm" aria-hidden><CheckCircle2 className="size-6" /></div>
          <h1 className="mt-5 text-2xl md:text-3xl">{t("payment.success.title")}</h1>
          {status?.active && status.expiresAt ? <>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("payment.success.activeUntil")} {new Date(status.expiresAt).toLocaleDateString(lang === "fa" ? "fa-IR" : "en")}</p>
            <Button asChild className="mt-6"><Link to={appState.completed ? "/dashboard" : "/assessment"}>{t("payment.success.continue")}</Link></Button>
          </> : !loading && (!user || timedOut) ? <p className="legal-notice mt-6">{t("payment.success.help")}</p> : <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("payment.success.body")}</p>}
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
