import type { Metadata } from "next";

import { formatSlug } from "@/lib/doctors-data";
import type { ListingSeoContext } from "@/lib/seo/listing-seo-context";
import { getOgImageUrl, getSpecialitySeoConfig } from "@/lib/seo/speciality-seo-config";
import { buildPublicPath, shouldNoIndex } from "@/lib/urls/site-urls";

function buildTitle(context: ListingSeoContext): string {
  const config = getSpecialitySeoConfig(context.specialitySlug);
  return `Best ${config.displayName} in ${context.cityName} ${context.year} | Top ${config.secondaryKeyword} | Marham`;
}

function buildDescription(context: ListingSeoContext): string {
  const config = getSpecialitySeoConfig(context.specialitySlug);
  const feePart =
    context.feeMin !== null && context.feeMax !== null
      ? ` Fees from Rs. ${context.feeMin.toLocaleString("en-PK")} to Rs. ${context.feeMax.toLocaleString("en-PK")}.`
      : "";
  const secondary = config.secondaryKeyword.toLowerCase();

  if (context.specialitySlug === "pediatrician") {
    return `Book appointment or online video consultation with the best pediatrician in ${context.cityName}.${feePart} Verified reviews, instant confirmation. Find a ${secondary} near you.`;
  }

  return `Book appointment or online video consultation with the best ${config.displayName.toLowerCase()} in ${context.cityName}.${feePart} Verified reviews, instant confirmation.`;
}

export function buildDoctorsListingCanonical(citySlug: string, specialitySlug: string): string {
  return buildPublicPath(`/doctors/${citySlug}/${specialitySlug}`);
}

export function buildDoctorsListingMetadataFromContext(context: ListingSeoContext): Metadata {
  const title = buildTitle(context);
  const description = buildDescription(context);
  const ogImage = getOgImageUrl(context.specialitySlug, context.citySlug);

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: context.canonicalUrl },
    openGraph: {
      type: "website",
      siteName: "Marham",
      title,
      description,
      url: context.canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };

  if (shouldNoIndex()) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

/** @deprecated Use buildDoctorsListingMetadataFromContext with full context */
export function buildDoctorsListingMetadata(citySlug: string, specialitySlug: string) {
  const city = formatSlug(citySlug);
  const config = getSpecialitySeoConfig(specialitySlug);
  const year = new Date().getFullYear();

  return {
    title: `Best ${config.displayName} in ${city} ${year} | Top ${config.secondaryKeyword} | Marham`,
    description: `Book appointment or online video consultation with the best ${config.displayName.toLowerCase()} in ${city}. Verified reviews, instant confirmation.`,
    canonical: buildDoctorsListingCanonical(citySlug, specialitySlug),
  };
}
