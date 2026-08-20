import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { AppHeader, SiteFooter } from "@/components/BrandHeader";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MigraGo SettleSmart Navigator" },
      {
        name: "description",
        content:
          "Sign in to MigraGo to save your 12-week Finland roadmap progress across devices.",
      },
      { property: "og:title", content: "Sign in — MigraGo SettleSmart Navigator" },
      {
        property: "og:description",
        content: "Save and resume your Finland integration roadmap progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session } = useSession();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (session) void navigate({ to: "/dashboard" });
  }, [session, navigate]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "up") {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (err) setError(err.message);
        else setNotice(t("auth.checkEmail"));
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(String(result.error));
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-14 md:px-8">
        <div className="glass-card rise-in rounded-3xl p-7 md:p-9">
          <LogIn className="size-7 text-secondary" aria-hidden />
          <h1 className="mt-5 text-2xl">{mode === "in" ? t("auth.signIn") : t("auth.signUp")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.subtitle")}</p>

          <label className="mt-6 block text-xs font-semibold text-muted-foreground">
            {t("auth.email")}
          </label>
          <input
            type="email"
            autoComplete="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            {t("auth.password")}
          </label>
          <input
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          {error ? <p className="mt-3 text-xs font-semibold text-destructive">{error}</p> : null}
          {notice ? <p className="mt-3 text-xs font-semibold text-secondary">{notice}</p> : null}

          <button
            type="button"
            disabled={busy || !email || password.length < 6}
            onClick={() => void submit()}
            className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90 disabled:opacity-40"
          >
            {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
          </button>

          <button
            type="button"
            onClick={() => void google()}
            className="mt-3 w-full rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors duration-200 ease-out hover:bg-muted"
          >
            {t("auth.google")}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setError(null);
              setNotice(null);
            }}
            className="mt-5 w-full text-sm font-semibold text-secondary underline underline-offset-4"
          >
            {mode === "in" ? t("auth.toggleToSignUp") : t("auth.toggleToSignIn")}
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
