import type { Doctor } from "@/lib/doctors-data";
import { formatSlug } from "@/lib/doctors-data";
import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { mapApiDoctors } from "@/lib/map-doctors-response";
import type { CallMyDoctorsResponse } from "@/lib/types/marham-api";
import { getApiBaseUrl } from "@/lib/get-api-base-url";

export async function fetchCallMyDoctors(params: {
  specialityId: number;
  city?: string;
  specialitySlug?: string;
}): Promise<Doctor[]> {
  try {
    const query = new URLSearchParams();
    query.set("specialityId", String(params.specialityId));
    if (params.city) {
      query.set("city", formatSlug(params.city));
    }

    const url = `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.DOCTORS_CALL_MY}?${query.toString()}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error(`Call my doctors fetch failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const json = (await response.json()) as CallMyDoctorsResponse;
    if (!json.success || !json.data?.doctors) {
      console.error("Call my doctors API returned unsuccessful response:", json.message);
      return [];
    }

    return mapApiDoctors(
      json.data.doctors,
      params.city ?? "lahore",
      params.specialitySlug ?? "doctor",
    );
  } catch (error) {
    console.error("Call my doctors fetch error:", error);
    return [];
  }
}
