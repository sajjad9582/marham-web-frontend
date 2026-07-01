import { z } from "zod";

/**
 * Request body for POST /api/ai/booking-assistant.
 *
 * `message` is the patient's free-text request, e.g.
 *   "I have had a headache for 3 days. I want an experienced doctor near DHA
 *    Lahore after 6 PM tomorrow".
 * `city` is an optional hint from the UI (e.g. the city the user has already
 * selected on the site) used as a fallback when the message doesn't name one.
 */
export const bookingAssistantSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Please describe what you need in a few words")
    .max(1000, "Message is too long"),
  city: z.string().trim().optional(),
});

export type BookingAssistantInput = z.infer<typeof bookingAssistantSchema>;

/**
 * Shape the LLM must return. Everything is nullable/optional because the patient
 * may not mention every field. We deliberately ask the model for *natural-language*
 * `symptomText` / `specialityText` rather than ids — ids are resolved against the
 * real `symptoms` / `specialities` tables in the service, so the model can never
 * invent a non-existent id.
 */
export const bookingIntentSchema = z.object({
  /** The patient's symptom in plain words, e.g. "headache". */
  symptomText: z.string().nullish(),
  /** A doctor type/speciality if the patient named one, e.g. "neurologist". */
  specialityText: z.string().nullish(),
  city: z.string().nullish(),
  area: z.string().nullish(),
  gender: z.enum(["male", "female", "all"]).nullish(),
  /** True when the patient wants an experienced/senior doctor. */
  experiencePreferred: z.boolean().nullish(),
  /** 1 = physical/in-clinic, 2 = online/video. */
  consultationType: z.union([z.literal(1), z.literal(2)]).nullish(),
  /** Resolved appointment date in YYYY-MM-DD (Asia/Karachi). */
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  /** Earliest acceptable time in 24h HH:mm, e.g. "18:00" for "after 6 PM". */
  earliestTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullish(),
  /** One-line plain-language recap of what the model understood. */
  summary: z.string().nullish(),
  /** A follow-up question when the request is too vague to search. */
  clarification: z.string().nullish(),
});

export type BookingIntent = z.infer<typeof bookingIntentSchema>;
