import type { Doctor } from "@/lib/doctors-data";

export function getOnlineConsultationFee(doctor: Doctor): string {
  const videoLocation = doctor.locations.find((location) => location.isVideo);
  return videoLocation?.fee ?? doctor.locations[0]?.fee ?? "—";
}

export function formatExperienceYears(experience: string): string {
  const years = experience.replace(/\s*Yrs?\.?$/i, "").trim();
  if (!years || years === "—") return "—";
  return `${years} Years Experience`;
}
