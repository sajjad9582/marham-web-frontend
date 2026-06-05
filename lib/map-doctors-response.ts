import type { Doctor, Hospital } from "@/lib/doctors-data";
import { VIDEO_HOSPITAL_NAME } from "@/lib/constants/doctor-listing";
import { doctorNameToSlug } from "@/lib/slugify";
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

function isVideoHospital(hospital: ApiHospital): boolean {
  return hospital.hospitalName === VIDEO_HOSPITAL_NAME;
}

function mapHospital(hospital: ApiHospital, fastConfirm: boolean): Hospital {
  const isVideo = isVideoHospital(hospital);

  const address = [hospital.hospitalArea, hospital.hospitalCity]
    .filter(Boolean)
    .join(", ");

  const name = isVideo
    ? VIDEO_HOSPITAL_NAME
    : [hospital.hospitalName, hospital.hospitalArea, hospital.hospitalCity]
        .filter(Boolean)
        .join(", ");

  return {
    name,
    address,
    city: hospital.hospitalCity,
    availability: AVAILABILITY_FALLBACK,
    fee: formatFee(hospital.fee),
    fastConfirm,
    isVideo,
    discountPercentage: hospital.discountPercentage,
    ...(hospital.discountPercentage > 0
      ? { discount: `Save ${hospital.discountPercentage}%` }
      : {}),
  };
}

function sortLocations(locations: Hospital[]): Hospital[] {
  const video = locations.filter((l) => l.isVideo);
  const physical = locations.filter((l) => !l.isVideo);
  return [...video, ...physical];
}

export function mapApiDoctor(apiDoctor: ApiDoctor, pageCitySlug: string, specialitySlug: string): Doctor {
  const fastConfirm = apiDoctor.firstComeFirstServe === 1;
  const locations = sortLocations(
    (apiDoctor.hospitals ?? []).map((h) => mapHospital(h, fastConfirm)),
  );
  const hasVideoCall = locations.some((l) => l.isVideo);

  return {
    id: String(apiDoctor.doctorId),
    doctorId: apiDoctor.doctorId,
    slug: doctorNameToSlug(apiDoctor.name),
    specialityId: apiDoctor.specialityId,
    specialitySlug,
    pageCitySlug,
    name: apiDoctor.name,
    specialty: apiDoctor.specialityName,
    qualifications: apiDoctor.degree,
    experience: formatExperience(apiDoctor.experience),
    satisfaction: formatSatisfaction(apiDoctor.satisfactionScore),
    reviews: apiDoctor.reviewsCount,
    rating: apiDoctor.rating ?? 0,
    isPmc: false,
    hasVideoCall,
    profilePic: apiDoctor.profilePic || undefined,
    services: apiDoctor.areasOfInterest ?? [],
    locations,
  };
}

export function mapApiDoctors(
  apiDoctors: ApiDoctor[],
  pageCitySlug: string,
  specialitySlug = "pediatrician",
): Doctor[] {
  return apiDoctors.map((d) => mapApiDoctor(d, pageCitySlug, specialitySlug));
}
