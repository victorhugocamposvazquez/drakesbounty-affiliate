import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const bodySchema = z.object({
  operator_id: z.string().uuid(),
  bounty_id: z.string().uuid(),
  creator_id: z.string().uuid(),
  event_type: z.enum([
    "registration",
    "deposit",
    "ftd",
    "custom",
  ]),
  amount_cents: z.number().int().nullable().optional(),
  commission_cents: z.number().int().nullable().optional(),
  currency: z.string().min(1).default("EUR"),
  external_id: z.string().min(1).max(500),
  occurred_at: z.string(),
  click_id: z.string().uuid().optional().nullable(),
});

/**
 * Operator → Drake's Bounty server-to-server event.
 * Auth: `Authorization: Bearer <POSTBACK_SECRET>` (set in your env).
 * Idempotency: unique on (operator_id, external_id) — replays return 200 with duplicate:true.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.POSTBACK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "postback_unconfigured" },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.message },
      { status: 400 },
    );
  }
  const p = parsed.data;
  const occurred = new Date(p.occurred_at);
  if (Number.isNaN(occurred.getTime())) {
    return NextResponse.json({ error: "invalid_occurred_at" }, { status: 400 });
  }

  let sb: ReturnType<typeof createServiceClient>;
  try {
    sb = createServiceClient();
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }

  const { data: existing, error: exq } = await sb
    .from("conversions")
    .select("id")
    .eq("operator_id", p.operator_id)
    .eq("external_id", p.external_id)
    .maybeSingle();

  if (exq) {
    return NextResponse.json(
      { error: exq.message },
      { status: 500 },
    );
  }
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, id: existing.id });
  }

  const { data: inserted, error: ins } = await sb
    .from("conversions")
    .insert({
      click_id: p.click_id ?? null,
      creator_id: p.creator_id,
      bounty_id: p.bounty_id,
      operator_id: p.operator_id,
      event_type: p.event_type,
      amount_cents: p.amount_cents ?? null,
      commission_cents: p.commission_cents ?? null,
      currency: p.currency,
      external_id: p.external_id,
      occurred_at: occurred.toISOString(),
    })
    .select("id")
    .single();

  if (ins) {
    if (String(ins.code) === "23505" || ins.message?.includes("duplicate")) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: ins.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
