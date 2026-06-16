import type { MetadataRoute } from "next";

import { getPublicSiteUrl } from "@/lib/urls/site-urls";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/sitemaps.xml`],
  };
}
