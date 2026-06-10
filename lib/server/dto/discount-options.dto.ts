import { PromoCode } from '@/lib/server/entities';

export interface DiscountOptions {
    fee: number;
    discountFee: number;
    hospitalType: number;
    isOnlinePaymentEnabled: boolean;
    isCorporateUser: boolean;
    corporateAppointmentDiscount?: number;
    corporateConsultationDiscount?: number;
    promoCode?: PromoCode | null;
}
