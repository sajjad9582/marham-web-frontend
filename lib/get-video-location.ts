import type { Doctor, Hospital } from "@/lib/doctors-data";

export function getVideoLocation(doctor: Doctor): Hospital | undefined {
  return doctor.locations.find((location) => location.isVideo);
}
