"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  locale: z.enum(["en", "es"]),
  headline: z.string().max(200),
  subline: z.string().max(300),
  published: z.boolean(),
});

export type SaveBillboardResult = { ok: true } | { ok: false; error: string };

export async function saveBillboardSettings(
  input: z.infer<typeof schema>,
): Promise<SaveBillboardResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { data: cr } = await supabase
    .from("creators")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!cr) return { ok: false, error: "not_creator" };

  const { error } = await supabase
    .from("creators")
    .update({
      billboard_headline: parsed.data.headline,
      billboard_subline: parsed.data.subline,
      billboard_published: parsed.data.published,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/${parsed.data.locale}/ledger/billboard`);

  const { data: p } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();
  if (p?.handle) {
    revalidatePath(`/${parsed.data.locale}/b/${p.handle}`);
  }

  return { ok: true };
}
