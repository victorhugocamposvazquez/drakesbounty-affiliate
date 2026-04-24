import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";

type Role = "creator" | "operator";
type Locale = "en" | "es";

export type OAuthProvider = "google" | "twitch" | "discord";

export type AuthResult =
  | { ok: true; needsEmailConfirm?: boolean; magicLinkSent?: boolean }
  | { ok: false; error: string };

export type OAuthResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(72);
const roleSchema = z.enum(["creator", "operator"]);
const localeSchema = z.enum(["en", "es"]);
const providerSchema = z.enum(["google", "twitch", "discord"]);

function normalizeAuthError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message || "";
    if (msg.includes("Unexpected token '<'") || msg.includes("is not valid JSON")) {
      return "auth_provider_misconfigured";
    }
    return msg;
  }
  return "unknown_auth_error";
}

function buildCallbackUrl(role: Role, locale: Locale, next?: string): string {
  const params = new URLSearchParams({
    role,
    locale,
    next: next ?? `/${locale}/oath/${role}`,
  });
  return `${getAppUrl()}/auth/callback?${params.toString()}`;
}

export async function runSignUpWithPassword(input: {
  email: string;
  password: string;
  role: Role;
  locale: Locale;
}): Promise<AuthResult> {
  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      role: roleSchema,
      locale: localeSchema,
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          role: parsed.data.role,
          locale: parsed.data.locale,
        },
        emailRedirectTo: buildCallbackUrl(parsed.data.role, parsed.data.locale),
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const needsEmailConfirm = !data.session;
    return { ok: true, needsEmailConfirm };
  } catch (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }
}

export async function runSignInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_credentials" };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }
}

export async function runSignInWithMagicLink(input: {
  email: string;
  role: Role;
  locale: Locale;
}): Promise<AuthResult> {
  const parsed = z
    .object({ email: emailSchema, role: roleSchema, locale: localeSchema })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        shouldCreateUser: true,
        data: {
          role: parsed.data.role,
          locale: parsed.data.locale,
        },
        emailRedirectTo: buildCallbackUrl(parsed.data.role, parsed.data.locale),
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, magicLinkSent: true };
  } catch (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }
}

export async function runSignInWithOAuth(input: {
  provider: OAuthProvider;
  role: Role;
  locale: Locale;
}): Promise<OAuthResult> {
  const parsed = z
    .object({
      provider: providerSchema,
      role: roleSchema,
      locale: localeSchema,
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: parsed.data.provider,
      options: {
        redirectTo: buildCallbackUrl(parsed.data.role, parsed.data.locale),
      },
    });
    if (error || !data?.url) {
      return { ok: false, error: error?.message ?? "oauth_failed" };
    }
    return { ok: true, url: data.url };
  } catch (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }
}
