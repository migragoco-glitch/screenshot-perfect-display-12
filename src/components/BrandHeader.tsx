import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Globe, Lock, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import logoAsset from "@/assets/logo.png.asset.json";
import qrCodeAsset from "@/assets/qr-code-migrago.jpeg.asset.json";
import { CONTACT_EMAIL, MAILTO_URL, WHATSAPP_URL } from "@/components/SupportChannels";
import { useI18n } from "@/lib/i18n";
import { useSession, signOutEverywhere } from "@/lib/session";
import { hasNavigatorAccess, trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";


export const COUNTRY_OPTIONS = [
  { code: "FI", flag: "🇫🇮", name: { en: "Finland", fa: "فنلاند" }, active: true },
  { code: "DE", flag: "🇩🇪", name: { en: "Germany", fa: "آلمان" }, active: false },
  { code: "CA", flag: "🇨🇦", name: { en: "Canada", fa: "کانادا" }, active: false },
  { code: "GB", flag: "🇬🇧", name: { en: "United Kingdom", fa: "بریتانیا" }, active: false },
  { code: "TR", flag: "🇹🇷", name: { en: "Türkiye", fa: "ترکیه" }, active: false },
  { code: "US", flag: "🇺🇸", name: { en: "United States", fa: "ایالات متحده" }, active: false },
  { code: "AU", flag: "🇦🇺", name: { en: "Australia", fa: "استرالیا" }, active: false },
  { code: "NL", flag: "🇳🇱", name: { en: "Netherlands", fa: "هلند" }, active: false },
  { code: "SE", flag: "🇸🇪", name: { en: "Sweden", fa: "سوئد" }, active: false },
] as const;

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={logoAsset.url}
        alt="MigraGo — SettleSmart Navigator"
        className="h-16 w-auto md:h-20"
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
  const [open, setOpen] = useState(false);
  const finland = COUNTRY_OPTIONS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-expanded={open} className="gap-1.5 rounded-full bg-card">
          <span aria-hidden>{finland.flag}</span>
          {finland.name[lang]}
          <ChevronDown className="size-3" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" dir={lang === "fa" ? "rtl" : "ltr"} aria-label={t("nav.country")} className="max-h-[var(--radix-popover-content-available-height)] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto p-2">
        <ul>
          <li className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground" aria-current="true">
            <span aria-hidden>{finland.flag}</span>{finland.name[lang]}
          </li>
        </ul>
        <p className="px-3 pb-1 pt-3 text-xs font-semibold text-muted-foreground">{t("country.soonHeading")}</p>
        <ul>
          {COUNTRY_OPTIONS.filter((c) => !c.active).map((c) => (
            <li key={c.code}>
              <Button type="button" variant="ghost" size="sm" title={t("nav.comingSoonTip")} aria-disabled="true" onClick={() => trackEvent({ type: "country_click", country: c.name.en })} className="h-auto min-h-8 w-full justify-start gap-2 whitespace-normal text-start text-xs text-muted-foreground">
                <span aria-hidden>{c.flag}</span>
                <span className="min-w-0 flex-1">{c.name[lang]}</span>
                <Lock className="size-3 text-[var(--plum)]" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function AppHeader({ registered, quickCheckCta = false }: { registered?: boolean; quickCheckCta?: boolean }) {
  const { t, lang } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { session } = useSession();
  const { state } = useAppState();
  const legacyProfile = state.completed && hasNavigatorAccess(state.tier);

  const handleLogout = async () => {
    await signOutEverywhere();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("migrago.founder");
    }
    void navigate({ to: "/" });
  };

  const renderMenuItems = (mobile = false) => (
    <>
          <nav aria-label={t("nav.menu")} className={cn("flex gap-4 text-xs font-semibold text-muted-foreground", mobile ? "w-full flex-col border-b border-border pb-3" : "items-center")}>
            <Link to="/" hash="how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">{t("nav.how")}</Link>
            <Link to="/" hash="pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">{t("nav.pricing")}</Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">{t("nav.faq")}</Link>
          </nav>
          <CountrySelector />
          <LanguageSwitch />
          {registered ? (
            <Link
              to={legacyProfile ? "/dashboard" : "/start"}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90"
            >
              {t(legacyProfile ? "nav.profile" : "nav.continue")}
            </Link>
          ) : null}
          {session ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setMobileMenuOpen(false); void handleLogout(); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-3.5 rtl:rotate-180" aria-hidden />
              {t("nav.logout")}
            </Button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors duration-200 ease-out hover:bg-secondary/90"
            >
              {t("nav.signIn")}
            </Link>
          )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 md:gap-3 md:px-8">
        <BrandLogo />
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {quickCheckCta ? (
            <Button asChild variant="secondary" size="sm" className="h-auto max-w-36 whitespace-normal rounded-full px-3 py-2 text-center text-xs md:max-w-none md:px-4">
              <Link to="/start">{t("hero.startCta")}</Link>
            </Button>
          ) : null}
          <div className="hidden flex-wrap items-center gap-2 md:flex">{renderMenuItems()}</div>
          <div className="md:hidden">
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-expanded={mobileMenuOpen} className="rounded-full">
                  <Menu className="size-4" aria-hidden />{t("nav.menu")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" dir={lang === "fa" ? "rtl" : "ltr"} aria-label={t("nav.menu")} className="flex max-h-[var(--radix-popover-content-available-height)] max-w-[calc(100vw-2rem)] flex-wrap items-center gap-3 overflow-y-auto md:hidden">
                {renderMenuItems(true)}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}


export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/70 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 md:px-8">
        <div className="flex flex-col items-start gap-4">
          <div className="inline-flex w-fit items-center gap-3.5 rounded-xl bg-white p-3 shadow-[var(--shadow-card)]">
            <img
              src={logoAsset.url}
              alt="MigraGo — SettleSmart Navigator"
              className="h-12 w-auto md:h-14"
            />
            <a
              href="https://www.migrago.fi"
              target="_blank"
              rel="noreferrer noopener"
              className="flex flex-col items-center gap-0.5"
            >
              <img
                src={qrCodeAsset.url}
                alt="MigraGo website QR code"
                className="size-11 rounded"
              />
              <span className="text-[9px] text-foreground/60">
                {t("footer.qrCaption")}
              </span>
            </a>
          </div>
          <p className="text-lg font-semibold text-primary-foreground">
            {t("footer.tagline")}
          </p>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
            {t("footer.description")}
          </p>
        </div>
        <div className="flex flex-col items-start">
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
      </div>
    </footer>
  );
}
