export const MARHAM_API_ENDPOINTS = {
  DOCTORS_LISTING: "/api/doctors/listing",
  DOCTORS_PROFILE: "/api/doctors/profile",
  DOCTORS_AVAILABLE_SLOTS: "/api/doctors/available-slots",
  PROMO_CODES_VALIDATE: "/api/promo-codes/validate",
  WEB_ONLINE_CONSULTATION_BOOK: "/api/web/online-consultation/book",
} as const;

export const ONLINE_CONSULTATION_PROGRAM_ID = 4;
///api/mobile/doctor/listing?id=29&searchFilter=Speciality