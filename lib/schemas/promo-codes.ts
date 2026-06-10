import { z } from "zod";

export const validatePromoCodeSchema = z.object({
  promoCode: z.string().min(1, "promoCode is required"),
  programId: z.coerce.number().int().positive("programId is required"),
  doctorId: z.coerce.number().int().positive().optional(),
  specialityId: z.coerce.number().int().positive().optional(),
  orderId: z.coerce.number().int().positive().optional(),
});

export type ValidatePromoCodeInput = z.infer<typeof validatePromoCodeSchema>;
