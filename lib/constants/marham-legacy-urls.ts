export const MARHAM_LEGACY_PATHS = {
  DOCTOR_PROFILE: "/online-consultation/{specialitySlug}/{citySlug}/{doctorSlug}-{doctorId}",
  VIDEO_CALL_REQUEST: "/online-consultation/request",
  BOOK_APPOINTMENT: "/online-consultation/{specialitySlug}/{citySlug}/{doctorSlug}-{doctorId}/callcenter",
  CALLCENTER: "/doctors/{hospitalCitySlug}/{specialitySlug}/{doctorSlug}/callcenter",
} as const;
