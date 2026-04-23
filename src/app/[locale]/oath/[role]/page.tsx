import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { OathForm } from "@/components/oath-form";
import { AuthPanel } from "@/components/auth-panel";
import { getCurrentProfile } from "@/lib/auth/session";

const VALID_ROLES = ["creator", "operator"] as const;
type Role = (typeof VALID_ROLES)[number];

export default async function OathRolePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; role: string }>;
  searchParams: Promise<{ authError?: string }>;
}) {
  const { locale, role } = await params;
  const { authError } = await searchParams;

  if (!VALID_ROLES.includes(role as Role)) {
    notFound();
  }

  setRequestLocale(locale);

  // Load articles directly from the message file (arrays cannot be read with t()).
  const messages = (await import(`../../../../../messages/${locale}.json`))
    .default;
  const articles =
    role === "creator"
      ? messages.Code.creatorArticles
      : messages.Code.operatorArticles;

  const session = await getCurrentProfile();

  // Not signed in → show the auth panel (step 0 of the Oath).
  if (!session) {
    return (
      <div className="min-h-screen">
        <AuthPanel
          role={role as Role}
          locale={locale as "en" | "es"}
          authError={authError}
        />
      </div>
    );
  }

  // Already completed the oath → send them straight to the Ledger.
  if (session.profile?.onboarded_at) {
    redirect(`/${locale}/ledger`);
  }

  // Authenticated but hasn't sealed yet → show the profile + code form.
  const initialHandle =
    (session.user.user_metadata?.preferred_username as string | undefined) ??
    (session.user.user_metadata?.user_name as string | undefined) ??
    session.profile?.handle ??
    undefined;

  return (
    <div className="min-h-screen">
      <OathForm
        role={role as Role}
        articles={articles}
        userEmail={session.user.email ?? ""}
        initialHandle={initialHandle}
      />
    </div>
  );
}
