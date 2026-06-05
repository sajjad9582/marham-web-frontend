import type { Doctor } from "@/lib/doctors-data";
import { mapApiDoctors } from "@/lib/map-doctors-response";
import type { DoctorsListingMeta, DoctorsListingResponse } from "@/lib/types/marham-api";

const BASE_URL =
  "http://localhost:3000/api/v1/doctors/listing?specialityId=29&city=lahore";

const EMPTY_META: DoctorsListingMeta = { total: 0, page: 1, lastPage: 1 };

type FetchDoctorsListingParams = {
  page?: number;
};

type FetchDoctorsListingResult = {
  doctors: Doctor[];
  meta: DoctorsListingMeta;
};

export async function fetchDoctorsListing({
  page = 1,
}: FetchDoctorsListingParams = {}): Promise<FetchDoctorsListingResult> {
  try {
    const url = `${BASE_URL}&page=${page}`;
    const response = await fetch(url, { next: { revalidate: 60 } });

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
