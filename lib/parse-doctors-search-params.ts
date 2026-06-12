import { getSpecialityIdFromSlug } from "@/lib/constants/speciality-slugs";
import type { DoctorsListingFilters, DoctorsListingSearchParams } from "@/lib/types/doctors-listing-filters";

function getParam(params: DoctorsListingSearchParams, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export function parseDoctorsListingFilters(
  searchParams: DoctorsListingSearchParams,
  defaults: { city: string; specialitySlug: string },
): DoctorsListingFilters {
  const gender = getParam(searchParams, "gender");
  const sortBy = getParam(searchParams, "sortBy");

  return {
    page: parseNumber(getParam(searchParams, "page")) ?? 1,
    specialityId: getSpecialityIdFromSlug(defaults.specialitySlug),
    specialitySlug: defaults.specialitySlug,
    city: defaults.city || undefined,
    minFee: parseNumber(getParam(searchParams, "minFee")),
    maxFee: parseNumber(getParam(searchParams, "maxFee")),
    lat: parseNumber(getParam(searchParams, "lat")),
    lng: parseNumber(getParam(searchParams, "lng")),
    consultationType: parseNumber(getParam(searchParams, "consultationType")),
    availableToday: parseBoolean(getParam(searchParams, "availableToday")),
    timeSlot: parseNumber(getParam(searchParams, "timeSlot")),
    gender: gender === "male" || gender === "female" || gender === "all" ? gender : undefined,
    sortBy: sortBy === "fee" || sortBy === "experience" ? sortBy : undefined,
    sortDirection:
      getParam(searchParams, "sortDirection") === "ASC" ||
      getParam(searchParams, "sortDirection") === "DESC"
        ? (getParam(searchParams, "sortDirection") as "ASC" | "DESC")
        : undefined,
    topReviewed: parseBoolean(getParam(searchParams, "topReviewed")) ?? false,
    onlineNow: parseBoolean(getParam(searchParams, "onlineNow")) ?? false,
    discounts: parseBoolean(getParam(searchParams, "discounts")) ?? false,
  };
}
