export const MARHAM_API_ENDPOINTS = {
  DOCTORS_LISTING: `${process.env.NEXT_PUBLIC_MARHAM_API_PREFIX}/doctors/listing`,
  DOCTORS_PROFILE: `${process.env.NEXT_PUBLIC_MARHAM_API_PREFIX}/doctors/profile`,
  DOCTORS_AVAILABLE_SLOTS: `${process.env.NEXT_PUBLIC_MARHAM_API_PREFIX}/doctors/available-slots`,
  PROMO_CODES_VALIDATE: `${process.env.NEXT_PUBLIC_MARHAM_API_PREFIX}/promo-codes/validate`,
  WEB_ONLINE_CONSULTATION_BOOK: `${process.env.NEXT_PUBLIC_MARHAM_API_PREFIX}/web/online-consultation/book`,
  WEB_APPOINTMENT_BOOK: `${process.env.NEXT_PUBLIC_MARHAM_API_PREFIX}/web/appointment/book`,
} as const;

export const ONLINE_CONSULTATION_PROGRAM_ID = 4;