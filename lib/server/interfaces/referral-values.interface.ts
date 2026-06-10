import { PromoCode } from '@/lib/server/entities';

export interface ReferralOptions {
    fee: number;
    discountFee: number;
    consultancyReferral: number;
    isFree: boolean;
    appointmentType: number;
    isPersonalAppointment: boolean;
    isFollowUp: boolean;
    isOnlinePaymentEnabled: boolean;
    promoCode?: PromoCode | null | undefined;
    isCorporateUser?: boolean;
    corporateAppointmentDiscount?: number;
    corporateConsultationDiscount?: number;
}
