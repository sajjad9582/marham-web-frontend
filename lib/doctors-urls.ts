import { MARHAM_LEGACY_PATHS } from "@/lib/constants/marham-legacy-urls";
import { ONLINE_CONSULTATION_PROGRAM_ID } from "@/lib/constants/marham-api-endpoints";
import { doctorNameToSlug, toSlug } from "@/lib/slugify";

const DEFAULT_HOME_URL = "https://www.marham.pk";

export function getMarhamHomeUrl(): string {
  return process.env.NEXT_PUBLIC_MARHAM_HOME_URL ?? DEFAULT_HOME_URL;
}

type DoctorUrlParams = {
  doctorId: number;
  doctorName: string;
  specialityId: number;
  specialitySlug: string;
  citySlug: string;
  hospitalCitySlug?: string;
};

export function buildDoctorProfileUrl(params: DoctorUrlParams): string {
  const home = getMarhamHomeUrl();
  const doctorSlug = doctorNameToSlug(params.doctorName);
  const path = MARHAM_LEGACY_PATHS.DOCTOR_PROFILE.replace("{specialitySlug}", params.specialitySlug)
    .replace("{citySlug}", params.citySlug)
    .replace("{doctorSlug}", doctorSlug)
    .replace("{doctorId}", String(params.doctorId));

  return `${home}${path}`;
}

export function buildVideoCallUrl(specialityId: number, doctorId: number): string {
  const home = getMarhamHomeUrl();
  return `${home}${MARHAM_LEGACY_PATHS.VIDEO_CALL_REQUEST}?id=${specialityId}&d_id=${doctorId}`;
}

export function buildBookAppointmentUrl(params: DoctorUrlParams): string {
  const home = getMarhamHomeUrl();
  const doctorSlug = doctorNameToSlug(params.doctorName);
  const path = MARHAM_LEGACY_PATHS.BOOK_APPOINTMENT.replace("{specialitySlug}", params.specialitySlug)
    .replace("{citySlug}", params.citySlug)
    .replace("{doctorSlug}", doctorSlug)
    .replace("{doctorId}", String(params.doctorId));

  return `${home}${path}`;
}

export function buildCallcenterBookingUrl(
  params: DoctorUrlParams & { hospitalId?: number },
): string {
  const url = buildBookAppointmentUrl(params);
  if (!params.hospitalId) return url;
  return `${url}?h_id=${params.hospitalId}`;
}

export function buildCallcenterUrl(params: DoctorUrlParams): string {
  const home = getMarhamHomeUrl();
  const doctorSlug = doctorNameToSlug(params.doctorName);
  const hospitalCitySlug = params.hospitalCitySlug
    ? toSlug(params.hospitalCitySlug)
    : params.citySlug;

  const path = MARHAM_LEGACY_PATHS.CALLCENTER.replace("{hospitalCitySlug}", hospitalCitySlug)
    .replace("{specialitySlug}", params.specialitySlug)
    .replace("{doctorSlug}", doctorSlug);

  return `${home}${path}`;
}

export function buildVideoPaymentUrl(onlineConsultationId: number): string {
  const home = getMarhamHomeUrl().replace(/\/$/, "");
  return `${home}/payment/methods/${ONLINE_CONSULTATION_PROGRAM_ID}/${onlineConsultationId}?version=v1`;
}
