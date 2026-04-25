"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  amountCents: z.coerce.number().int().positive(),
  currency: z.string().length(3),
  rail: z.enum(["usdc", "sepa"]),
  destination: z.string().min(6).max(180),
});

export async function requestPayout(input: {
  amountCents: number;
  currency: string;
  rail: "usdc" | "sepa";
  destination: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "unauthorized" };

  // Available = total recorded commission - all non-rejected payouts.
  const [{ data: convs }, { data: payouts }] = await Promise.all([
    supabase
      .from("conversions")
      .select("commission_cents, currency")
      .eq("creator_id", user.id),
    supabase
      .from("payout_requests")
      .select("amount_cents, status")
      .eq("creator_id", user.id),
  ]);

  const totalCommission = (convs ?? []).reduce(
    (sum, row) => sum + (row.commission_cents ?? 0),
    0,
  );
  const reserved = (payouts ?? [])
    .filter((r) => !["rejected", "cancelled"].includes(String(r.status)))
    .reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);
  const available = Math.max(0, totalCommission - reserved);

  if (parsed.data.amountCents > available) {
    return { ok: false, error: "insufficient_available" };
  }

  // Small privacy hint shown in tables; full destination is still stored.
  const cleanDestination = parsed.data.destination.trim();
  const destinationHint =
    cleanDestination.length <= 8
      ? cleanDestination
      : `${cleanDestination.slice(0, 4)}…${cleanDestination.slice(-4)}`;

  const { error } = await supabase.from("payout_requests").insert({
    creator_id: user.id,
    amount_cents: parsed.data.amountCents,
    currency: parsed.data.currency.toUpperCase(),
    rail: parsed.data.rail,
    destination: cleanDestination,
    destination_hint: destinationHint,
    status: "requested",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

