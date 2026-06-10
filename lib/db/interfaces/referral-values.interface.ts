import type { PromoCodeRow } from "@/lib/db/queries/promo-codes";

export interface ReferralOptions {
    fee: number;
    discountFee: number;
    consultancyReferral: number;
    isFree: boolean;
    appointmentType: number;
    isPersonalAppointment: boolean;
    isFollowUp: boolean;
    isOnlinePaymentEnabled: boolean;
    promoCode?: PromoCodeRow | null | undefined;
    isCorporateUser?: boolean;
    corporateAppointmentDiscount?: number;
    corporateConsultationDiscount?: number;
}
