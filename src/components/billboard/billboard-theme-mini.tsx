"use client";

import { BrandMark } from "@/components/brand-mark";
import type { BillboardTheme } from "@/lib/billboard-theme";

/**
 * Strips ~160px height per theme: header + sample hero + sliver of card.
 * For editor “3 ventanitas” — same visual language as the public Billboard, not color swatches.
 */
export function BillboardThemeMini({
  theme,
  displayName,
  handle,
  heroTitle,
  heroSub,
  avatarUrl,
  sampleBountyLine,
  ctaLabel,
}: {
  theme: BillboardTheme;
  displayName: string;
  handle: string;
  heroTitle: string;
  heroSub: string;
  avatarUrl: string | null;
  sampleBountyLine: string;
  ctaLabel: string;
}) {
  const title = heroTitle || "…";
  const sub = heroSub || "…";
  const mark = (sz: number) => (
    <BrandMark
      size={sz}
      className={
        theme === "minimal"
          ? "text-cyan-400/90 shrink-0"
          : theme === "broadsheet"
            ? "text-stone-800 shrink-0"
            : "text-[#00ffff] shrink-0"
      }
    />
  );
  const av = (sz: number) =>
    avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={sz}
        height={sz}
        className={`shrink-0 rounded-full object-cover border ${
          theme === "minimal"
            ? "border-slate-500"
            : theme === "broadsheet"
              ? "border-stone-800"
              : "border-cyan-400/50"
        }`}
      />
    ) : (
      mark(sz)
    );

  if (theme === "minimal") {
    return (
      <div className="h-[168px] w-full flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 font-sans text-left overflow-hidden rounded-b">
        <header className="flex items-center gap-2 border-b border-slate-700/80 px-2 py-1.5 bg-slate-950/80 shrink-0">
          {av(22)}
          <div className="min-w-0">
            <p className="text-[9px] font-semibold truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[6px] font-mono text-slate-500">@{handle}</p>
          </div>
        </header>
        <div className="px-2 py-2 flex-1 min-h-0 flex flex-col">
          <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">
            {title}
          </p>
          <p className="text-[8px] text-slate-400 line-clamp-2 mt-0.5">{sub}</p>
          <div className="mt-auto pt-1.5 border-t border-slate-700/50">
            <p className="text-[7px] font-mono text-emerald-500/80 uppercase tracking-wide mb-0.5">
              {sampleBountyLine}
            </p>
            <div className="h-1.5 w-12 bg-emerald-500/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (theme === "broadsheet") {
    return (
      <div className="h-[168px] w-full flex flex-col bg-[#ebe4d8] text-stone-900 font-serif text-left overflow-hidden rounded-b">
        <header className="border-b-2 border-stone-900 px-2 py-1.5 flex items-center gap-2 shrink-0">
          {av(22)}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-tight truncate">
              {displayName}
            </p>
            <p className="text-[6px] font-mono text-stone-600">@{handle}</p>
          </div>
        </header>
        <div className="px-2 py-2 flex-1 min-h-0 flex flex-col">
          <h2 className="text-[12px] font-black leading-tight line-clamp-2 border-b border-stone-400 pb-0.5">
            {title}
          </h2>
          <p className="text-[8px] text-stone-700 line-clamp-2 mt-0.5">{sub}</p>
          <p className="text-[7px] font-mono text-stone-600 mt-auto pt-1.5 line-clamp-1">
            {sampleBountyLine} · {ctaLabel}
          </p>
        </div>
      </div>
    );
  }

  // retrowave
  return (
    <div
      className="h-[168px] w-full flex flex-col font-sans text-left overflow-hidden rounded-b"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(255,0,110,0.2) 0%, transparent 45%),
          linear-gradient(180deg, #0c051a 0%, #15082a 55%, #06010f 100%)`,
      }}
    >
      <header className="border-b border-[#ff006e]/30 px-2 py-1.5 flex items-center gap-2 bg-[#0c051a]/50 shrink-0">
        {av(22)}
        <div className="min-w-0">
          <p
            className="[font-family:var(--font-crt)] text-[10px] text-[#ffbe0b] truncate leading-tight"
          >
            {displayName}
          </p>
          <p className="text-[6px] font-mono text-[#b8a5d6]">@{handle}</p>
        </div>
      </header>
      <div className="px-2 py-2 flex-1 min-h-0 flex flex-col">
        <h2
          className="[font-family:var(--font-crt)] text-[12px] text-[#00ffff] leading-tight line-clamp-2"
        >
          {title}
        </h2>
        <p className="text-[8px] text-[#d8c4f0]/90 line-clamp-2 mt-0.5">
          {sub}
        </p>
        <div className="mt-auto pt-1.5">
          <div className="border border-[#00ffff]/30 bg-[#15082a]/80 px-1.5 py-1 text-[7px] text-[#ffbe0b] line-clamp-1">
            {sampleBountyLine} <span className="text-[#ff006e]">▸</span>{" "}
            {ctaLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
