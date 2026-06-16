import { MARHAM_LEGACY_PATHS } from "@/lib/constants/marham-legacy-urls";
import { ONLINE_CONSULTATION_PROGRAM_ID } from "@/lib/constants/marham-api-endpoints";
import { doctorNameToSlug, toSlug } from "@/lib/slugify";
import { getPublicSiteUrl } from "@/lib/urls/site-urls";

export function getMarhamHomeUrl(): string {
  return getPublicSiteUrl();
}

function normalizeSlugPath(slug: string): string {
  return slug.replace(/^\/+/, "");
}

export function buildDoctorProfileUrlFromSlug(slug: string): string {
  const home = getMarhamHomeUrl().replace(/\/$/, "");
  return `${home}/${normalizeSlugPath(slug)}`;
}

export function buildBookAppointmentUrlFromSlug(
  slug: string,
  hospitalId?: number,
): string {
  const base = `${buildDoctorProfileUrlFromSlug(slug)}/callcenter`;
  if (!hospitalId) return base;
  return `${base}?h_id=${hospitalId}`;
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
  params: DoctorUrlParams & { hospitalId?: number; slug?: string },
): string {
  if (params.slug) {
    return buildBookAppointmentUrlFromSlug(params.slug, params.hospitalId);
  }
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
  return `${home}/payment/methods/${ONLINE_CONSULTATION_PROGRAM_ID}/${onlineConsultationId}`;
}

type PhysicalAppointmentThanksUrlParams = {
  slug?: string;
  doctorId: number;
  doctorName: string;
  specialitySlug: string;
  citySlug: string;
  appointmentId: string | number;
  awayFromCity?: boolean;
};

export function buildPhysicalAppointmentThanksUrl(
  params: PhysicalAppointmentThanksUrlParams,
): string {
  const type = params.awayFromCity ? 1 : 0;
  const profileBase = params.slug
    ? buildDoctorProfileUrlFromSlug(params.slug)
    : buildDoctorProfileUrl({
        doctorId: params.doctorId,
        doctorName: params.doctorName,
        specialityId: 0,
        specialitySlug: params.specialitySlug,
        citySlug: params.citySlug,
      });

  return `${profileBase}/thanks/${params.appointmentId}?type=${type}`;
}
