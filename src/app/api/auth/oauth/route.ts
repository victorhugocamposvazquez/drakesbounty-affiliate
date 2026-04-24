import { NextResponse } from "next/server";
import { runSignInWithOAuth } from "@/lib/auth/credentials";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" } as const,
      { status: 400 },
    );
  }
  const result = await runSignInWithOAuth(
    body as {
      provider: "google" | "twitch" | "discord";
      role: "creator" | "operator";
      locale: "en" | "es";
    },
  );
  return NextResponse.json(result);
}
