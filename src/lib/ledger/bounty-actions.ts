"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const verticalSchema = z.enum([
  "casino",
  "sports",
  "trading",
  "crypto",
  "poker",
  "other",
]);
const modelSchema = z.enum(["cpa", "revshare", "hybrid"]);
const statusSchema = z.enum(["draft", "active", "paused", "ended"]);

const trackingUrlSchema = z.preprocess(
  (v) => (v == null || String(v).trim() === "" ? null : String(v).trim()),
  z.union([z.string().url("invalid_tracking_url"), z.null()]),
);

const schema = z
  .object({
    title: z.string().min(1, "title").max(200),
    description: z.string().max(2000).optional().nullable(),
    vertical: verticalSchema,
    payout_model: modelSchema,
    cpa_amount_cents: z.coerce.number().int().min(0).max(1_000_000_000).optional().nullable(),
    revshare_pct: z.coerce
      .number()
      .min(0)
      .max(100)
      .optional()
      .nullable(),
    currency: z
      .string()
      .length(3, "currency")
      .transform((c) => c.toUpperCase()),
    status: statusSchema,
    tracking_url: trackingUrlSchema,
  })
  .superRefine((data, ctx) => {
    if (data.payout_model === "cpa" || data.payout_model === "hybrid") {
      if (data.cpa_amount_cents == null) {
        ctx.addIssue({
          code: "custom",
          path: ["cpa_amount_cents"],
          message: "required_for_cpa",
        });
      }
    }
    if (data.payout_model === "revshare" || data.payout_model === "hybrid") {
      if (data.revshare_pct == null) {
        ctx.addIssue({
          code: "custom",
          path: ["revshare_pct"],
          message: "required_for_revshare",
        });
      }
    }
  });

export type CreateBountyResult =
  | { ok: true; id: string }
  | { ok: false; error: string; field?: string };

export async function createBounty(
  _prev: CreateBountyResult | undefined,
  formData: FormData,
): Promise<CreateBountyResult> {
  const locale = String(formData.get("locale") || "en");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "operator") {
    return { ok: false, error: "forbidden" };
  }

  const { data: op } = await supabase
    .from("operators")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!op) {
    return { ok: false, error: "no_operator_row" };
  }

  const cpaIn = formData.get("cpa_amount_cents");
  const revIn = formData.get("revshare_pct");
  const raw = {
    title: formData.get("title"),
    description: (formData.get("description") as string | null) || null,
    vertical: formData.get("vertical"),
    payout_model: formData.get("payout_model"),
    cpa_amount_cents:
      cpaIn == null || String(cpaIn).trim() === "" ? null : String(cpaIn),
    revshare_pct:
      revIn == null || String(revIn).trim() === "" ? null : String(revIn),
    currency: formData.get("currency") || "EUR",
    status: formData.get("status") || "draft",
    tracking_url: (formData.get("tracking_url") as string) ?? "",
  };

  const parsed = schema.safeParse({
    title: raw.title,
    description: raw.description,
    vertical: raw.vertical,
    payout_model: raw.payout_model,
    cpa_amount_cents: raw.cpa_amount_cents,
    revshare_pct: raw.revshare_pct,
    currency: raw.currency,
    status: raw.status,
    tracking_url: raw.tracking_url,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (first?.message === "invalid_tracking_url") {
      return { ok: false, error: "invalid_tracking_url" };
    }
    return { ok: false, error: first?.message ?? "validation" };
  }

  const p = parsed.data;
  const { data: ins, error } = await supabase
    .from("bounties")
    .insert({
      operator_id: user.id,
      title: p.title,
      description: p.description ?? null,
      vertical: p.vertical,
      payout_model: p.payout_model,
      cpa_amount_cents:
        p.payout_model === "revshare" ? null : (p.cpa_amount_cents ?? null),
      revshare_pct: p.payout_model === "cpa" ? null : (p.revshare_pct ?? null),
      currency: p.currency,
      status: p.status,
      tracking_url: p.tracking_url,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/${locale}/ledger/bounties`);
  return { ok: true, id: ins.id };
}
