import { z } from "zod";

export const webBookOnlineConsultationSchema = z.object({
  doctorId: z.coerce.number().int().positive("doctorId is required"),
  doctorHospitalId: z.coerce.number().int().positive().optional(),
  date: z.string().min(1, "date is required"),
  time: z.string().min(1, "time is required"),
  patientPhone: z.string().min(1, "patientPhone is required"),
  patientName: z.string().min(1, "patientName is required"),
  promoCode: z.string().optional(),
  appType: z.coerce.number().int().optional(),
  deviceType: z.coerce.number().int().optional(),
});

export const createOnlineConsultationSchema = z.object({
  doctorId: z.number().int().positive(),
  date: z.string(),
  time: z.string(),
  userId: z.number().int().positive(),
  appType: z.number().int(),
  deviceType: z.number().int(),
  promoCode: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type WebBookOnlineConsultationInput = z.infer<typeof webBookOnlineConsultationSchema>;
export type CreateOnlineConsultationInput = z.infer<typeof createOnlineConsultationSchema>;

export type CreateAppointmentInput = {
  doctorHospitalId: number;
  doctorId: number;
  date: string;
  time: string;
  userId: number;
  addedBy?: number;
  deviceType?: number;
  appType?: number;
  patientCity?: string;
  patientArea?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  promoCode?: string;
  appointmentUserType?: number;
};
