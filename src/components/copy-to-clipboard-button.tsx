"use client";

import { useState } from "react";

export function CopyToClipboardButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
      className="font-mono text-[9px] tracking-widest uppercase border border-rule text-ink-dim px-2 py-1 hover:border-oxblood hover:text-oxblood shrink-0"
    >
      {done ? copiedLabel : label}
    </button>
  );
}
