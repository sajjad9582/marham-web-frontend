import type { Doctor, Hospital } from "@/lib/doctors-data";
import { VIDEO_HOSPITAL_NAME } from "@/lib/constants/doctor-listing";
import { doctorNameToSlug } from "@/lib/slugify";
import type { ApiDoctor, ApiHospital } from "@/lib/types/marham-api";

const AVAILABILITY_FALLBACK = "Contact for availability";
const AVAILABILITY_ENRICHED = "Available Today";

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
  return Number(hospital.hospitalType) === 2;
}

function hasDbDiscount(hospital: ApiHospital): boolean {
  if (hospital.hasDiscount !== undefined) return hospital.hasDiscount;
  return hospital.discountFee > 0 && hospital.discountFee < hospital.fee;
}

function mapPricing(hospital: ApiHospital): Pick<
  Hospital,
  | "fee"
  | "feeAmount"
  | "originalFeeAmount"
  | "originalFee"
  | "hasDiscount"
  | "discount"
  | "discountPercentage"
> {
  const discounted = hasDbDiscount(hospital);

  if (discounted) {
    return {
      fee: formatFee(hospital.discountFee),
      feeAmount: hospital.discountFee,
      originalFeeAmount: hospital.fee,
      originalFee: formatFee(hospital.fee),
      hasDiscount: true,
      discountPercentage: hospital.discountPercentage,
      discount: hospital.discountPercentage
        ? `Save ${hospital.discountPercentage}%`
        : undefined,
    };
  }

  return {
    fee: formatFee(hospital.fee),
    feeAmount: hospital.fee,
  };
}

function mapAvailability(hospital: ApiHospital): string {
  const enriched = Number(hospital.hospitalType) === 2 || hasDbDiscount(hospital);
  return enriched ? AVAILABILITY_ENRICHED : AVAILABILITY_FALLBACK;
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
    availability: mapAvailability(hospital),
    fastConfirm,
    isVideo,
    doctorHospitalId: hospital.doctorHospitalId,
    hospitalId: hospital.hospitalId,
    doctorSlug: hospital.doctorSlug,
    ...mapPricing(hospital),
  };
}

function sortLocations(locations: Hospital[]): Hospital[] {
  const video = locations.filter((l) => l.isVideo);
  const physical = locations.filter((l) => !l.isVideo);
  return [...video, ...physical];
}

export function mapApiDoctor(apiDoctor: ApiDoctor, pageCitySlug: string, specialitySlug: string): Doctor {
  const fastConfirm = apiDoctor.firstComeFirstServe === 1;
  const apiHospitals = apiDoctor.hospitals ?? [];
  const locations = sortLocations(apiHospitals.map((h) => mapHospital(h, fastConfirm)));
  const hasVideoCall = apiHospitals.some((h) => isVideoHospital(h));

  return {
    id: String(apiDoctor.doctorId),
    doctorId: apiDoctor.doctorId,
    slug: apiDoctor.slug || doctorNameToSlug(apiDoctor.name),
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
