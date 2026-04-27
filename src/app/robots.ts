import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";

/**
 * Public affiliate app: allow indexing of marketing pages; block API and auth callbacks.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
