export const BILLBOARD_THEMES = ["retrowave", "minimal", "broadsheet"] as const;
export type BillboardTheme = (typeof BILLBOARD_THEMES)[number];

const LEGACY: Record<string, BillboardTheme> = {
  drake: "retrowave",
  default: "retrowave",
};

/**
 * Map DB + legacy `drake` to the three supported themes.
 */
export function normalizeBillboardTheme(
  raw: string | null | undefined,
): BillboardTheme {
  if (!raw || String(raw).trim() === "") return "retrowave";
  if (raw in LEGACY) return LEGACY[raw]!;
  if (BILLBOARD_THEMES.includes(raw as BillboardTheme)) {
    return raw as BillboardTheme;
  }
  return "retrowave";
}

export function isBillboardTheme(s: string): s is BillboardTheme {
  return BILLBOARD_THEMES.includes(s as BillboardTheme);
}
