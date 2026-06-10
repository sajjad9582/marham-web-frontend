// @ts-nocheck
import dayjs from "dayjs";
import { HttpError } from "@/lib/api/http-error";
import { getDoctorAvailableSlots } from "@/lib/services/doctor-availability";
import { calculateDiscount } from "@/lib/services/discounts";
import { getCorporateUserDetails } from "@/lib/services/corporate";
import { findDoctorById, findDoctorListingById } from "@/lib/services/doctors";
import { markPromoCodeAsUsed, validatePromoCode } from "@/lib/services/promo-codes";
import { validateUserAccess, findUserById } from "@/lib/services/users";
import {
  createAppointment as insertAppointment,
  findAppointmentComplete,
  findAppointmentDetailed,
  getLastFlApptId,
  hasDuplicateProcessAppointment,
  isFollowUpPatient as checkIsFollowUpPatient,
} from "@/lib/db/queries/appointments";
import { findOrCreatePatient } from "@/lib/db/queries/patients";
import type { CreateAppointmentInput } from "@/lib/schemas/bookings";
import type { PatientAppointmentRow } from "@/lib/db/queries/appointments";

type PatientAppointment = PatientAppointmentRow & {
  statusDetail?: { title?: string } | null;
  subStatusDetail?: { title?: string } | null;
  onlineConsultation?: { id?: number } | null;
  doctor?: { id?: number; profilePic?: string; gender?: number } | null;
  hospital?: { lat?: number; lng?: number; locationVerifiedAt?: Date | null } | null;
  doctorListing?: { isOnlinePaymentEnabled?: number } | null;
};
import { getConfig } from "@/lib/db/config";
import { CALL_BUTTON_SHOW_UP_WINDOW_MS } from "@/lib/db/constants/index";
import {
  AppointmentStatus,
  AppointmentSubStatus,
  Program,
} from "@/lib/db/enums";
import { AppointmentType } from "@/lib/db/enums/appointment-type.enum";
import type { ReferralOptions } from "@/lib/db/interfaces/referral-values.interface";
import { DateUtil, StringUtil } from "@/lib/db/utils";
import { DoctorImageUtil } from "@/lib/db/utils/doctor-image.util";

async function validateSlotAvailability(
  doctorId: number,
  hospitalId: number,
  dateStr: string,
  timeStr: string,
) {
  const formattedDate = dayjs(dateStr).format("YYYY-MM-DD");
  const availability = await getDoctorAvailableSlots({
    doctorId,
    hospitalId,
    date: formattedDate,
    days: 1,
  });

  if (!availability.availableSlots || availability.availableSlots.length === 0) {
    throw new HttpError(400, "No available slots found for this date.");
  }

  const dailySlots = availability.availableSlots[0]?.slots || [];
  const targetTime = dayjs(`${dateStr} ${timeStr}`).format("hh:mm A");
  const targetTime24 = dayjs(`${dateStr} ${timeStr}`).format("HH:mm");
  const found = dailySlots.some(
    (s) => (s.time === targetTime || s.time === targetTime24) && s.available,
  );

  if (!found) {
    throw new HttpError(400, "Selected time slot is not available.");
  }
}

async function isFollowUpPatient(phone: string, doctorId: number): Promise<boolean> {
  const startDate = dayjs().subtract(60, "days").toDate();
  const endDate = dayjs().toDate();
  return checkIsFollowUpPatient(phone, doctorId, startDate, endDate);
}

async function generateAppointmentId(
  hospitalId: number,
  appointmentUserType: number,
): Promise<{ id: bigint; flApptId: number }> {
  const lastFlApptId = await getLastFlApptId(hospitalId);
  const nextFlApptId = lastFlApptId ? lastFlApptId + 1 : 1;
  const appointmentTypeStr = appointmentUserType.toString();
  const hospitalIdStr = hospitalId.toString().padStart(5, "0");
  const sequentialIdStr = nextFlApptId.toString();
  const id = BigInt(appointmentTypeStr + hospitalIdStr + sequentialIdStr);
  return { id, flApptId: nextFlApptId };
}

async function validateDuplicateProcessAppointments(
  phone: string,
  doctorId: number,
  date: string,
) {
  const hasInProcessAppointments = await hasDuplicateProcessAppointment(
    phone,
    doctorId,
    date,
  );
  if (hasInProcessAppointments) {
    throw new HttpError(
      400,
      "You have 2 in-process bookings with this doctor on the same date. To book more appointment, please call on our helpline number 042-32591427.",
    );
  }
}

function getDefaultPaymentTimestamps() {
  return {
    payment_yes_at: "",
    payment_evidence_received_at: "",
    payment_to_be_refund_marked_at: "",
    payment_refunded_at: "",
  };
}

async function getReferralValues(options: ReferralOptions) {
  const discountOptions = {
    fee: options.fee,
    discountFee: options.discountFee,
    hospitalType: options.appointmentType,
    isOnlinePaymentEnabled: options.isOnlinePaymentEnabled,
    isCorporateUser: options.isCorporateUser === true,
    corporateAppointmentDiscount: options.corporateAppointmentDiscount,
    corporateConsultationDiscount: options.corporateConsultationDiscount,
    promoCode: options.promoCode ?? undefined,
  };

  let { finalDiscountFee, discountPercentage, discountType, isDiscountApplied } =
    await calculateDiscount(discountOptions);

  const discount = options.fee - finalDiscountFee;
  const result: Record<string, unknown> = {
    doctorFee: options.fee,
    fee: options.fee,
    referralAmount: 0,
    doctorReferralAmount: 0,
    discount: 0,
    discountPercentage: 0,
    consultancyReferral: options.consultancyReferral,
    isFree: options.isFree ? 1 : 0,
  };

  if (options.isFree) {
    result.fee = 0;
    result.discountedAmount = 0;
    return result;
  }

  if (options.promoCode && discountType === "promo_code") {
    result.fee = finalDiscountFee;
    result.discount = discount;
    result.discountPercentage = discountPercentage;
    result.referralAmount = finalDiscountFee * (options.consultancyReferral * 0.01);
    result.doctorReferralAmount =
      finalDiscountFee * (100 - options.consultancyReferral) * 0.01;
    return result;
  }

  if (options.appointmentType === AppointmentType.PHYSICAL && options.isFollowUp) {
    result.referralAmount = 0;
    result.doctorReferralAmount = options.fee;
  } else if (options.isPersonalAppointment) {
    result.consultancyReferral = 15;
    result.referralAmount = options.fee * (result.consultancyReferral as number) * 0.01;
    result.doctorReferralAmount =
      options.fee * (100 - (result.consultancyReferral as number)) * 0.01;
  } else if (discountType === "doctor_discount") {
    result.referralAmount = options.discountFee * (options.consultancyReferral * 0.01);
    result.doctorReferralAmount =
      options.discountFee * (100 - options.consultancyReferral) * 0.01;
  } else {
    if (discountType === "online_discount") {
      isDiscountApplied = false;
    } else {
      result.referralAmount =
        options.fee * (options.consultancyReferral - discountPercentage) * 0.01;
      result.doctorReferralAmount =
        options.fee * (100 - options.consultancyReferral) * 0.01;
    }
  }

  if (isDiscountApplied) {
    result.discount = discount;
    result.discountPercentage = discountPercentage;
    result.fee = Math.floor(options.fee - (result.discount as number));
  }

  return result;
}

function shouldShowCallButton(appointment: PatientAppointment): boolean {
  if (appointment.appointmentType === AppointmentType.PHYSICAL) return false;
  if (appointment.appointmentStatus === AppointmentStatus.SCHEDULED) return true;
  if (appointment.showedupAt) {
    const diffInMs = dayjs().diff(dayjs(appointment.showedupAt));
    if (diffInMs <= CALL_BUTTON_SHOW_UP_WINDOW_MS) return true;
  }
  return false;
}

export function createAppointmentResponseDto(appointment: PatientAppointment) {
  const configService = { get: getConfig };
  const { doctor, hospital, doctorListing, ...appointmentData } = appointment;

  return {
    ...appointmentData,
    date: appointment.date ? DateUtil.formatDate(appointment.date) : "",
    time: appointment.time ? DateUtil.formatTime(appointment.time) : "",
    appointmentStatusTitle: appointment.statusDetail?.title || "",
    appointmentSubStatusTitle: appointment.subStatusDetail?.title || "",
    paymentReceivedStatus: appointment.paymentReceived === 1 ? "Paid" : "Unpaid",
    isOnlinePaymentEnabled: Boolean(doctorListing?.isOnlinePaymentEnabled || 0),
    onlineConsultationId: appointment.onlineConsultation?.id ?? 0,
    programId:
      appointment.appointmentType == Program.ONLINE_CONSULTATION
        ? Program.ONLINE_CONSULTATION
        : Program.PHYSICAL_APPOINTMENT,
    doctorProfilePic: DoctorImageUtil.getDoctorImageUrl(
      configService,
      doctor?.id,
      doctor?.profilePic,
      doctor?.gender || 1,
    ),
    isCommutable: Boolean(appointment.isCommutable),
    canShowCallButton: shouldShowCallButton(appointment),
    lat: hospital?.lat ?? 0,
    lng: hospital?.lng ?? 0,
    isLocationVerified: hospital?.locationVerifiedAt !== null,
  };
}

export async function createAppointment(
  input: CreateAppointmentInput,
  wantFullObject: boolean,
  user: { id: number },
): Promise<PatientAppointment | ReturnType<typeof createAppointmentResponseDto>> {
  if (!input.doctorHospitalId) {
    throw new HttpError(400, "Doctor Hospital ID is required");
  }

  const listing = await findDoctorListingById(input.doctorHospitalId);
  const doctor = await findDoctorById(input.doctorId);
  const userId = input.userId;

  if (!listing || !doctor) {
    throw new HttpError(400, "Doctor not found");
  }

  await validateUserAccess(user.id, userId);
  const targetUser = await findUserById(userId);
  if (!targetUser?.phone) {
    throw new HttpError(400, "User not found or phone number missing");
  }

  const doctorId = listing.doctorId;
  const hospitalId = listing.hospitalId;

  await validateSlotAvailability(doctorId, hospitalId, input.date, input.time);
  await validateDuplicateProcessAppointments(targetUser.phone, doctorId, input.date);

  const corporateUser = userId ? await getCorporateUserDetails(userId) : null;
  const userType = input.appointmentUserType || (input.userId ? 1 : 4);
  const isFollowUp = await isFollowUpPatient(targetUser.phone, doctorId);
  const { id: appointmentId, flApptId } = await generateAppointmentId(hospitalId, userType);

  let validPromoCode = null;
  let promoCodeId = null;
  if (input.promoCode) {
    const promoValidation = await validatePromoCode({
      promoCode: input.promoCode,
      programId: Program.PHYSICAL_APPOINTMENT,
      doctorId,
      specialityId: listing.specialityId,
    });
    if (!promoValidation.valid) {
      throw new HttpError(400, promoValidation.message || "Invalid promo code");
    }
    validPromoCode = promoValidation.promoCode;
    promoCodeId = validPromoCode ? BigInt(validPromoCode.id) : null;
  }

  const referralValues = await getReferralValues({
    fee: listing.fee,
    discountFee: listing.discountFee,
    consultancyReferral: listing.consultancyReferral,
    isFree: false,
    promoCode: validPromoCode,
    appointmentType: listing.hospitalType,
    isPersonalAppointment: false,
    isFollowUp,
    isOnlinePaymentEnabled: listing.isOnlinePaymentEnabled,
    isCorporateUser: corporateUser !== null,
    corporateAppointmentDiscount: corporateUser?.appointmentDiscountPercentage,
    corporateConsultationDiscount: corporateUser?.videoConsultationDiscountPercentage,
  });

  const patientRecord = await findOrCreatePatient({
    name: targetUser.name,
    phone: targetUser.phone,
    userId: targetUser.id,
    city: input.patientCity,
    area: input.patientArea,
    uuid: input.uuid as string | undefined,
    visitorSource: input.visitorSource as string | undefined,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
  });

  const { promoCode: _promoCode, ...createAppointmentData } = input;
  const savedAppointment = await insertAppointment({
    ...createAppointmentData,
    id: appointmentId,
    date: dayjs(input.date).format("YYYY-MM-DD") as unknown as Date,
    time: dayjs(`${input.date} ${input.time}`).format("HH:mm:ss"),
    doctorHospitalId: listing.id,
    specialityId: listing.specialityId,
    doctorId: doctor.id,
    doctorName: listing.doctorName,
    doctorPhone: doctor.phone,
    hospitalId,
    fee: referralValues.fee,
    promoCodeId: promoCodeId ? String(promoCodeId) : null,
    patientId: patientRecord.id,
    patientPhone: targetUser.phone,
    patientName: targetUser.name,
    patientAge: patientRecord.age || 0,
    patientCity: patientRecord.city || input.patientCity,
    patientArea: patientRecord.area || input.patientArea,
    hospitalName: listing.hospitalName,
    appointmentType: listing.hospitalType || 1,
    accessToken: StringUtil.generateAccessToken(16),
    flApptId,
    doctorFee: listing.fee,
    referralAmount: referralValues.referralAmount,
    doctorReferralAmount: referralValues.doctorReferralAmount,
    discount: referralValues.discount,
    discountPercentage: referralValues.discountPercentage,
    consultancyReferral: referralValues.consultancyReferral,
    isFree: referralValues.isFree,
    appointmentStatus:
      listing.hospitalType == 1 && listing.directBooking
        ? AppointmentStatus.SCHEDULED
        : AppointmentStatus.IN_PROCESS,
    appointmentSubStatus:
      listing.hospitalType == 1 && listing.directBooking
        ? AppointmentSubStatus.SCHEDULED
        : AppointmentSubStatus.IN_PROCESS,
    day: new Date(input.date).getUTCDate(),
    month: new Date(input.date).getUTCMonth() + 1,
    year: new Date(input.date).getUTCFullYear(),
    addedBy: input.addedBy || user.id,
    updatedBy: input.updatedBy || user.id,
    paymentTimestamps: getDefaultPaymentTimestamps(),
    contractType: listing.contractType,
    ocContractedHospitalId: listing.ocContractedHospitalId,
    isDirectBooking: listing.directBooking,
    followUp: isFollowUp,
    utmSource: "marham-one",
  });

  const richAppointment = wantFullObject
    ? await findAppointmentComplete(savedAppointment.id)
    : await findAppointmentDetailed(savedAppointment.id);

  if (!richAppointment) {
    throw new HttpError(400, "Appointment not found after creation");
  }

  if (validPromoCode) {
    await markPromoCodeAsUsed(validPromoCode.id);
  }

  if (wantFullObject) return richAppointment;
  return createAppointmentResponseDto(richAppointment);
}
