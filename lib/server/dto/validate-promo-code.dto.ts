export type ValidatePromoCodeDto = {
  promoCode: string;
  programId: number;
  doctorId?: number;
  specialityId?: number;
  orderId?: number;
};
