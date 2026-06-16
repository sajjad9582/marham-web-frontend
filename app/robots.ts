import type { MetadataRoute } from "next";

import { getPublicSiteUrl, shouldNoIndex } from "@/lib/urls/site-urls";

export default function robots(): MetadataRoute.Robots {
  if (shouldNoIndex()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = getPublicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/sitemaps.xml`],
  };
}
