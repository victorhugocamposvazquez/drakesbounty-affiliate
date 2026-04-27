import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";
import { routing } from "@/i18n/routing";

/** Indexable public routes (locale-prefixed). Ledger / oath stay discoverable via nav, not sitemap priority. */
const PUBLIC_PATHS = ["/", "/code", "/standards-index"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const out: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of PUBLIC_PATHS) {
      const pathname = path === "/" ? `/${locale}` : `/${locale}${path}`;
      out.push({
        url: `${base}${pathname}`,
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  return out;
}
