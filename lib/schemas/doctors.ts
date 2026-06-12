import { z } from "zod";

const optionalInt = z.coerce.number().int().optional();
const optionalFloat = z.coerce.number().optional();

export const getDoctorsSchema = z.object({
  specialityId: optionalInt,
  city: z.string().optional(),
  area: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  symptomId: optionalInt,
  serviceId: optionalInt,
  diseaseId: optionalInt,
  minFee: optionalFloat,
  maxFee: optionalFloat,
  gender: z.enum(["male", "female", "all"]).optional(),
  isFree: z
    .enum(["true", "false", "1", "0"])
    .transform((v) => v === "true" || v === "1")
    .optional(),
  lat: optionalFloat,
  lng: optionalFloat,
  consultationType: optionalInt,
  sortBy: z.enum(["fee", "experience"]).optional(),
  sortDirection: z.enum(["ASC", "DESC"]).optional(),
  availableToday: z
    .enum(["true", "false", "1", "0"])
    .transform((v) => v === "true" || v === "1")
    .optional(),
  timeSlot: z.coerce.number().int().min(0).max(2359).optional(),
  discounts: z
    .enum(["true", "false", "1", "0"])
    .transform((v) => v === "true" || v === "1")
    .optional(),
  hospitalId: optionalInt,
  doctorslug: z.string().optional(),
});

export const getDoctorProfileSchema = z.object({
  doctorId: z.coerce.number().int().positive("doctorId is required"),
});

export const getDoctorAvailableSlotsSchema = z.object({
  doctorId: z.coerce.number().int().positive("doctorId is required"),
  hospitalId: z.coerce.number().int().positive("hospitalId is required"),
  date: z.string().optional(),
  days: z.coerce.number().int().positive().optional(),
});

export type GetDoctorsInput = z.infer<typeof getDoctorsSchema>;
export type GetDoctorProfileInput = z.infer<typeof getDoctorProfileSchema>;
export type GetDoctorAvailableSlotsInput = z.infer<typeof getDoctorAvailableSlotsSchema>;
