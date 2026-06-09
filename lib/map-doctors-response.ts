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
  const normalizedName = hospital.hospitalName?.trim().toLowerCase();
  return (
    hospital.hospitalType === 2 ||
    normalizedName === VIDEO_HOSPITAL_NAME.toLowerCase()
  );
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
    feeAmount: hospital.fee,
    fastConfirm,
    isVideo,
    doctorHospitalId: hospital.doctorHospitalId,
    hospitalId: hospital.hospitalId,
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

function getLowestFee(hospitals: ApiHospital[]): number {
  if (!hospitals.length) return 0;
  return Math.min(...hospitals.map((h) => h.fee));
}

function ensureVideoConsultation(
  locations: Hospital[],
  apiHospitals: ApiHospital[],
  pageCitySlug: string,
  fastConfirm: boolean,
): Hospital[] {
  if (locations.some((l) => l.isVideo)) {
    return sortLocations(locations);
  }

  if (apiHospitals.length === 0) {
    return locations;
  }

  const videoApiHospital = apiHospitals.find((h) => isVideoHospital(h));
  const referenceHospital = videoApiHospital ?? apiHospitals[0];
  const referenceFee = videoApiHospital?.fee ?? getLowestFee(apiHospitals);
  const referenceCity =
    videoApiHospital?.hospitalCity ??
    apiHospitals[0]?.hospitalCity ??
    pageCitySlug;

  const syntheticVideo: Hospital = {
    name: VIDEO_HOSPITAL_NAME,
    address: "Online appointment",
    city: referenceCity,
    availability: AVAILABILITY_FALLBACK,
    fee: formatFee(referenceFee),
    feeAmount: referenceFee,
    fastConfirm,
    isVideo: true,
    doctorHospitalId: videoApiHospital?.doctorHospitalId ?? referenceHospital.doctorHospitalId,
    hospitalId: videoApiHospital?.hospitalId ?? referenceHospital.hospitalId,
    discountPercentage: videoApiHospital?.discountPercentage ?? referenceHospital.discountPercentage,
    ...((videoApiHospital?.discountPercentage ?? referenceHospital.discountPercentage) > 0
      ? {
          discount: `Save ${videoApiHospital?.discountPercentage ?? referenceHospital.discountPercentage}%`,
        }
      : {}),
  };

  return sortLocations([syntheticVideo, ...locations]);
}

export function mapApiDoctor(apiDoctor: ApiDoctor, pageCitySlug: string, specialitySlug: string): Doctor {
  const fastConfirm = apiDoctor.firstComeFirstServe === 1;
  const apiHospitals = apiDoctor.hospitals ?? [];
  const mappedLocations = apiHospitals.map((h) => mapHospital(h, fastConfirm));
  const locations = ensureVideoConsultation(mappedLocations, apiHospitals, pageCitySlug, fastConfirm);
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
