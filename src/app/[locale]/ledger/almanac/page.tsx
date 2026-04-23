import { getTranslations, setRequestLocale } from "next-intl/server";
import { LedgerPlaceholder } from "@/components/ledger/ledger-placeholder";

export default async function AlmanacPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Ledger");
  return (
    <LedgerPlaceholder
      overline={t("sectionStubOverline")}
      title={t("stubs.almanacTitle")}
      body={t("stubs.almanacBody")}
    />
  );
}
