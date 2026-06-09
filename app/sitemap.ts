import type { MetadataRoute } from "next";

import { TOP_PAKISTAN_CITIES } from "@/lib/constants/doctors-related-links";
import { SPECIALITY_SLUG_TO_ID } from "@/lib/constants/speciality-slugs";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const specialitySlugs = Object.keys(SPECIALITY_SLUG_TO_ID);
  const citySlugs = TOP_PAKISTAN_CITIES.map((city) => city.slug);

  const doctorListingUrls: MetadataRoute.Sitemap = citySlugs.flatMap((city) =>
    specialitySlugs.map((speciality) => ({
      url: `${siteUrl}/doctors/${city}/${speciality}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  );

  return [
    {
      url: siteUrl,
      changeFrequency: "yearly",
      priority: 1,
    },
    ...doctorListingUrls,
  ];
}
