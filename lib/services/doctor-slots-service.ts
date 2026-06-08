import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { parseDisplayTimeTo24Hour } from "@/lib/format-appointment-slot";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import type { BookedVideoSlot, DoctorAvailableSlotsResponse } from "@/lib/types/marham-api";

export async function fetchFirstAvailableSlot(
  doctorId: number,
  hospitalId: number,
): Promise<BookedVideoSlot | null> {
  
    console.log("DoctorSlotsService: skip fetchFirstAvailableSlot because hospitalId is missing", {
      doctorId,
      hospitalId,
    });

  const params = new URLSearchParams({
    doctorId: String(doctorId),
    hospitalId: String(hospitalId),
    days: "7",
  });

  const currentUrl = `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.DOCTORS_AVAILABLE_SLOTS}?${params.toString()}`;
  const legacyUrl = `https://www.marham.pk/api/get-doctor-hospital-available-days?doctorId=${encodeURIComponent(
    String(doctorId)
  )}&hospitalId=${encodeURIComponent(String(hospitalId))}&hospitalType=2&isMoringEveningEnabled=false`;

  console.log("DoctorSlotsService: fetching first available slot", {
    currentUrl,
    legacyUrl,
    curl: `curl "${legacyUrl}"`,
  });

  const response = await fetch(currentUrl, { cache: "no-store" });

  if (!response.ok) {
    console.log("DoctorSlotsService: available slot fetch failed", {
      status: response.status,
      statusText: response.statusText,
      url: currentUrl,
    });
    return null;
  }

  const json = (await response.json()) as DoctorAvailableSlotsResponse;
  console.log("Fetched available slots:", json.data);
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
