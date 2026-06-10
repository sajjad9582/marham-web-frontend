// @ts-nocheck
export { Doctor } from "./doctor.entity";
export { DoctorListing } from "./doctor-listing.entity";
export { DoctorReview } from "./doctor-review.entity";
export { DoctorReviewReply } from "./doctor-review-reply.entity";
export { DoctorAreaOfInterest } from "./doctor-area-of-interest.entity";
export { GlobalAreaOfInterest } from "./global-area-of-interest.entity";
export { DoctorExperience } from "./doctor-experience.entity";
export { DoctorQualification } from "./doctor-qualification.entity";
export { DoctorService } from "./doctor-service.entity";
export { DoctorLeave } from "./doctor-leave.entity";
export { Hospital } from "./hospital.entity";
export { SymptomSpeciality } from "./symptom-speciality.entity";
export { SymptomCategory } from "./symptom-category.entity";
export { Symptom } from "./symptom.entity";
export { Service } from "./service.entity";
export { Disease } from "./disease.entity";
export { PatientAppointment } from "./appointment.entity";
export { AppointmentStatus } from "./appointment-status.entity";
export { AppointmentSubStatus } from "./appointment-sub-status.entity";
export { OnlineConsultation } from "./online-consultation.entity";
export { PatientAppointmentMedicine } from "./patient-appointment-medicine.entity";
export { PatientAppointmentTest } from "./patient-appointment-test.entity";
export { PatientRecordFile } from "./patient-record-file.entity";
export { Patient } from "./patient.entity";
export { PromoCode } from "./promo-code.entity";
export { User } from "./user.entity";
export { UserFriendsAndFamily } from "./user-friends-and-family.entity";
export { MedicalShareable } from "./medical-shareable.entity";
export { CorporateUser } from "./corporate-user.entity";
export { Speciality } from "./speciality.entity";

import { Doctor } from "./doctor.entity";
import { DoctorListing } from "./doctor-listing.entity";
import { DoctorReview } from "./doctor-review.entity";
import { DoctorReviewReply } from "./doctor-review-reply.entity";
import { DoctorAreaOfInterest } from "./doctor-area-of-interest.entity";
import { GlobalAreaOfInterest } from "./global-area-of-interest.entity";
import { DoctorExperience } from "./doctor-experience.entity";
import { DoctorQualification } from "./doctor-qualification.entity";
import { DoctorService } from "./doctor-service.entity";
import { DoctorLeave } from "./doctor-leave.entity";
import { Hospital } from "./hospital.entity";
import { SymptomSpeciality } from "./symptom-speciality.entity";
import { SymptomCategory } from "./symptom-category.entity";
import { Symptom } from "./symptom.entity";
import { Service } from "./service.entity";
import { Disease } from "./disease.entity";
import { PatientAppointment } from "./appointment.entity";
import { AppointmentStatus } from "./appointment-status.entity";
import { AppointmentSubStatus } from "./appointment-sub-status.entity";
import { OnlineConsultation } from "./online-consultation.entity";
import { PatientAppointmentMedicine } from "./patient-appointment-medicine.entity";
import { PatientAppointmentTest } from "./patient-appointment-test.entity";
import { PatientRecordFile } from "./patient-record-file.entity";
import { Patient } from "./patient.entity";
import { PromoCode } from "./promo-code.entity";
import { User } from "./user.entity";
import { UserFriendsAndFamily } from "./user-friends-and-family.entity";
import { MedicalShareable } from "./medical-shareable.entity";
import { CorporateUser } from "./corporate-user.entity";
import { Speciality } from "./speciality.entity";

export const entities = [
  Doctor,
  DoctorListing,
  DoctorReview,
  DoctorReviewReply,
  DoctorAreaOfInterest,
  GlobalAreaOfInterest,
  DoctorExperience,
  DoctorQualification,
  DoctorService,
  DoctorLeave,
  Hospital,
  SymptomSpeciality,
  SymptomCategory,
  Symptom,
  Service,
  Disease,
  PatientAppointment,
  AppointmentStatus,
  AppointmentSubStatus,
  OnlineConsultation,
  PatientAppointmentMedicine,
  PatientAppointmentTest,
  PatientRecordFile,
  Patient,
  PromoCode,
  User,
  UserFriendsAndFamily,
  MedicalShareable,
  CorporateUser,
  Speciality,
];

/** Prevent Next.js server minification from breaking TypeORM string-based relations. */
export function preserveEntityClassNames() {
  const names = [
    "Doctor",
    "DoctorListing",
    "DoctorReview",
    "DoctorReviewReply",
    "DoctorAreaOfInterest",
    "GlobalAreaOfInterest",
    "DoctorExperience",
    "DoctorQualification",
    "DoctorService",
    "DoctorLeave",
    "Hospital",
    "SymptomSpeciality",
    "SymptomCategory",
    "Symptom",
    "Service",
    "Disease",
    "PatientAppointment",
    "AppointmentStatus",
    "AppointmentSubStatus",
    "OnlineConsultation",
    "PatientAppointmentMedicine",
    "PatientAppointmentTest",
    "PatientRecordFile",
    "Patient",
    "PromoCode",
    "User",
    "UserFriendsAndFamily",
    "MedicalShareable",
    "CorporateUser",
    "Speciality",
  ] as const;

  names.forEach((name, index) => {
    Object.defineProperty(entities[index], "name", { value: name, configurable: true });
  });
}
