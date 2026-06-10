import {
  checkPromoCode,
  findPromoCodeById,
  getPromoCodeAppointmentCount,
  markPromoCodeClaimed,
  type PromoCodeRow,
} from "@/lib/db/queries/promo-codes";
import type { ValidatePromoCodeInput } from "@/lib/schemas/promo-codes";
import { Program, PromoCodeRestriction, PromoCodeValidity } from "@/lib/db/enums";

export type PromoCode = PromoCodeRow;

export async function validatePromoCode(
  input: ValidatePromoCodeInput,
): Promise<{ valid: boolean; promoCode?: PromoCode; message?: string }> {
  const { promoCode, programId, doctorId, specialityId, orderId = 0 } = input;
  const date = new Date().toISOString().split("T")[0];

  const code = await checkPromoCode(promoCode, date);
  if (!code) {
    return { valid: false, message: "Invalid or expired promo code" };
  }

  if (programId && !isValidForType(code, programId)) {
    return { valid: false, message: "Promo code is not applicable for this service" };
  }

  const isValid = await checkValidity(code, programId, orderId ?? 0);
  if (!isValid) {
    return { valid: false, message: "Promo code has already been used or is no longer valid" };
  }

  if (code.isSpecialityOrDoctor) {
    const isVerified = isVerifiedForService(
      code,
      specialityId ?? 0,
      doctorId ?? 0,
      orderId ?? 0,
    );
    if (!isVerified) {
      return { valid: false, message: "Promo code is not valid for this doctor or speciality" };
    }
  }

  return { valid: true, promoCode: code };
}

export async function markPromoCodeAsUsed(promoCodeId: number): Promise<void> {
  const promo = await findPromoCodeById(promoCodeId);
  if (promo && promo.validity === PromoCodeValidity.ONETIME) {
    await markPromoCodeClaimed(promoCodeId);
  }
}

function isValidForType(promoCode: PromoCode, applicableOnId: number): boolean {
  const applicableOn = promoCode.applicableOn as number[] | null;
  return applicableOn?.includes(applicableOnId) ?? false;
}

async function checkValidity(
  promoCode: PromoCode,
  programId: number,
  orderId: number,
): Promise<boolean> {
  if (promoCode.usageCount > 0) {
    return (
      isValidForType(promoCode, programId) &&
      (await isValidUsageCount(promoCode, programId)) &&
      !promoCode.claimedAt &&
      isValidityOfTime(promoCode)
    );
  }

  if (programId === Program.CORPORATE_SUBSCRIPTION) {
    return (
      isValidForType(promoCode, programId) &&
      !promoCode.claimedAt &&
      isValidityOfTime(promoCode)
    );
  }

  return isValidForType(promoCode, programId) && !promoCode.claimedAt && isValidityOfTime(promoCode);
}

async function isValidUsageCount(promoCode: PromoCode, programId: number): Promise<boolean> {
  if (isValidForType(promoCode, Program.CORPORATE_SUBSCRIPTION)) {
    return promoCode.usageCount > 0;
  }
  const appointmentCount = await getPromoCodeAppointmentCount(BigInt(promoCode.id));
  return promoCode.usageCount > appointmentCount;
}

function isValidityOfTime(promoCode: PromoCode): boolean {
  const today = new Date().toISOString().split("T")[0];
  if (promoCode.validFrom && promoCode.validTo) {
    const validFrom = new Date(promoCode.validFrom).toISOString().split("T")[0];
    const validTo = new Date(promoCode.validTo).toISOString().split("T")[0];
    return validFrom <= today && validTo >= today;
  }
  if (!promoCode.validFrom && !promoCode.validTo) return true;
  return false;
}

function isVerifiedForService(
  promoCode: PromoCode,
  specialityId: number,
  doctorId: number,
  orderId: number,
): boolean {
  if (!orderId) {
    if (promoCode.isSpecialityOrDoctor === PromoCodeRestriction.SPECIALITY && specialityId) {
      return isValidForSpeciality(promoCode, specialityId);
    }
    if (promoCode.isSpecialityOrDoctor === PromoCodeRestriction.DOCTOR && doctorId) {
      return isValidForDoctor(promoCode, doctorId);
    }
  } else if (isValidForType(promoCode, Program.CORPORATE_SUBSCRIPTION)) {
    return isValidForSubscription(promoCode, orderId);
  }
  return false;
}

function isValidForSpeciality(promoCode: PromoCode, specialityId: number): boolean {
  if (!promoCode.specialityOrDoctorData) return false;
  const specialityData = promoCode.specialityOrDoctorData.split(",").map((id) => parseInt(id.trim()));
  return specialityData.includes(specialityId);
}

function isValidForDoctor(promoCode: PromoCode, doctorId: number): boolean {
  if (!promoCode.specialityOrDoctorData) return false;
  const doctorIds = promoCode.specialityOrDoctorData.split(",").map((id) => parseInt(id.trim()));
  return doctorIds.includes(doctorId);
}

function isValidForSubscription(promoCode: PromoCode, subscriptionId: number): boolean {
  if (!promoCode.specialityOrDoctorData) return false;
  const ids = promoCode.specialityOrDoctorData.split(",").map((id) => parseInt(id.trim()));
  return ids.includes(subscriptionId);
}
