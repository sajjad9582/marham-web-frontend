export {
  fetchDoctorsListing,
  type FetchDoctorsListingOptions,
  type FetchDoctorsListingResult,
} from "@/lib/client/doctors-listing-service";
export { validatePromoCode, type ValidatePromoCodeParams } from "@/lib/client/promo-code-service";
export {
  fetchDoctorAvailableSlots,
  fetchFirstAvailableSlot,
  type FetchDoctorAvailableSlotsOptions,
} from "@/lib/client/doctor-slots-service";
export {
  fetchDoctorProfileHospitals,
  resolveHospitalIds,
} from "@/lib/client/doctor-profile-service";
export {
  bookPhysicalAppointment,
  bookVideoConsultation,
  type BookPhysicalAppointmentParams,
  type BookVideoConsultationParams,
} from "@/lib/client/web-booking-service";
