import type { PromoCodeRow } from "@/lib/db/queries/promo-codes";
import { HospitalType } from "@/lib/db/enums/hospital-type.enum";

export type DiscountOptions = {
  fee: number;
  discountFee?: number;
  hospitalType?: number;
  isOnlinePaymentEnabled?: boolean;
  isCorporateUser?: boolean;
  corporateAppointmentDiscount?: number;
  corporateConsultationDiscount?: number;
  promoCode?: PromoCodeRow;
};

export type DiscountResult = {
  finalDiscountFee: number;
  discountPercentage: number;
  discountType?: string;
  isDiscountApplied?: boolean;
};

export async function calculateDiscount(options: DiscountOptions): Promise<DiscountResult> {
  const isDoctorDiscount = Boolean(options.discountFee) && options.discountFee! < options.fee;
  let finalFee = isDoctorDiscount ? options.discountFee! : options.fee;
  let discountPercentage = 0;
  let finalDiscountFee = 0;
  let discountType = "";

  if (options.promoCode) {
    const promoDiscount = Math.floor(
      finalFee * (Number(options.promoCode.discountPercentage) / 100),
    );
    return {
      finalDiscountFee: finalFee - promoDiscount,
      discountPercentage: Number(options.promoCode.discountPercentage),
      discountType: "promo_code",
      isDiscountApplied: true,
    };
  }

  if (options.isCorporateUser) {
    let corpPercentage = 0;
    if (options.hospitalType === HospitalType.ONLINE) {
      corpPercentage =
        options.corporateConsultationDiscount !== undefined
          ? options.corporateConsultationDiscount
          : 0;
    } else {
      corpPercentage =
        options.corporateAppointmentDiscount !== undefined
          ? options.corporateAppointmentDiscount
          : 0;
    }

    if (corpPercentage > 0) {
      discountPercentage = corpPercentage;
      finalDiscountFee = Math.round(finalFee - finalFee * (corpPercentage / 100));
      discountType = "corporate_discount";
    } else {
      finalDiscountFee = finalFee;
    }
  } else if (isDoctorDiscount) {
    finalDiscountFee = options.discountFee!;
    discountPercentage = Math.round(((options.fee - options.discountFee!) / options.fee) * 100);
    discountType = "doctor_discount";
  } else {
    const marhamDiscount =
      options.hospitalType === HospitalType.PHYSICAL
        ? Number(process.env.MARHAM_PHYSICAL_APPOINTMENT_DISCOUNT_PERCENTAGE || 0)
        : Number(process.env.MARHAM_VIDEO_CONSULTATION_DISCOUNT_PERCENTAGE || 0);
    if (marhamDiscount > 0) {
      discountPercentage = marhamDiscount;
      finalDiscountFee = Math.round(finalFee - finalFee * (marhamDiscount / 100));
      discountType = "marham_discount";
    }
  }

  return {
    finalDiscountFee,
    discountPercentage,
    discountType,
    isDiscountApplied: discountPercentage > 0 || finalDiscountFee > 0,
  };
}
