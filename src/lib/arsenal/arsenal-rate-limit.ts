import { createServiceClient } from "@/lib/supabase/service";

export function getArsenalRateLimitConfig(): {
  max: number;
  windowMinutes: number;
} {
  const max = Number.parseInt(process.env.ARSENAL_AI_RATE_MAX ?? "8", 10);
  const windowMinutes = Number.parseInt(
    process.env.ARSENAL_AI_RATE_WINDOW_MINUTES ?? "60",
    10,
  );
  return {
    max: Number.isFinite(max) && max > 0 ? max : 8,
    windowMinutes:
      Number.isFinite(windowMinutes) && windowMinutes > 0 ? windowMinutes : 60,
  };
}

/**
 * Counts successful Arsenal generations in the rolling window. Uses service role.
 */
export async function getArsenalUsageInWindow(
  userId: string,
): Promise<{ count: number; error: string | null }> {
  const { windowMinutes } = getArsenalRateLimitConfig();
  const since = new Date(
    Date.now() - windowMinutes * 60_000,
  ).toISOString();

  const sb = createServiceClient();
  const { count, error } = await sb
    .from("arsenal_ai_rate_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  if (error) {
    return { count: 0, error: error.message };
  }
  return { count: count ?? 0, error: null };
}

export async function recordArsenalGeneration(
  userId: string,
): Promise<{ error: string | null }> {
  const sb = createServiceClient();
  const { error } = await sb.from("arsenal_ai_rate_log").insert({ user_id: userId });
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
