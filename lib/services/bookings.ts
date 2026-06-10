import libphonenumber from "google-libphonenumber";
import { HttpError } from "@/lib/api/http-error";
import { createOnlineConsultation } from "@/lib/services/online-consultations";
import { resolvePatientUser } from "@/lib/services/users";
import type { WebBookOnlineConsultationInput } from "@/lib/schemas/bookings";
import { getConfig } from "@/lib/db/config";
import { AppType, DeviceType, Program } from "@/lib/db/enums";
import { formatPhoneNumber } from "@/lib/db/utils";

const { PhoneNumberUtil } = libphonenumber;

export type WebBookOnlineConsultationResult = {
  onlineConsultationId: number;
  programId: number;
  paymentUrl: string;
};

function validatePhone(phone: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const phoneUtil = PhoneNumberUtil.getInstance();

  try {
    const number = phoneUtil.parseAndKeepRawInput(formattedPhone, "PK");
    if (!phoneUtil.isValidNumber(number)) {
      throw new HttpError(400, "Phone Number is Invalid!");
    }
    return formattedPhone;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Phone Number is Invalid!");
  }
}

function buildPaymentUrl(onlineConsultationId: number): string {
  const baseUrl = String(
    getConfig("MARHAM_URL") || getConfig("cdn.marhamUrl") || "https://www.marham.pk/",
  );
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}payment/methods/${Program.ONLINE_CONSULTATION}/${onlineConsultationId}?version=v1`;
}

export async function bookFromWeb(
  input: WebBookOnlineConsultationInput,
): Promise<WebBookOnlineConsultationResult> {
  const formattedPhone = validatePhone(input.patientPhone);
  const user = await resolvePatientUser(formattedPhone, input.patientName);

  const result = await createOnlineConsultation(
    {
      doctorId: input.doctorId,
      date: input.date,
      time: input.time,
      userId: user.id,
      appType: input.appType ?? AppType.MARHAM,
      deviceType: input.deviceType ?? DeviceType.WEB,
      promoCode: input.promoCode?.trim() || undefined,
    },
    user,
  );

  const onlineConsultationId = result.onlineConsultationId;
  if (!onlineConsultationId) {
    throw new HttpError(400, "Failed to create online consultation.");
  }

  return {
    onlineConsultationId,
    programId: Program.ONLINE_CONSULTATION,
    paymentUrl: buildPaymentUrl(onlineConsultationId),
  };
}
