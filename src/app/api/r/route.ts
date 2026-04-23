import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";
import { computeVisitorHash, detectDevice } from "@/lib/tracking/visitor-hash";

/**
 * Tracked redirect: /api/r?bc=<billboard_campaign_id>
 * Logs a row in public.clicks (service role) and sends the visitor to the operator.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bc = searchParams.get("bc");
  if (!bc) {
    return NextResponse.redirect(fallback(), 302);
  }

  const ua = request.headers.get("user-agent");
  const fwd = request.headers.get("x-forwarded-for") || "";
  const ip = (fwd.split(",")[0] || "0.0.0.0").trim();
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    null;
  const ref = request.headers.get("referer");
  const source = ref
    ? (() => {
        try {
          return new URL(ref).host;
        } catch {
          return null;
        }
      })()
    : null;

  let sb;
  try {
    sb = createServiceClient();
  } catch {
    return NextResponse.redirect(fallback(), 302);
  }

  const { data: row, error } = await sb
    .from("billboard_campaigns")
    .select("id, creator_id, bounty_id, visible")
    .eq("id", bc)
    .maybeSingle();

  if (error || !row || !row.visible) {
    return NextResponse.redirect(fallback(), 302);
  }

  const { data: cr } = await sb
    .from("creators")
    .select("billboard_published")
    .eq("id", row.creator_id)
    .single();

  if (!cr?.billboard_published) {
    return NextResponse.redirect(fallback(), 302);
  }

  const { data: bounty } = await sb
    .from("bounties")
    .select("id, status, tracking_url")
    .eq("id", row.bounty_id)
    .maybeSingle();

  if (!bounty || bounty.status !== "active") {
    return NextResponse.redirect(fallback(), 302);
  }

  const dest =
    bounty.tracking_url && bounty.tracking_url.startsWith("http")
      ? bounty.tracking_url
      : fallback().toString();

  const vh = computeVisitorHash({ ip, userAgent: ua || "unknown" });

  await sb.from("clicks").insert({
    creator_id: row.creator_id,
    bounty_id: row.bounty_id,
    billboard_campaign_id: row.id,
    visitor_hash: vh,
    country_code: country,
    device: detectDevice(ua),
    source: source,
    landing_url: dest,
  });

  return NextResponse.redirect(dest, 302);
}

function fallback() {
  return new URL("/en", getAppUrl());
}
