export {
  fetchDoctorsListing,
  type FetchDoctorsListingOptions,
  type FetchDoctorsListingResult,
} from "@/lib/services/doctors-listing-service";
export { validatePromoCode, type ValidatePromoCodeParams } from "@/lib/services/promo-code-service";
export {
  fetchDoctorAvailableSlots,
  fetchFirstAvailableSlot,
  type FetchDoctorAvailableSlotsOptions,
} from "@/lib/services/doctor-slots-service";
export {
  fetchDoctorProfileHospitals,
  resolveHospitalIds,
} from "@/lib/services/doctor-profile-service";
export {
  bookVideoConsultation,
  type BookVideoConsultationParams,
} from "@/lib/services/web-booking-service";
