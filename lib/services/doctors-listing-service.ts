import type { Doctor } from "@/lib/doctors-data";
import { formatSlug } from "@/lib/doctors-data";
import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { enrichListingDemoData } from "@/lib/enrich-listing-demo-data";
import { mapApiDoctors } from "@/lib/map-doctors-response";
import type { DoctorsListingFilters } from "@/lib/types/doctors-listing-filters";
import type { DoctorsListingMeta, DoctorsListingResponse } from "@/lib/types/marham-api";

const EMPTY_META: DoctorsListingMeta = { total: 0, page: 1, lastPage: 1 };
// const DEFAULT_API_BASE_URL = "http://localhost:3000";
const DEFAULT_API_BASE_URL = "https://www.marham.pk/";
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_MARHAM_API_URL ?? DEFAULT_API_BASE_URL;
}

function buildListingQueryParams(filters: DoctorsListingFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.specialityId) params.set("specialityId", String(filters.specialityId));
  if (filters.city) params.set("city", formatSlug(filters.city));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.minFee !== undefined) params.set("minFee", String(filters.minFee));
  if (filters.maxFee !== undefined) params.set("maxFee", String(filters.maxFee));
  if (filters.lat !== undefined) params.set("lat", String(filters.lat));
  if (filters.lng !== undefined) params.set("lng", String(filters.lng));
  if (filters.consultationType !== undefined) {
    params.set("consultationType", String(filters.consultationType));
  }
  if (filters.availableToday) params.set("availableToday", "true");
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDirection) params.set("sortDirection", filters.sortDirection);

  return params;
}

function locationMatchesFee(
  location: Doctor["locations"][number],
  minFee?: number,
  maxFee?: number,
): boolean {
  if (minFee !== undefined && location.feeAmount < minFee) return false;
  if (maxFee !== undefined && location.feeAmount > maxFee) return false;
  return true;
}

function applyFeeFilter(doctors: Doctor[], filters: DoctorsListingFilters): Doctor[] {
  const { minFee, maxFee } = filters;
  if (minFee === undefined && maxFee === undefined) return doctors;

  return doctors
    .map((doctor) => ({
      ...doctor,
      locations: doctor.locations.filter((l) =>
        locationMatchesFee(l, minFee, maxFee),
      ),
    }))
    .filter((doctor) => doctor.locations.length > 0);
}

function applyClientFilters(doctors: Doctor[], filters: DoctorsListingFilters): Doctor[] {
  let result = applyFeeFilter(doctors, filters);

  if (filters.discounts) {
    result = result.filter((d) =>
      d.locations.some((l) => l.discount !== undefined),
    );
  }

  if (filters.topReviewed) {
    result = [...result].sort((a, b) => b.rating - a.rating);
  }

  return result;
}

export type FetchDoctorsListingOptions = {
  revalidate?: number;
};

export type FetchDoctorsListingResult = {
  doctors: Doctor[];
  meta: DoctorsListingMeta;
};

export async function fetchDoctorsListing(
  filters: DoctorsListingFilters = {},
  options?: FetchDoctorsListingOptions,
): Promise<FetchDoctorsListingResult> {
  try {
    const query = buildListingQueryParams(filters);
    const url = `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.DOCTORS_LISTING}?${query.toString()}`;

    const fetchOptions: RequestInit & { next?: { revalidate: number } } =
      options?.revalidate !== undefined
        ? { next: { revalidate: options.revalidate } }
        : { cache: "no-store" };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error(`Doctors listing fetch failed: ${response.status} ${response.statusText}`);
      return { doctors: [], meta: EMPTY_META };
    }

    const json = (await response.json()) as DoctorsListingResponse;
    
    if (!json.success || !json.data?.doctors) {
      console.error("Doctors listing API returned unsuccessful response:", json.message);
      return { doctors: [], meta: json.data?.meta ?? EMPTY_META };
    }

    const enrichedDoctors = enrichListingDemoData(json.data.doctors);

    const doctors = applyClientFilters(
      mapApiDoctors(
        enrichedDoctors,
        filters.city ?? "lahore",
        filters.specialitySlug ?? "pediatrician",
      ),
      filters,
    );

    return {
      doctors,
      meta: json.data.meta ?? EMPTY_META,
    };
  } catch (error) {
    console.error("Doctors listing fetch error:", error);
    return { doctors: [], meta: EMPTY_META };
  }
}
