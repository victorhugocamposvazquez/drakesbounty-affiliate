import { NextResponse } from "next/server";

/**
 * Liveness for Vercel / probes. No DB call (edge-friendly, no secrets).
 */
export function GET() {
  return NextResponse.json(
    { ok: true, service: "drakes-affiliate", ts: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
