"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type NavItem = { href: string; labelKey: string; badge?: string };

const GUILD: NavItem[] = [
  { href: "/ledger", labelKey: "navLedger" },
  { href: "/ledger/billboard", labelKey: "navBillboard" },
  { href: "/ledger/map-room", labelKey: "navMapRoom" },
  { href: "/ledger/bounties", labelKey: "navBounties", badge: "3" },
  { href: "/ledger/arsenal", labelKey: "navArsenal" },
];

const COMMUNITY: NavItem[] = [
  { href: "/ledger/posse", labelKey: "navPosse" },
  { href: "/ledger/almanac", labelKey: "navAlmanac" },
  { href: "/ledger/wires", labelKey: "navWires", badge: "2" },
];

const MONEY: NavItem[] = [
  { href: "/ledger/payday", labelKey: "navPayday" },
  { href: "/ledger/settlement", labelKey: "navSettlement" },
];

const REF: NavItem[] = [
  { href: "/code", labelKey: "navCode" },
  { href: "/standards-index", labelKey: "navStandards" },
];

function isActive(pathname: string, href: string) {
  if (href === "/ledger") return pathname === "/ledger" || pathname === "";
  return pathname === href || pathname.startsWith(href + "/");
}

export function LedgerNav({ role }: { role: "creator" | "operator" | "admin" }) {
  const pathname = usePathname();
  const t = useTranslations("LedgerShell");
  const guild = role === "operator" ? GUILD.filter((i) => i.href !== "/ledger/billboard") : GUILD;
  const mobileItems = [...guild, ...COMMUNITY, ...MONEY];

  return (
    <>
      <div className="md:hidden px-4 py-3 border-b border-rule bg-paper/70">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mobileItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={`m-${item.href}`}
                href={item.href}
                className={`shrink-0 px-3 py-1.5 border text-xs font-mono uppercase tracking-wide transition-colors ${
                  active
                    ? "border-oxblood text-oxblood bg-oxblood/[0.06]"
                    : "border-rule text-ink-dim hover:text-oxblood hover:border-oxblood"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      </div>

      <nav className="sidebar-nav hidden md:block">
        <NavGroup label={t("groupGuild")} items={guild} pathname={pathname} t={t} />
        <NavGroup label={t("groupCommunity")} items={COMMUNITY} pathname={pathname} t={t} />
        <NavGroup label={t("groupMoney")} items={MONEY} pathname={pathname} t={t} />
        <NavGroup label={t("groupReference")} items={REF} pathname={pathname} t={t} />
      </nav>
    </>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  t,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  t: (k: string) => string;
}) {
  return (
    <div className="mb-6">
      <div className="px-6 font-mono text-[9px] tracking-[0.28em] uppercase text-ink-faint mb-1.5">
        {label}
      </div>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3.5 px-6 py-2.5 font-display text-[15px] relative transition-all duration-300 ${
              active
                ? "text-oxblood font-medium bg-oxblood/[0.06]"
                : "text-ink-dim hover:text-ink hover:bg-ink/[0.04]"
            }`}
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            {active && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-oxblood" />
            )}
            <span className="w-4 text-center text-ink-faint not-italic text-sm" aria-hidden>
              ·
            </span>
            <span className="flex-1">{t(item.labelKey)}</span>
            {item.badge && (
              <span className="font-mono text-[9px] tracking-wider px-1.5 py-0.5 bg-oxblood text-paper">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
