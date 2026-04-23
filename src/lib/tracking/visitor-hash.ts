import { createHash } from "crypto";

/** Daily bucket so the same device isn’t a unique fingerprint. */
export function computeVisitorHash(input: {
  ip: string;
  userAgent: string;
  day?: string; // YYYY-MM-DD in UTC
}): string {
  const d = input.day ?? new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${d}|${input.ip}|${input.userAgent}`)
    .digest("hex");
}

export function detectDevice(ua: string | null): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (s.includes("mobile") || s.includes("android") || s.includes("iphone")) {
    return "mobile";
  }
  if (s.includes("tablet") || s.includes("ipad")) return "tablet";
  return "desktop";
}
