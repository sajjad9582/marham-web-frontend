import type { Doctor } from "@/lib/doctors-data";
import { mapApiDoctors } from "@/lib/map-doctors-response";
import type { DoctorsListingMeta, DoctorsListingResponse } from "@/lib/types/marham-api";

const EMPTY_META: DoctorsListingMeta = { total: 0, page: 1, lastPage: 1 };

const DEFAULT_API_BASE_URL = "http://localhost:3000";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_MARHAM_API_URL ?? DEFAULT_API_BASE_URL;
}

function buildDoctorsListingUrl({
  page = 1,
  specialityId = 29,
  city = "lahore",
}: {
  page?: number;
  specialityId?: number;
  city?: string;
}): string {
  const params = new URLSearchParams({
    specialityId: String(specialityId),
    city,
    page: String(page),
  });

  return `${getApiBaseUrl()}/api/v1/doctors/listing?${params.toString()}`;
}

type FetchDoctorsListingParams = {
  page?: number;
  specialityId?: number;
  city?: string;
};

type FetchDoctorsListingOptions = {
  revalidate?: number;
};

type FetchDoctorsListingResult = {
  doctors: Doctor[];
  meta: DoctorsListingMeta;
};

export async function fetchDoctorsListing(
  { page = 1, specialityId, city }: FetchDoctorsListingParams = {},
  options?: FetchDoctorsListingOptions,
): Promise<FetchDoctorsListingResult> {
  try {
    const url = buildDoctorsListingUrl({ page, specialityId, city });
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

    return {
      doctors: mapApiDoctors(json.data.doctors),
      meta: json.data.meta ?? EMPTY_META,
    };
  } catch (error) {
    console.error("Doctors listing fetch error:", error);
    return { doctors: [], meta: EMPTY_META };
  }
}
