import type { SupabaseClient } from "@supabase/supabase-js";

const MS_DAY = 86_400_000;

/**
 * Returns UTC midnight for "today" minus `daysAgo` (0 = today).
 */
function utcDayStart(daysAgo: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

/**
 * 7 elements: [oldest day … today] in the last 7 calendar days (UTC).
 */
function bucketDayIndex(trackedAt: string, windowStart: Date): number | null {
  const t = new Date(trackedAt).getTime();
  if (t < windowStart.getTime()) return null;
  const dayStart = new Date(t);
  dayStart.setUTCHours(0, 0, 0, 0);
  const idx = Math.round((dayStart.getTime() - windowStart.getTime()) / MS_DAY);
  if (idx < 0 || idx > 6) return null;
  return idx;
}

export async function getCreatorClickSeries(
  supabase: SupabaseClient,
  creatorId: string,
): Promise<{
  series: number[];
  total7d: number;
  byCountry: { code: string; count: number }[];
}> {
  const windowStart = utcDayStart(6);
  const { data, error } = await supabase
    .from("clicks")
    .select("tracked_at, country_code")
    .eq("creator_id", creatorId)
    .gte("tracked_at", windowStart.toISOString());

  if (error || !data) {
    return { series: [0, 0, 0, 0, 0, 0, 0], total7d: 0, byCountry: [] };
  }

  const series = [0, 0, 0, 0, 0, 0, 0];
  const countryMap = new Map<string, number>();

  for (const row of data) {
    const idx = bucketDayIndex(row.tracked_at, windowStart);
    if (idx != null) series[idx]++;
    const cc = row.country_code;
    if (cc && String(cc).length === 2) {
      const u = String(cc).toUpperCase();
      countryMap.set(u, (countryMap.get(u) ?? 0) + 1);
    }
  }

  const total7d = series.reduce((a, b) => a + b, 0);
  const byCountry = [...countryMap.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { series, total7d, byCountry };
}

export async function getCreatorConversions7d(
  supabase: SupabaseClient,
  creatorId: string,
): Promise<{
  count: number;
  commissionCents: number;
  currency: string;
}> {
  const since = utcDayStart(6);
  const { data, error } = await supabase
    .from("conversions")
    .select("commission_cents, currency")
    .eq("creator_id", creatorId)
    .gte("occurred_at", since.toISOString());

  if (error || !data) {
    return { count: 0, commissionCents: 0, currency: "EUR" };
  }

  let commissionCents = 0;
  const cur = new Set<string>();
  for (const r of data) {
    if (r.commission_cents != null) commissionCents += r.commission_cents;
    if (r.currency) cur.add(r.currency);
  }
  return {
    count: data.length,
    commissionCents,
    currency: cur.size === 1 ? [...cur][0]! : "EUR",
  };
}

export async function getRecentConversions(
  supabase: SupabaseClient,
  creatorId: string,
  limit: number,
): Promise<
  {
    id: string;
    event_type: string;
    commission_cents: number | null;
    currency: string;
    occurred_at: string;
  }[]
> {
  const { data, error } = await supabase
    .from("conversions")
    .select("id, event_type, commission_cents, currency, occurred_at")
    .eq("creator_id", creatorId)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function getOperatorSummary(
  supabase: SupabaseClient,
  operatorId: string,
): Promise<{
  activeBounties: number;
  conv7d: number;
  postback7dCents: number;
  volumeCents7d: number;
  currency: string;
}> {
  const since = utcDayStart(6);

  const { count: active } = await supabase
    .from("bounties")
    .select("*", { count: "exact", head: true })
    .eq("operator_id", operatorId)
    .eq("status", "active");

  const { data: convs } = await supabase
    .from("conversions")
    .select("commission_cents, amount_cents, currency")
    .eq("operator_id", operatorId)
    .gte("occurred_at", since.toISOString());

  if (!convs) {
    return {
      activeBounties: active ?? 0,
      conv7d: 0,
      postback7dCents: 0,
      volumeCents7d: 0,
      currency: "EUR",
    };
  }

  let commissionCents = 0;
  let volumeCents = 0;
  const cur = new Set<string>();
  for (const c of convs) {
    if (c.commission_cents != null) commissionCents += c.commission_cents;
    if (c.amount_cents != null) volumeCents += c.amount_cents;
    if (c.currency) cur.add(c.currency);
  }

  return {
    activeBounties: active ?? 0,
    conv7d: convs.length,
    postback7dCents: commissionCents,
    volumeCents7d: volumeCents,
    currency: cur.size === 1 ? [...cur][0]! : "EUR",
  };
}

export async function getCreatorCommission30d(
  supabase: SupabaseClient,
  creatorId: string,
): Promise<{ commissionCents: number; count: number; currency: string }> {
  const since = utcDayStart(29);
  const { data, error } = await supabase
    .from("conversions")
    .select("commission_cents, currency")
    .eq("creator_id", creatorId)
    .gte("occurred_at", since.toISOString());

  if (error || !data) {
    return { commissionCents: 0, count: 0, currency: "EUR" };
  }
  let commissionCents = 0;
  const cur = new Set<string>();
  for (const r of data) {
    if (r.commission_cents != null) commissionCents += r.commission_cents;
    if (r.currency) cur.add(r.currency);
  }
  return {
    commissionCents,
    count: data.length,
    currency: cur.size === 1 ? [...cur][0]! : "EUR",
  };
}
