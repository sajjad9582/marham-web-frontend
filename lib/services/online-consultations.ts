// @ts-nocheck
import dayjs from "dayjs";
import { HttpError } from "@/lib/api/http-error";
import {
  createAppointment,
  createAppointmentResponseDto,
} from "@/lib/services/appointments";
import { sendOnlineConsultationCommunication } from "@/lib/services/communications";
import { findDoctorById } from "@/lib/services/doctors";
import { validatePromoCode } from "@/lib/services/promo-codes";
import {
  findOnlineConsultationByAppointmentId,
  findVideoConsultationListing,
  insertOnlineConsultation,
} from "@/lib/db/queries/online-consultations";
import type { CreateOnlineConsultationInput } from "@/lib/schemas/bookings";
import { Program } from "@/lib/db/enums/program.enum";

export async function createOnlineConsultation(
  input: CreateOnlineConsultationInput,
  user: { id: number },
) {
  if (!input.userId) {
    throw new HttpError(400, "Invalid User");
  }

  const doctorId = input.doctorId;
  const listing = await findVideoConsultationListing(doctorId);
  const doctor = await findDoctorById(doctorId);

  if (!listing) {
    throw new HttpError(400, "Video consultation not allowed for this doctor.");
  }

  let validPromoCode = null;
  if (input.promoCode) {
    const promoValidation = await validatePromoCode({
      promoCode: input.promoCode,
      programId: Program.ONLINE_CONSULTATION,
      doctorId,
      specialityId: Number(listing.specialityId),
    });
    if (!promoValidation.valid) {
      throw new HttpError(400, promoValidation.message || "Invalid promo code");
    }
    validPromoCode = promoValidation.promoCode;
  }

  const appointment = await createAppointment(
    {
      doctorId,
      doctorHospitalId: listing.id,
      date: dayjs(input.date).format("YYYY-MM-DD"),
      time: dayjs(`${input.date} ${input.time}`).format("HH:mm"),
      userId: input.userId,
      addedBy: user.id,
      deviceType: input.deviceType,
      appType: input.appType,
      patientCity: input.city,
      patientArea: input.area,
      utmSource: "marham-one",
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      promoCode: validPromoCode?.code,
    },
    true,
    user,
  );

  if (!appointment || (typeof appointment === "object" && !("id" in appointment))) {
    throw new HttpError(400, "Failed to create appointment.");
  }

  const appt = appointment as Awaited<ReturnType<typeof createAppointment>> & { id: bigint };

  const existingOc = await findOnlineConsultationByAppointmentId(appt.id);
  if (existingOc) {
    const appointmentResponse = createAppointmentResponseDto(appt);
    return {
      ...appointmentResponse,
      onlineConsultationId: existingOc.id,
      programId: Program.ONLINE_CONSULTATION,
    };
  }

  const savedOc = await insertOnlineConsultation({
    appointmentId: appt.id,
    userId: appt.userId,
    doctorId: appt.doctorId,
    patientId: appt.patientId,
    patientName: appt.patientName,
    patientPhone: appt.patientPhone,
    doctorName: appt.doctorName,
    doctorPhone: appt.doctorPhone,
    doctorEmail: doctor?.email,
    appointmentDate: appt.date,
    appointmentTime: appt.time,
    fee: appt.fee,
    appointmentStatus: appt.appointmentStatus,
    appointmentSubStatus: appt.appointmentSubStatus,
    requestedSpecialityId: appt.specialityId,
    programId: Program.ONLINE_CONSULTATION,
    isReferred: appt.isReferred,
    isPromotional: appt.isPromotional,
    promotionalFor: appt.promotionalFor,
    referredBy: appt.referredBy,
    referredTo: appt.referredTo,
    referredSpecialityId: appt.referredSpecialityId,
    uuid: appt.uuid,
    visitorSource: appt.visitorSource,
    utmSource: appt.utmSource,
    utmMedium: appt.utmMedium,
    utmCampaign: appt.utmCampaign,
    addedBy: appt.addedBy,
    leadSourceId: appt.leadSourceId,
    isCallMyDoctor: appt.isCallMyDoctor,
    isRocheAppointment: appt.isRocheAppointment,
    isFree: appt.isFree,
    deviceType: appt.deviceType,
    appType: appt.appType,
    promoCode: validPromoCode?.code || null,
  });

  sendOnlineConsultationCommunication({
    id: savedOc.id,
    isConsultationUpdated: 1,
    toPatient: 1,
  });

  const appointmentResponse = createAppointmentResponseDto(appt);
  return {
    ...appointmentResponse,
    onlineConsultationId: savedOc.id,
    programId: Program.ONLINE_CONSULTATION,
  };
}
