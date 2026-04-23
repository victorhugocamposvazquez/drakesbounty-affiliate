import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** Profile row shape used across the app. Mirrors public.profiles. */
export type Profile = {
  id: string;
  role: "creator" | "operator" | "admin";
  handle: string | null;
  display_name: string | null;
  country: string | null;
  locale: string;
  avatar_url: string | null;
  onboarded_at: string | null;
};

/**
 * Returns the currently authenticated Supabase user, or null.
 * Always validates the token against Supabase (never trust a cookie blindly).
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Returns the profile row for the current user (or null if not signed in).
 * Uses RLS → the query will only return the row for `auth.uid()`.
 */
export async function getCurrentProfile(): Promise<{
  user: User;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, handle, display_name, country, locale, avatar_url, onboarded_at",
    )
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { user, profile: profile ?? null };
}
