import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { parseDisplayTimeTo24Hour } from "@/lib/format-appointment-slot";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import type {
  BookedVideoSlot,
  DoctorAvailableSlotsDay,
  DoctorAvailableSlotsResponse,
} from "@/lib/types/marham-api";

export type FetchDoctorAvailableSlotsOptions = {
  date?: string;
  days?: number;
};

export async function fetchDoctorAvailableSlots(
  doctorId: number,
  hospitalId: number | undefined,
  options?: FetchDoctorAvailableSlotsOptions,
): Promise<DoctorAvailableSlotsDay[]> {
  if (!hospitalId) {
    console.log("DoctorSlotsService: skip fetch — hospitalId is missing", {
      doctorId,
      hospitalId,
    });
    return [];
  }

  const params = new URLSearchParams({
    doctorId: String(doctorId),
    hospitalId: String(hospitalId),
    days: String(options?.days ?? 7),
  });

  if (options?.date) {
    params.set("date", options.date);
  }

  const url = `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.DOCTORS_AVAILABLE_SLOTS}?${params.toString()}`;

  console.log("DoctorSlotsService: fetching available slots", { url, doctorId, hospitalId });

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.log("DoctorSlotsService: available slots fetch failed", {
      status: response.status,
      statusText: response.statusText,
      url,
    });
    return [];
  }

  const json = (await response.json()) as DoctorAvailableSlotsResponse;
  const availableSlots = json.data?.availableSlots ?? [];

  console.log("Fetched available slots:", availableSlots);

  return availableSlots;
}

export async function fetchFirstAvailableSlot(
  doctorId: number,
  hospitalId: number | undefined,
): Promise<BookedVideoSlot | null> {
  const days = await fetchDoctorAvailableSlots(doctorId, hospitalId);

  for (const day of days) {
    const slot = day.slots.find((entry) => entry.available);
    if (!slot) continue;

    return {
      date: day.date,
      time: parseDisplayTimeTo24Hour(slot.time),
      displayTime: slot.time,
    };
  }

  return null;
}
