import type { Doctor } from "@/lib/doctors-data";

const MAX_ONLINE_DOCTORS = 12;

export function pickOnlineDoctors(doctors: Doctor[]): Doctor[] {
  const seen = new Set<number>();

  return doctors
    .filter((doctor) => doctor.hasVideoCall)
    .filter((doctor) => {
      if (seen.has(doctor.doctorId)) return false;
      seen.add(doctor.doctorId);
      return true;
    })
    .slice(0, MAX_ONLINE_DOCTORS);
}

export function getOnlineConsultationFee(doctor: Doctor): string {
  const videoLocation = doctor.locations.find((location) => location.isVideo);
  return videoLocation?.fee ?? doctor.locations[0]?.fee ?? "—";
}

export function formatExperienceYears(experience: string): string {
  const years = experience.replace(/\s*Yrs?\.?$/i, "").trim();
  if (!years || years === "—") return "—";
  return `${years} Years Experience`;
}
