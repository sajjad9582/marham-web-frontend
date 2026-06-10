import { getDataSource } from "@/lib/server/db/get-data-source";
import { DoctorRepository } from "@/lib/server/repositories/doctor.repository";
import { DoctorListingRepository } from "@/lib/server/repositories/doctor-listing.repository";
import { DoctorReviewRepository } from "@/lib/server/repositories/doctor-review.repository";
import { DoctorExperienceRepository } from "@/lib/server/repositories/doctor-experience.repository";
import { DoctorQualificationRepository } from "@/lib/server/repositories/doctor-qualification.repository";
import { SymptomSpecialityRepository } from "@/lib/server/repositories/symptom-speciality.repository";
import { DoctorLeaveRepository } from "@/lib/server/repositories/doctor-leave.repository";
import { AppointmentRepository } from "@/lib/server/repositories/appointment.repository";
import { OnlineConsultationRepository } from "@/lib/server/repositories/online-consultation.repository";
import { PatientRepository } from "@/lib/server/repositories/patient.repository";
import { PromoCodeRepository } from "@/lib/server/repositories/promo-code.repository";
import { UserRepository } from "@/lib/server/repositories/user.repository";
import { UserFriendsAndFamilyRepository } from "@/lib/server/repositories/user-friends-and-family.repository";
import { MedicalShareableRepository } from "@/lib/server/repositories/medical-shareable.repository";
import { CorporateUserRepository } from "@/lib/server/repositories/corporate-user.repository";
import { DoctorsService } from "@/lib/server/services/doctors.service";
import { DoctorAvailabilityService } from "@/lib/server/services/doctor-availability.service";
import { PromoCodeService } from "@/lib/server/services/promo-code.service";
import { UsersService } from "@/lib/server/services/users.service";
import { CorporateService } from "@/lib/server/services/corporate.service";
import { AppointmentsService } from "@/lib/server/services/appointments.service";
import { OnlineConsultationService } from "@/lib/server/services/online-consultation.service";
import { WebOnlineConsultationService } from "@/lib/server/services/web-online-consultation.service";
import { CommunicationsService } from "@/lib/server/services/communications.service";
import { getConfig } from "@/lib/server/config";
import {
  NoopEventEmitter,
  NoopHttpService,
  NoopStorageService,
  NoopPatientRecordFileRepository,
  NoopWhatsappService,
  UserRecentSearchService,
} from "@/lib/server/stubs/noop";

export type ServerServices = {
  doctors: DoctorsService;
  doctorAvailability: DoctorAvailabilityService;
  promoCode: PromoCodeService;
  users: UsersService;
  corporate: CorporateService;
  appointments: AppointmentsService;
  onlineConsultation: OnlineConsultationService;
  webOnlineConsultation: WebOnlineConsultationService;
};

let cached: ServerServices | null = null;

declare global {
  // eslint-disable-next-line no-var
  var __marhamServices: ServerServices | undefined;
}

// HMR: drop stale service graph tied to old entity classes.
if (process.env.NODE_ENV !== "production") {
  cached = null;
  global.__marhamServices = undefined;
}

export async function getServices(): Promise<ServerServices> {
  if (process.env.NODE_ENV === "production" && cached) return cached;
  if (process.env.NODE_ENV !== "production" && global.__marhamServices) {
    return global.__marhamServices;
  }

  const ds = await getDataSource();

  const doctorRepository = new DoctorRepository(ds, { get: getConfig });
  const doctorListingRepository = new DoctorListingRepository(ds);
  const doctorReviewRepository = new DoctorReviewRepository(ds);
  const doctorExperienceRepository = new DoctorExperienceRepository(ds);
  const doctorQualificationRepository = new DoctorQualificationRepository(ds);
  const symptomSpecialityRepository = new SymptomSpecialityRepository(ds);
  const doctorLeaveRepository = new DoctorLeaveRepository(ds);
  const appointmentRepository = new AppointmentRepository(ds);
  const onlineConsultationRepository = new OnlineConsultationRepository(ds);
  const patientRepository = new PatientRepository(ds);
  const promoCodeRepository = new PromoCodeRepository(ds, appointmentRepository);
  const userRepository = new UserRepository(ds);
  const userFriendsAndFamilyRepository = new UserFriendsAndFamilyRepository(ds);
  const medicalShareableRepository = new MedicalShareableRepository(ds);
  const corporateUserRepository = new CorporateUserRepository(ds);

  const corporate = new CorporateService(corporateUserRepository);
  const promoCode = new PromoCodeService(promoCodeRepository);
  const communications = new CommunicationsService();

  const doctors = new DoctorsService(
    doctorRepository,
    doctorListingRepository,
    doctorReviewRepository,
    doctorExperienceRepository,
    doctorQualificationRepository,
    symptomSpecialityRepository,
    new UserRecentSearchService(),
    new NoopHttpService(),
    { get: getConfig },
    corporate,
    undefined,
  );

  const users = new UsersService(
    userRepository,
    medicalShareableRepository,
    userFriendsAndFamilyRepository,
    ds,
    doctors,
  );

  const doctorsWithUsers = new DoctorsService(
    doctorRepository,
    doctorListingRepository,
    doctorReviewRepository,
    doctorExperienceRepository,
    doctorQualificationRepository,
    symptomSpecialityRepository,
    new UserRecentSearchService(),
    new NoopHttpService(),
    { get: getConfig },
    corporate,
    users,
  );

  const doctorAvailability = new DoctorAvailabilityService(
    doctorListingRepository,
    appointmentRepository,
    doctorLeaveRepository,
  );

  const appointments = new AppointmentsService(
    appointmentRepository,
    patientRepository,
    new NoopPatientRecordFileRepository(),
    doctorAvailability,
    doctorsWithUsers,
    users,
    new NoopStorageService(),
    new NoopEventEmitter(),
    { get: getConfig },
    corporate,
    promoCode,
  );

  const onlineConsultation = new OnlineConsultationService(
    appointments,
    onlineConsultationRepository,
    doctorListingRepository,
    doctorAvailability,
    appointmentRepository,
    new NoopWhatsappService(),
    doctorsWithUsers,
    communications,
    new NoopEventEmitter(),
    promoCode,
  );

  appointments.onlineConsultationService = onlineConsultation;

  const webOnlineConsultation = new WebOnlineConsultationService(users, onlineConsultation);

  const result: ServerServices = {
    doctors: doctorsWithUsers,
    doctorAvailability,
    promoCode,
    users,
    corporate,
    appointments,
    onlineConsultation,
    webOnlineConsultation,
  };

  if (process.env.NODE_ENV === "production") {
    cached = result;
  } else {
    global.__marhamServices = result;
  }

  return result;
}
