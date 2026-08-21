import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Lock, LogOut } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { CONTACT_EMAIL, MAILTO_URL, WHATSAPP_URL } from "@/components/SupportChannels";
import { useI18n } from "@/lib/i18n";
import { useSession, signOutEverywhere } from "@/lib/session";
import { trackEvent } from "@/lib/store";
import { cn } from "@/lib/utils";


export const COUNTRY_OPTIONS = [
  { code: "FI", flag: "🇫🇮", name: { en: "Finland", fa: "فنلاند" }, active: true, group: "eu" },
  { code: "DE", flag: "🇩🇪", name: { en: "Germany", fa: "آلمان" }, active: false, group: "eu" },
  { code: "SE", flag: "🇸🇪", name: { en: "Sweden", fa: "سوئد" }, active: false, group: "eu" },
  { code: "NL", flag: "🇳🇱", name: { en: "Netherlands", fa: "هلند" }, active: false, group: "eu" },
  { code: "CA", flag: "🇨🇦", name: { en: "Canada", fa: "کانادا" }, active: false, group: "global" },
] as const;

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={logoAsset.url}
        alt="MigraGo — SettleSmart Navigator"
        className="h-11 w-auto md:h-12"
      />
    </Link>
  );
}

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
      role="group"
      aria-label={t("nav.language")}
    >
      <Globe className="mx-1 size-4 text-muted-foreground" aria-hidden />
      {(["en", "fa"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors duration-200 ease-out",
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l === "en" ? "EN" : "FA"}
        </button>
      ))}
    </div>
  );
}

export function CountrySelector() {
  const { lang, t } = useI18n();

  const renderCountry = (c: (typeof COUNTRY_OPTIONS)[number]) =>
    c.active ? (
      <span
        key={c.code}
        className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
      >
        <span aria-hidden>{c.flag}</span>
        {c.name[lang]}
      </span>
    ) : (
      <button
        key={c.code}
        type="button"
        title={t("nav.comingSoonTip")}
        aria-disabled="true"
        onClick={() => trackEvent({ type: "country_click", country: c.name.en })}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground/80 transition-colors duration-200 ease-out hover:bg-muted"
      >
        <span aria-hidden className="grayscale">
          {c.flag}
        </span>
        {c.name[lang]}
        <Lock className="size-3" aria-hidden />
      </button>
    );

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("country.eu")}
      </span>
      {COUNTRY_OPTIONS.filter((c) => c.group === "eu").map(renderCountry)}
      <span className="mx-1 h-4 w-px bg-border" aria-hidden />
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("country.global")}
      </span>
      {COUNTRY_OPTIONS.filter((c) => c.group === "global").map(renderCountry)}
    </div>
  );
}

export function AppHeader({ registered }: { registered?: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session } = useSession();

  const handleLogout = async () => {
    await signOutEverywhere();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("migrago.founder");
    }
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-8">
        <BrandLogo />
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <CountrySelector />
          <LanguageSwitch />
          {registered ? (
            <Link
              to="/dashboard"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90"
            >
              {t("nav.profile")}
            </Link>
          ) : null}
          {session ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-3.5 rtl:rotate-180" aria-hidden />
              {t("nav.logout")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/70 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <p className="max-w-3xl text-sm leading-relaxed text-primary-foreground/80">
          {t("footer.legal")}
        </p>
        <nav className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold">
          <Link to="/faq" className="underline underline-offset-4 hover:opacity-80">
            {t("nav.faq")}
          </Link>
          <Link to="/contact" className="underline underline-offset-4 hover:opacity-80">
            {t("nav.contact")}
          </Link>
          <Link to="/privacy" className="underline underline-offset-4 hover:opacity-80">
            {t("set.privacy")}
          </Link>
          <Link to="/terms" className="underline underline-offset-4 hover:opacity-80">
            {t("set.terms")}
          </Link>
          <a
            href={MAILTO_URL}
            className="underline underline-offset-4 hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4 hover:opacity-80"
          >
            {t("support.whatsapp")}
          </a>
        </nav>
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
          {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
