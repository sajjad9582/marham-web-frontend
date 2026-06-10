import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import type {
  WebBookPhysicalAppointmentResponse,
  WebBookVideoConsultationResponse,
} from "@/lib/types/marham-api";

export type BookPhysicalAppointmentParams = {
  doctorId: number;
  doctorHospitalId: number;
  date: string;
  time: string;
  patientPhone: string;
  patientName: string;
  awayFromCity?: boolean;
  promoCode?: string;
};

export type BookVideoConsultationParams = {
  doctorId: number;
  doctorHospitalId?: number;
  date: string;
  time: string;
  patientPhone: string;
  patientName: string;
  promoCode?: string;
};

export async function bookPhysicalAppointment(
  params: BookPhysicalAppointmentParams,
): Promise<WebBookPhysicalAppointmentResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.WEB_APPOINTMENT_BOOK}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: params.doctorId,
        doctorHospitalId: params.doctorHospitalId,
        date: params.date,
        time: params.time,
        patientPhone: params.patientPhone,
        patientName: params.patientName,
        awayFromCity: params.awayFromCity ?? false,
        promoCode: params.promoCode?.trim() || undefined,
        appType: 1,
        deviceType: 3,
      }),
    },
  );

  const json = (await response.json()) as WebBookPhysicalAppointmentResponse;

  if (!response.ok && json.success !== false) {
    return {
      success: false,
      message: "Unable to complete booking. Please try again.",
      data: null,
    };
  }

  return json;
}

export async function bookVideoConsultation(
  params: BookVideoConsultationParams,
): Promise<WebBookVideoConsultationResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.WEB_ONLINE_CONSULTATION_BOOK}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: params.doctorId,
        doctorHospitalId: params.doctorHospitalId,
        date: params.date,
        time: params.time,
        patientPhone: params.patientPhone,
        patientName: params.patientName,
        promoCode: params.promoCode?.trim() || undefined,
        appType: 1,
        deviceType: 3,
      }),
    },
  );

  const json = (await response.json()) as WebBookVideoConsultationResponse;

  if (!response.ok && json.success !== false) {
    return {
      success: false,
      message: "Unable to complete booking. Please try again.",
      data: null,
    };
  }

  return json;
}
