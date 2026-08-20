import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Lock, LogOut } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { useI18n } from "@/lib/i18n";
import { useSession, signOutEverywhere } from "@/lib/session";
import { trackEvent } from "@/lib/store";
import { cn } from "@/lib/utils";


export const COUNTRY_OPTIONS = [
  { code: "FI", flag: "🇫🇮", name: { en: "Finland", fa: "فنلاند" }, active: true },
  { code: "DE", flag: "🇩🇪", name: { en: "Germany", fa: "آلمان" }, active: false },
  { code: "CA", flag: "🇨🇦", name: { en: "Canada", fa: "کانادا" }, active: false },
  { code: "SE", flag: "🇸🇪", name: { en: "Sweden", fa: "سوئد" }, active: false },
  { code: "NL", flag: "🇳🇱", name: { en: "Netherlands", fa: "هلند" }, active: false },
];

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
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("nav.country")}
      </span>
      {COUNTRY_OPTIONS.map((c) =>
        c.active ? (
          <span
            key={c.code}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-semibold text-secondary ring-1 ring-secondary/30"
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
            <span className="hidden text-[10px] uppercase tracking-wide sm:inline">
              {t("nav.comingSoon")}
            </span>
          </button>
        ),
      )}
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
              className="rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground"
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
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
          {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
