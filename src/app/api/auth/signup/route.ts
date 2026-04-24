import { NextResponse } from "next/server";
import { runSignUpWithPassword } from "@/lib/auth/credentials";

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
  const result = await runSignUpWithPassword(
    body as {
      email: string;
      password: string;
      role: "creator" | "operator";
      locale: "en" | "es";
    },
  );
  return NextResponse.json(result);
}
