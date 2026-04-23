"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";

type Role = "creator" | "operator";
type Locale = "en" | "es";
export type OAuthProvider = "google" | "twitch" | "discord";

export type AuthResult =
  | { ok: true; needsEmailConfirm?: boolean; magicLinkSent?: boolean }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(72);
const roleSchema = z.enum(["creator", "operator"]);
const localeSchema = z.enum(["en", "es"]);
const providerSchema = z.enum(["google", "twitch", "discord"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildCallbackUrl(role: Role, locale: Locale, next?: string): string {
  const params = new URLSearchParams({
    role,
    locale,
    next: next ?? `/${locale}/oath/${role}`,
  });
  return `${getAppUrl()}/auth/callback?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Email + password sign-up
// ---------------------------------------------------------------------------
export async function signUpWithPassword(input: {
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
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Stored in auth.users.raw_user_meta_data; our SQL trigger reads it.
      data: {
        role: parsed.data.role,
        locale: parsed.data.locale,
      },
      emailRedirectTo: buildCallbackUrl(parsed.data.role, parsed.data.locale),
    },
  });

  if (error) {
    // Most common: "User already registered" — surface it verbatim to the UI
    // so the form can fall back to sign-in.
    return { ok: false, error: error.message };
  }

  // If email confirmation is ON in Supabase, `session` is null until the
  // user clicks the confirmation link. If it's OFF, we're already signed in.
  const needsEmailConfirm = !data.session;
  return { ok: true, needsEmailConfirm };
}

// ---------------------------------------------------------------------------
// Email + password sign-in (for returning members)
// ---------------------------------------------------------------------------
export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_credentials" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Magic link (OTP email)
// ---------------------------------------------------------------------------
export async function signInWithMagicLink(input: {
  email: string;
  role: Role;
  locale: Locale;
}): Promise<AuthResult> {
  const parsed = z
    .object({ email: emailSchema, role: roleSchema, locale: localeSchema })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
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
}

// ---------------------------------------------------------------------------
// OAuth — returns the provider URL; the client redirects to it.
// ---------------------------------------------------------------------------
export async function signInWithOAuth(input: {
  provider: OAuthProvider;
  role: Role;
  locale: Locale;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const parsed = z
    .object({
      provider: providerSchema,
      role: roleSchema,
      locale: localeSchema,
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsed.data.provider,
    options: {
      redirectTo: buildCallbackUrl(parsed.data.role, parsed.data.locale),
      // OAuth user_metadata cannot be pre-set the same way as email signup —
      // we'll assign the role in completeOath once the user returns.
    },
  });
  if (error || !data?.url) {
    return { ok: false, error: error?.message ?? "oauth_failed" };
  }
  return { ok: true, url: data.url };
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------
export async function signOut(redirectTo: string = "/") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectTo);
}

// ---------------------------------------------------------------------------
// Complete the Oath — update profile + insert creator/operator + sign the Code
// ---------------------------------------------------------------------------
const completeOathCreatorSchema = z.object({
  role: z.literal("creator"),
  locale: localeSchema,
  handle: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "handle_invalid"),
  displayName: z.string().max(80).optional().default(""),
  country: z.string().length(2),
  vertical: z.enum(["casino", "sports", "trading", "crypto", "poker", "other"]),
  channel: z.enum([
    "twitch",
    "kick",
    "telegram",
    "x",
    "youtube",
    "instagram",
    "discord",
    "other",
  ]),
  audience: z.coerce.number().int().nonnegative().optional(),
  website: z.string().url().optional().or(z.literal("")),
  articlesAccepted: z.array(z.string()).min(1),
});

const completeOathOperatorSchema = z.object({
  role: z.literal("operator"),
  locale: localeSchema,
  legalName: z.string().min(2).max(120),
  country: z.string().length(2),
  vertical: z.enum(["casino", "sports", "trading", "crypto", "poker", "other"]),
  markets: z.string().max(200).optional().default(""),
  website: z.string().url().optional().or(z.literal("")),
  articlesAccepted: z.array(z.string()).min(1),
});

const completeOathSchema = z.discriminatedUnion("role", [
  completeOathCreatorSchema,
  completeOathOperatorSchema,
]);

export type CompleteOathInput = z.input<typeof completeOathSchema>;

export type CompleteOathResult =
  | { ok: true; memberId: string; role: Role; locale: Locale }
  | { ok: false; error: string };

export async function completeOath(
  input: CompleteOathInput,
): Promise<CompleteOathResult> {
  const parsed = completeOathSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, error: "not_authenticated" };
  }

  // Pull request metadata for audit.
  const h = await headers();
  const ua = h.get("user-agent") ?? null;
  const fwd = h.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0].trim() || h.get("x-real-ip") || null;

  // 1. Upsert profile row (the trigger may have already inserted a default one).
  const handleValue = data.role === "creator" ? data.handle : null;
  const displayNameValue =
    data.role === "creator" ? (data.displayName || null) : data.legalName;

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      role: data.role,
      handle: handleValue,
      display_name: displayNameValue,
      country: data.country,
      locale: data.locale,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileErr) {
    if (
      profileErr.code === "23505" ||
      profileErr.message.toLowerCase().includes("duplicate")
    ) {
      return { ok: false, error: "handle_taken" };
    }
    return { ok: false, error: profileErr.message };
  }

  // 2. Insert role-specific row.
  if (data.role === "creator") {
    const { error } = await supabase.from("creators").upsert({
      id: user.id,
      main_channel: data.channel,
      vertical: data.vertical,
      audience_size: data.audience ?? null,
      website_url: data.website || null,
    });
    if (error) return { ok: false, error: error.message };
  } else {
    const marketsArr = data.markets
      ? data.markets
          .split(",")
          .map((m) => m.trim().toUpperCase())
          .filter(Boolean)
      : [];
    const { error } = await supabase.from("operators").upsert({
      id: user.id,
      legal_name: data.legalName,
      vertical: data.vertical,
      markets: marketsArr,
      website_url: data.website || null,
    });
    if (error) return { ok: false, error: error.message };
  }

  // 3. Insert an immutable Code signature.
  const { error: sigErr } = await supabase.from("code_signatures").insert({
    profile_id: user.id,
    role: data.role,
    code_version: "1.0",
    articles_accepted: data.articlesAccepted,
    ip_address: ip,
    user_agent: ua,
  });
  if (sigErr) return { ok: false, error: sigErr.message };

  const memberId = buildMemberId(data.role, user.id);
  return {
    ok: true,
    memberId,
    role: data.role,
    locale: data.locale,
  };
}

/** Public-facing member id, derived from the auth uuid (not reversible in UI). */
function buildMemberId(role: Role, uuid: string): string {
  const prefix = role === "creator" ? "CRT" : "OPR";
  const tail = uuid.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `${prefix}-${tail}`;
}
