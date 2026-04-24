"use client";

import { useEffect, useRef, useState } from "react";
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
  const sections = getSections(role, t);
  const guild = sections[0].items;
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
        {sections.map((section) => (
          <NavGroup
            key={section.label}
            label={section.label}
            items={section.items}
            pathname={pathname}
            t={t}
          />
        ))}
      </nav>
    </>
  );
}

export function LedgerMobileMenu({
  role,
}: {
  role: "creator" | "operator" | "admin";
}) {
  const pathname = usePathname();
  const t = useTranslations("LedgerShell");
  const sections = getSections(role, t);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current) return;
      const target = event.target as Node | null;
      if (target && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("pointerdown", onPointerDown);
    }
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="md:hidden relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open ledger menu"
        onClick={() => setOpen((v) => !v)}
        className="px-2.5 py-1.5 border border-rule text-ink-dim hover:text-oxblood hover:border-oxblood transition-colors"
      >
        <span className="sr-only">Open ledger menu</span>
        <span className="block w-4 h-[1px] bg-current mb-1" />
        <span className="block w-4 h-[1px] bg-current mb-1" />
        <span className="block w-4 h-[1px] bg-current" />
      </button>
      <div
        className={`absolute right-0 mt-2 z-30 w-[260px] border border-rule bg-paper shadow-sm p-3 ${open ? "block" : "hidden"}`}
      >
        {sections.map((group) => (
          <div key={`m-${group.label}`} className="mb-3 last:mb-0">
            <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-faint mb-1.5">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={`dd-${item.href}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 text-sm transition-colors ${
                      active ? "text-oxblood bg-oxblood/[0.06]" : "text-ink-dim hover:text-oxblood"
                    }`}
                  >
                    <span>{t(item.labelKey)}</span>
                    {item.badge && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-oxblood text-paper">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSections(
  role: "creator" | "operator" | "admin",
  t: (k: string) => string,
) {
  const guild = role === "operator" ? GUILD.filter((i) => i.href !== "/ledger/billboard") : GUILD;
  return [
    { label: t("groupGuild"), items: guild },
    { label: t("groupCommunity"), items: COMMUNITY },
    { label: t("groupMoney"), items: MONEY },
    { label: t("groupReference"), items: REF },
  ];
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
