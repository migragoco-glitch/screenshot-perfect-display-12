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


const flagImage = (width: number, height: number, shapes: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${shapes}</svg>`)}`;

const unionJack = '<path fill="#012169" d="M0 0h60v30H0z"/><path stroke="#fff" stroke-width="6" d="m0 0 60 30m0-30L0 30"/><path stroke="#c8102e" stroke-width="2" d="m0 0 60 30m0-30L0 30"/><path stroke="#fff" stroke-width="10" d="M30 0v30M0 15h60"/><path stroke="#c8102e" stroke-width="6" d="M30 0v30M0 15h60"/>';
const usStars = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, col) =>
    `<use href="#star" transform="translate(${3 + col * 6 + (row % 2) * 3} ${3 + row * 3})"/>`,
  ).join(""),
).join("");

export const COUNTRY_OPTIONS = [
  { code: "FI", flag: flagImage(18, 11, '<path fill="#fff" d="M0 0h18v11H0z"/><path fill="#003580" d="M5 0h3v11H5zM0 4h18v3H0z"/>'), name: { en: "Finland", fa: "فنلاند" }, active: true },
  { code: "DE", flag: flagImage(5, 3, '<path fill="#000" d="M0 0h5v1H0z"/><path fill="#d00" d="M0 1h5v1H0z"/><path fill="#ffce00" d="M0 2h5v1H0z"/>'), name: { en: "Germany", fa: "آلمان" }, active: false },
  { code: "CA", flag: flagImage(64, 32, '<path fill="#fff" d="M0 0h64v32H0z"/><path fill="#d80621" d="M0 0h16v32H0zM48 0h16v32H48zM32 4l-3 6-3-2 1 8-5-4-1 3-4-1 2 5-2 1 10 6-1 3 5-1v3h2v-3l5 1-1-3 10-6-2-1 2-5-4 1-1-3-5 4 1-8-3 2z"/>'), name: { en: "Canada", fa: "کانادا" }, active: false },
  { code: "GB", flag: flagImage(60, 30, unionJack), name: { en: "United Kingdom", fa: "بریتانیا" }, active: false },
  { code: "TR", flag: flagImage(60, 40, '<path fill="#e30a17" d="M0 0h60v40H0z"/><circle cx="22" cy="20" r="10" fill="#fff"/><circle cx="25" cy="20" r="8" fill="#e30a17"/><path fill="#fff" d="m35 14 1.4 4.3H41l-3.7 2.7 1.4 4.3-3.7-2.7-3.7 2.7 1.4-4.3-3.7-2.7h4.6z"/>'), name: { en: "Türkiye", fa: "ترکیه" }, active: false },
  { code: "US", flag: flagImage(123.5, 65, `<path fill="#fff" d="M0 0h123.5v65H0z"/>${Array.from({ length: 7 }, (_, i) => `<path fill="#b22234" d="M0 ${i * 10}h123.5v5H0z"/>`).join("")}<path fill="#3c3b6e" d="M0 0h49.4v35H0z"/><defs><path id="star" fill="#fff" d="m0-1.5.35 1.04H1.5l-.93.67.35 1.04L0 .61l-.92.64.35-1.04- .93-.67h1.15z"/></defs><g transform="scale(1.2 1)">${usStars}</g>`), name: { en: "United States", fa: "ایالات متحده" }, active: false },
  { code: "AU", flag: flagImage(60, 30, `<path fill="#012169" d="M0 0h60v30H0z"/><svg width="30" height="15" viewBox="0 0 60 30">${unionJack}</svg><defs><path id="seven" fill="#fff" d="m0-3.5.65 2.15 2.09-.83-1.28 1.85 1.95 1.14-2.25.14.3 2.23L0 1.56-1.76 3.18l.3-2.23-2.25-.14 1.95-1.14-1.28-1.85 2.09.83z"/><path id="five" fill="#fff" d="m0-1.7.4 1.2h1.25L.65.24l.39 1.2L0 .7l-1.04.74.39-1.2-1-.74H-.4z"/></defs><use href="#seven" transform="translate(15 23) scale(1.3)"/><use href="#seven" transform="translate(45 5) scale(.65)"/><use href="#seven" transform="translate(37 14) scale(.65)"/><use href="#seven" transform="translate(52 12) scale(.65)"/><use href="#seven" transform="translate(45 25) scale(.65)"/><use href="#five" transform="translate(49 18)"/>`), name: { en: "Australia", fa: "استرالیا" }, active: false },
  { code: "NL", flag: flagImage(3, 2, '<path fill="#ae1c28" d="M0 0h3v2H0z"/><path fill="#fff" d="M0 .6667h3v.6666H0z"/><path fill="#21468b" d="M0 1.3333h3V2H0z"/>'), name: { en: "Netherlands", fa: "هلند" }, active: false },
  { code: "SE", flag: flagImage(16, 10, '<path fill="#006aa7" d="M0 0h16v10H0z"/><path fill="#fecc00" d="M5 0h2v10H5zM0 4h16v2H0z"/>'), name: { en: "Sweden", fa: "سوئد" }, active: false },
] as const;

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={logoAsset.url}
        alt="MigraGo"
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
        <Button variant="outline" size="sm" aria-expanded={open} className={cn("gap-1.5 rounded-full border border-input bg-card transition-all duration-200 ease-out hover:border-[#C8A96A] hover:bg-[#C8A96A] hover:text-[#021C3B] focus-visible:border-[#C8A96A] focus-visible:bg-[#C8A96A] focus-visible:text-[#021C3B] focus-visible:ring-1 focus-visible:ring-[#C8A96A] active:bg-[#C8A96A] active:text-[#021C3B]", open && "border-[#C8A96A] bg-[#C8A96A] text-[#021C3B]")}>
          <img src={finland.flag} alt="" aria-hidden="true" className="h-4 w-5 shrink-0 object-contain" />
          {finland.name[lang]}
          <ChevronDown className="size-3" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" dir={lang === "fa" ? "rtl" : "ltr"} aria-label={t("nav.country")} className="max-h-[var(--radix-popover-content-available-height)] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto p-2">
        <ul>
          <li className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground" aria-current="true">
            <img src={finland.flag} alt="" aria-hidden="true" className="h-4 w-5 shrink-0 object-contain" />{finland.name[lang]}
          </li>
        </ul>
        <p className="px-3 pb-1 pt-3 text-xs font-semibold text-muted-foreground">{t("country.soonHeading")}</p>
        <ul>
          {COUNTRY_OPTIONS.filter((c) => !c.active).map((c) => (
            <li key={c.code}>
              <Button type="button" variant="ghost" size="sm" title={t("nav.comingSoonTip")} aria-disabled="true" onClick={() => trackEvent({ type: "country_click", country: c.name.en })} className="h-auto min-h-8 w-full justify-start gap-2 whitespace-normal text-start text-xs text-muted-foreground">
                <img src={c.flag} alt="" aria-hidden="true" className="h-4 w-5 shrink-0 object-contain" />
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
          <div className="hidden flex-wrap items-center gap-2 lg:flex">{renderMenuItems()}</div>
          <div className="lg:hidden">
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-expanded={mobileMenuOpen} className="rounded-full">
                  <Menu className="size-4" aria-hidden />{t("nav.menu")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" dir={lang === "fa" ? "rtl" : "ltr"} aria-label={t("nav.menu")} className="flex max-h-[var(--radix-popover-content-available-height)] max-w-[calc(100vw-2rem)] flex-wrap items-center gap-3 overflow-y-auto lg:hidden">
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
    <footer className="border-t border-border/70 text-white" style={{ backgroundColor: "#021C3B" }}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 md:px-8">
        <div className="flex flex-col items-start gap-4">
          <div className="inline-flex w-fit items-center gap-3.5 rounded-xl bg-white p-3 shadow-[var(--shadow-card)]">
            <img
              src={logoAsset.url}
              alt="MigraGo"
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
          <p className="text-lg font-semibold text-white">
            {t("footer.tagline")}
          </p>
          <p className="max-w-md text-sm leading-relaxed text-white/85">
            {t("footer.description")}
          </p>
        </div>
        <div className="flex flex-col items-start">
          <p className="max-w-3xl text-sm leading-relaxed text-white/85">
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
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/85">
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
