import type { Doctor } from "@/lib/doctors-data";
import { formatSlug } from "@/lib/doctors-data";
import type { DoctorsListingMeta } from "@/lib/types/marham-api";
import { getSpecialitySeoConfig } from "@/lib/seo/speciality-seo-config";

export type ListingSeoContext = {
  citySlug: string;
  specialitySlug: string;
  cityName: string;
  specName: string;
  year: number;
  doctors: Doctor[];
  meta: DoctorsListingMeta;
  feeMin: number | null;
  feeMax: number | null;
  topAreas: string[];
  dateModified: string;
  canonicalUrl: string;
};

export function computeFeeRange(doctors: Doctor[]): { feeMin: number | null; feeMax: number | null } {
  const fees = doctors.flatMap((d) =>
    d.locations.filter((l) => l.feeAmount > 0).map((l) => l.feeAmount),
  );
  if (fees.length === 0) return { feeMin: null, feeMax: null };
  return { feeMin: Math.min(...fees), feeMax: Math.max(...fees) };
}

export function buildListingSeoContext(params: {
  citySlug: string;
  specialitySlug: string;
  doctors: Doctor[];
  meta: DoctorsListingMeta;
  topAreas?: string[];
  canonicalUrl: string;
}): ListingSeoContext {
  const { feeMin, feeMax } = computeFeeRange(params.doctors);
  const config = getSpecialitySeoConfig(params.specialitySlug);

  return {
    citySlug: params.citySlug,
    specialitySlug: params.specialitySlug,
    cityName: formatSlug(params.citySlug),
    specName: config.displayName,
    year: new Date().getFullYear(),
    doctors: params.doctors,
    meta: params.meta,
    feeMin,
    feeMax,
    topAreas: params.topAreas ?? [],
    dateModified: new Date().toISOString().split("T")[0],
    canonicalUrl: params.canonicalUrl,
  };
}
