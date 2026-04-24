"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AuthResult, OAuthProvider } from "@/lib/auth/credentials";
import { StepIndicator } from "./step-indicator";

type Role = "creator" | "operator";
type Locale = "en" | "es";
type Mode = "signup" | "signin" | "magic";

const PROVIDERS: {
  id: OAuthProvider;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "twitch", label: "Twitch", icon: TwitchIcon },
  { id: "discord", label: "Discord", icon: DiscordIcon },
];

export function AuthPanel({
  role,
  locale,
  authError,
}: {
  role: Role;
  locale: Locale;
  authError?: string;
}) {
  const t = useTranslations("Auth");
  const tOath = useTranslations("Oath");

  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(authError ?? null);
  const [magicSent, setMagicSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOAuth(provider: OAuthProvider) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await postAuth<OAuthRes>("/api/auth/oauth", {
          provider,
          role,
          locale,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        window.location.href = res.url;
      } catch (e) {
        setError(e instanceof Error ? e.message : "error");
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMagicSent(false);

    startTransition(async () => {
      try {
        if (mode === "magic") {
          const res = await postAuth<AuthResult>("/api/auth/magic-link", {
            email,
            role,
            locale,
          });
          if (!res.ok) setError(res.error);
          else setMagicSent(true);
          return;
        }

        if (mode === "signup") {
          const res = await postAuth<AuthResult>("/api/auth/signup", {
            email,
            password,
            role,
            locale,
          });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          if (res.needsEmailConfirm) {
            setMagicSent(true);
            return;
          }
          window.location.href = `/${locale}/oath/${role}`;
          return;
        }

        const res = await postAuth<AuthResult>("/api/auth/signin", {
          email,
          password,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        window.location.href = `/${locale}/oath/${role}`;
      } catch (e) {
        setError(e instanceof Error ? e.message : "error");
      }
    });
  }

  if (magicSent) {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-14 sm:py-20 text-center">
        <p className="eyebrow mb-3">{t("checkEmailOverline")}</p>
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-4"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("checkEmailTitle")}
        </h1>
        <p className="font-display italic text-lg text-ink-soft mb-2">
          {t("checkEmailBody")}
        </p>
        <p className="font-mono text-sm text-ink-dim">{email}</p>
        <button
          type="button"
          className="mt-10 font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors"
          onClick={() => {
            setMagicSent(false);
            setError(null);
          }}
        >
          ← {t("useDifferentEmail")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
        <Link
          href="/"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-ink transition-colors"
        >
          ← {tOath("backStep")}
        </Link>
        <StepIndicator current={0} total={3} label={tOath("stepLabel")} />
      </div>

      <p className="eyebrow mb-3">
        {role === "creator" ? tOath("creatorOverline") : tOath("operatorOverline")}
      </p>
      <h1
        className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("thresholdTitle")}
      </h1>
      <p className="font-display italic text-base sm:text-lg text-ink-soft mb-10 sm:mb-12">
        {t("thresholdSubtitle")}
      </p>

      {/* OAuth providers */}
      <div className="space-y-3 mb-8">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            onClick={() => handleOAuth(p.id)}
            className="w-full flex items-center justify-center gap-3 border border-rule hover:border-oxblood px-5 py-3.5 font-display text-base transition-colors disabled:opacity-60 group"
          >
            <p.icon className="w-4 h-4 text-ink-dim group-hover:text-oxblood transition-colors" />
            <span>{t("continueWith", { provider: p.label })}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8" aria-hidden>
        <span className="flex-1 h-px bg-rule" />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-ink-faint">
          {t("orDivider")}
        </span>
        <span className="flex-1 h-px bg-rule" />
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <label className="block">
          <span className="eyebrow block mb-2">{tOath("fieldEmail")}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tOath("fieldEmailPlaceholder")}
            className="w-full bg-transparent border-b border-rule py-2 px-1 font-display text-xl focus:border-oxblood focus:outline-none placeholder:text-ink-faint/50 transition-colors"
          />
        </label>

        {mode !== "magic" && (
          <label className="block">
            <span className="eyebrow block mb-2">{t("fieldPassword")}</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("fieldPasswordPlaceholder")}
              className="w-full bg-transparent border-b border-rule py-2 px-1 font-display text-xl focus:border-oxblood focus:outline-none placeholder:text-ink-faint/50 transition-colors"
            />
            {mode === "signup" && (
              <span className="mt-1 block text-xs text-ink-faint">
                {t("passwordHelp")}
              </span>
            )}
          </label>
        )}

        {error && (
          <div
            role="alert"
            className="border-l-2 border-oxblood pl-4 py-2 text-sm text-oxblood font-mono tracking-wide"
          >
            {humanizeError(error, t)}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-3 bg-oxblood text-paper px-6 py-3.5 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-oxblood-deep transition-colors disabled:opacity-60"
        >
          {pending
            ? t("working")
            : mode === "signup"
              ? t("createAccountCta")
              : mode === "signin"
                ? t("signInCta")
                : t("sendMagicLinkCta")}
          {!pending && <span aria-hidden>→</span>}
        </button>
      </form>

      {/* Mode toggles */}
      <div className="mt-8 flex flex-col gap-3 text-center">
        {mode === "signup" && (
          <>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors"
            >
              {t("useMagicLink")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-display italic text-ink-dim hover:text-oxblood transition-colors text-sm"
            >
              {t("alreadyMember")}
            </button>
          </>
        )}
        {mode === "signin" && (
          <>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors"
            >
              {t("useMagicLink")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-display italic text-ink-dim hover:text-oxblood transition-colors text-sm"
            >
              {t("needAccount")}
            </button>
          </>
        )}
        {mode === "magic" && (
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors"
          >
            ← {t("usePassword")}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type OAuthRes = { ok: true; url: string } | { ok: false; error: string };

async function postAuth<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error("not_json");
  }
}

function humanizeError(
  error: string,
  t: (key: string) => string,
): string {
  if (error === "not_json") return t("errorInvalidInput");
  if (error === "auth_provider_misconfigured") return t("errorProviderMisconfigured");
  const lower = error.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return t("errorAlreadyRegistered");
  if (lower.includes("invalid login credentials") || lower === "invalid_credentials")
    return t("errorInvalidCredentials");
  if (lower.includes("email not confirmed")) return t("errorNotConfirmed");
  if (lower.includes("invalid_input")) return t("errorInvalidInput");
  return error;
}

// ---------------------------------------------------------------------------
// Icons — simple inline SVGs matching the Drake aesthetic (mono, 16px)
// ---------------------------------------------------------------------------
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.92h5.27c-.23 1.42-1.66 4.15-5.27 4.15-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.02.77 3.72 1.44l2.53-2.43C16.9 3.97 14.77 3 12.18 3 7.27 3 3.29 6.97 3.29 11.87s3.98 8.87 8.89 8.87c5.13 0 8.52-3.6 8.52-8.68 0-.58-.06-1.03-.35-1.96z"
      />
    </svg>
  );
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M4.265 3L3 6.26v12.48h4.23V21h2.377l2.265-2.26h3.46L21 13.74V3H4.265zm14.46 10.1l-2.82 2.82h-3.462l-2.265 2.26v-2.26H6.8V4.7h11.925v8.4zM16.6 7.52h-1.69v4.77h1.69V7.52zm-4.512 0h-1.69v4.77h1.69V7.52z"
      />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.07.07 0 00-.074.035c-.211.375-.445.864-.608 1.249a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.249.073.073 0 00-.074-.035A19.74 19.74 0 003.68 4.37a.07.07 0 00-.03.028C.533 9.046-.32 13.58.099 18.058a.08.08 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.1 14.1 0 001.226-1.994.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.893.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.1.246.199.373.293a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.673-3.548-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  );
}
