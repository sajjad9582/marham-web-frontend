import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { parseDisplayTimeTo24Hour } from "@/lib/format-appointment-slot";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import type { BookedVideoSlot, DoctorAvailableSlotsResponse } from "@/lib/types/marham-api";

export async function fetchFirstAvailableSlot(
  doctorId: number,
  hospitalId: number,
): Promise<BookedVideoSlot | null> {
  const params = new URLSearchParams({
    doctorId: String(doctorId),
    hospitalId: String(hospitalId),
    days: "7",
  });

  const response = await fetch(
    `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.DOCTORS_AVAILABLE_SLOTS}?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as DoctorAvailableSlotsResponse;
  const days = json.data?.availableSlots ?? [];

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
