"use server";

import { z } from "zod";
import {
  getArsenalRateLimitConfig,
  getArsenalUsageInWindow,
  recordArsenalGeneration,
} from "@/lib/arsenal/arsenal-rate-limit";
import {
  type ArsenalCopyKind,
  generateArsenalCopyLines,
  getArsenalOpenAIKey,
} from "@/lib/arsenal/openai-generate";
import { createClient } from "@/lib/supabase/server";

const kindSchema = z.enum([
  "panel",
  "stream",
  "bio",
  "compliance",
  "hook",
]);

const inputSchema = z.object({
  locale: z.enum(["en", "es"]),
  kind: kindSchema,
  notes: z.preprocess(
    (v) => (v == null || v === "" ? "" : String(v)),
    z.string().max(800),
  ),
});

export type ArsenalGenerateState =
  | { ok: true; variants: string[] }
  | {
      ok: false;
      code: "unauthorized" | "no_key" | "http" | "empty" | "parse" | "rate_limit";
      max?: number;
      windowMinutes?: number;
      used?: number;
    }
  | null;

export async function generateArsenalCopyAction(
  _prev: ArsenalGenerateState,
  formData: FormData,
): Promise<ArsenalGenerateState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, code: "unauthorized" };
  }

  if (!getArsenalOpenAIKey()) {
    return { ok: false, code: "no_key" };
  }

  const { max, windowMinutes } = getArsenalRateLimitConfig();
  const { count: used, error: rateErr } = await getArsenalUsageInWindow(
    user.id,
  );
  if (rateErr) {
    return { ok: false, code: "http" };
  }
  if (used >= max) {
    return {
      ok: false,
      code: "rate_limit",
      max,
      windowMinutes,
      used,
    };
  }

  const raw = {
    locale: formData.get("locale"),
    kind: formData.get("kind"),
    notes: formData.get("notes"),
  };
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "parse" };
  }

  const { locale, kind, notes } = parsed.data;
  const res = await generateArsenalCopyLines({
    locale,
    kind: kind as ArsenalCopyKind,
    notes,
  });

  if (!res.ok) {
    if (res.error === "no_key") return { ok: false, code: "no_key" };
    if (res.error === "http") return { ok: false, code: "http" };
    if (res.error === "empty") return { ok: false, code: "empty" };
    return { ok: false, code: "parse" };
  }

  const { error: logErr } = await recordArsenalGeneration(user.id);
  if (logErr) {
    console.error("[arsenal] rate log insert failed:", logErr);
  }

  return { ok: true, variants: res.variants };
}
