import { z } from "zod";

export const getCallMyDoctorsSchema = z.object({
  specialityId: z.coerce.number().int().positive("specialityId is required"),
  city: z.string().optional(),
});

export type GetCallMyDoctorsInput = z.infer<typeof getCallMyDoctorsSchema>;
