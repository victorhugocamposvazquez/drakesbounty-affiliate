import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { LedgerShell } from "@/components/ledger/ledger-shell";

export default async function LedgerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getCurrentProfile();
  if (!session) {
    redirect(`/${locale}`);
  }
  if (!session.profile?.onboarded_at) {
    const r = session.profile?.role ?? "creator";
    redirect(`/${locale}/oath/${r}`);
  }

  const { profile, user } = session;
  const role = profile.role;

  const t = await getTranslations("LedgerShell");
  const displayName =
    profile.display_name || profile.handle || user.email || t("memberFallback");

  let rankLabel: string;
  if (role === "operator" || role === "admin") {
    rankLabel = t(`ranks.${role === "admin" ? "admin" : "operator"}`);
  } else {
    const supabase = await createClient();
    const { data: cr } = await supabase
      .from("creators")
      .select("tier")
      .eq("id", user.id)
      .maybeSingle<{ tier: string }>();
    const tier = cr?.tier ?? "deputy";
    rankLabel = t(`ranks.creator_${tier}` as "ranks.creator_deputy");
  }

  const handleLine = profile.handle
    ? `@${profile.handle}`
    : user.email ?? t("memberFallback");

  return (
    <LedgerShell
      displayName={displayName}
      handleLine={handleLine}
      rankLabel={rankLabel}
      role={role}
    >
      {children}
    </LedgerShell>
  );
}
