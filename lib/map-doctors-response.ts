import type { Doctor, Hospital } from "@/lib/doctors-data";
import type { ApiDoctor, ApiHospital } from "@/lib/types/marham-api";

const AVAILABILITY_FALLBACK = "Contact for availability";

function formatExperience(years: number): string {
  if (!years) return "—";
  return `${years} Yrs`;
}

function formatSatisfaction(score: number | null): string {
  if (!score) return "—";
  return `${score}%`;
}

function formatFee(fee: number): string {
  return `Rs. ${fee.toLocaleString("en-PK")}`;
}

function mapHospital(hospital: ApiHospital, fastConfirm: boolean): Hospital {
  const address = [hospital.hospitalArea, hospital.hospitalCity]
    .filter(Boolean)
    .join(", ");

  const name = [hospital.hospitalName, hospital.hospitalArea, hospital.hospitalCity]
    .filter(Boolean)
    .join(", ");

  return {
    name,
    address,
    city: hospital.hospitalCity,
    availability: AVAILABILITY_FALLBACK,
    fee: formatFee(hospital.fee),
    fastConfirm,
    ...(hospital.discountPercentage > 0
      ? { discount: `Save ${hospital.discountPercentage}%` }
      : {}),
    isVideo: false,
  };
}

export function mapApiDoctor(apiDoctor: ApiDoctor): Doctor {
  const fastConfirm = apiDoctor.firstComeFirstServe === 1;

  return {
    id: String(apiDoctor.doctorId),
    name: apiDoctor.name,
    specialty: apiDoctor.specialityName,
    qualifications: apiDoctor.degree,
    experience: formatExperience(apiDoctor.experience),
    satisfaction: formatSatisfaction(apiDoctor.satisfactionScore),
    reviews: apiDoctor.reviewsCount,
    isPmc: false,
    hasVideoCall: false,
    profilePic: apiDoctor.profilePic || undefined,
    services: apiDoctor.areasOfInterest ?? [],
    locations: (apiDoctor.hospitals ?? []).map((h) => mapHospital(h, fastConfirm)),
  };
}

export function mapApiDoctors(apiDoctors: ApiDoctor[]): Doctor[] {
  return apiDoctors.map(mapApiDoctor);
}
