/**
 * Placeholder series until we wire the Ledger to `clicks` + `conversions`.
 * Deterministic so the chart doesn’t jump on every refresh.
 */
export function getMockSeries(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const out: number[] = [];
  for (let d = 0; d < 7; d++) {
    h = (h * 1103515245 + 12345) | 0;
    out.push(80 + (Math.abs(h) % 120));
  }
  return out;
}

export function getMockOverview(seed: string) {
  const series = getMockSeries(seed);
  const totalClicks = series.reduce((a, b) => a + b, 0);
  return {
    clicks7d: totalClicks,
    conversions7d: Math.max(1, Math.floor(totalClicks * 0.08)),
    estCommissionEur: Math.round((totalClicks * 0.12 + 8) * 10) / 10,
    series,
  };
}
