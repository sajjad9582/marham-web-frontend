import { getPublicSiteUrl } from "@/lib/urls/site-urls";

function joinLegacyPath(...segments: string[]): string {
  return `${getPublicSiteUrl()}/${segments.map((s) => s.replace(/^\/+|\/+$/g, "")).join("/")}`;
}

export function buildLegacyHospitalSpecialityUrl(
  citySlug: string,
  hospitalSlug: string,
  areaSlug: string,
  specialitySlug: string,
): string {
  return joinLegacyPath("hospitals", citySlug, hospitalSlug, areaSlug, specialitySlug);
}

export function buildLegacyAreaListingUrl(
  citySlug: string,
  specialitySlug: string,
  areaSlug: string,
): string {
  return joinLegacyPath("doctors", citySlug, specialitySlug, `area-${areaSlug}`);
}

export function buildLegacyDiseaseCityUrl(diseaseSlug: string, citySlug: string): string {
  return joinLegacyPath("diseases", diseaseSlug, citySlug);
}

export function buildLegacyCitySpecialityUrl(citySlug: string, specialitySlug: string): string {
  return joinLegacyPath("doctors", citySlug, specialitySlug);
}
