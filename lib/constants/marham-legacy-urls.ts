export const MARHAM_LEGACY_PATHS = {
  DOCTOR_PROFILE: "/online-consultation/{specialitySlug}/{citySlug}/{doctorSlug}-{doctorId}",
  VIDEO_CALL_REQUEST: "/online-consultation/request",
  CALLCENTER: "/doctors/{hospitalCitySlug}/{specialitySlug}/{doctorSlug}/callcenter",
} as const;
