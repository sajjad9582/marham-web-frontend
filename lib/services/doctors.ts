// @ts-nocheck
import { HttpError } from "@/lib/api/http-error";
import { getCorporateUserDetails } from "@/lib/services/corporate";
import { calculateDiscount } from "@/lib/services/discounts";
import {
  findDoctorById as findDoctorRowById,
  findDoctorListingById as findDoctorListingRowById,
  findDoctorProfile,
  findDoctorsWithFilters,
  findHospitalsByDoctors,
  getDoctorDiseases,
  getDoctorExperiences,
  getDoctorHospitals,
  getDoctorQualifications,
  getDoctorReviewStats,
  getDoctorReviews as queryDoctorReviews,
  getDoctorServices,
} from "@/lib/db/queries/doctors";
import { isDoctorFavorited } from "@/lib/db/queries/medical-shareables";
import { getSpecialityIdsBySymptom } from "@/lib/db/queries/symptom-specialities";
import type { GetDoctorsInput } from "@/lib/schemas/doctors";
import { HtmlUtil, DateUtil } from "@/lib/db/utils";
import { ReviewMapperUtil } from "@/lib/db/utils/review-mapper.util";
import { DoctorBadgesUtil } from "@/lib/db/utils/doctor-badges.util";
import type { DoctorSearchParams } from "@/lib/db/interfaces/doctor-search-params.interface";

function generateDoctorFaqs(doctor: Record<string, unknown>, hospitals: Record<string, unknown>[]) {
  let faqs = "";

  if (hospitals.length > 0) {
    faqs += `### How to book an appointment with ${doctor.name}?\n`;
    faqs += `Call at 0311 - 1222398. You do not have to pay any extra fee for booking an appointment through Marham.\n\n`;
    faqs += `-- -\n\n`;
  }

  if (doctor.degree) {
    faqs += `### What is the Qualification of ${doctor.name}?\n`;
    faqs += `${doctor.name} has the following degrees: ${doctor.degree} \n\n`;
    faqs += `-- -\n\n`;
  }

  faqs += `### What is ${doctor.name} 's speciality & area of expertise?\n`;
  faqs += `${doctor.name} is a specialist.\n\n`;
  faqs += `---\n\n`;

  faqs += `### What is ${doctor.name}'s contact number?\n`;
  faqs += `You can contact the doctor through Marham's helpline: [0311-1222398](tel:0311-1222398) and we'll connect you with ${doctor.name}\n\n`;
  faqs += `---\n\n`;

  if (hospitals.length > 0 && hospitals[0].fee) {
    faqs += `### What is the fee of ${doctor.name}?\n`;
    faqs += `${doctor.name} charges Rs. ${hospitals[0].fee} for consultation.\n\n`;
    faqs += `---\n\n`;
  }

  if (hospitals.length > 0) {
    faqs += `### Practice timings of ${doctor.name} are:\n`;
    const hospitalGroups = new Map<string, Record<string, unknown>[]>();

    hospitals.forEach((hospital) => {
      const hospitalName = (hospital.hospitalName as string) || "Hospital";
      if (!hospitalGroups.has(hospitalName)) {
        hospitalGroups.set(hospitalName, []);
      }
      hospitalGroups.get(hospitalName)!.push(hospital);
    });

    hospitalGroups.forEach((hospitalListings, hospitalName) => {
      faqs += `\n**${hospitalName}**\n\n`;
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const dayTimings = new Map<string, string[]>();

      dayKeys.forEach((dayKey, index) => {
        const timeSlotsForDay: string[] = [];
        hospitalListings.forEach((listing) => {
          if (listing[dayKey] && listing.startTime && listing.endTime) {
            const timeSlot = `${listing.startTime} - ${listing.endTime}`;
            if (!timeSlotsForDay.includes(timeSlot)) {
              timeSlotsForDay.push(timeSlot);
            }
          }
        });
        if (timeSlotsForDay.length > 0) {
          dayTimings.set(days[index], timeSlotsForDay);
        }
      });

      dayTimings.forEach((timeSlots, dayName) => {
        faqs += `**${dayName}**\n`;
        timeSlots.forEach((timeSlot) => {
          faqs += `- ${timeSlot}\n`;
        });
        faqs += `\n`;
      });
    });
  }

  return faqs;
}

async function getDoctorReviews(
  doctorId: number,
  limit = 100,
  page = 1,
  isPublished = 1,
) {
  const profile = await findDoctorProfile(doctorId);
  if (!profile) {
    throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
  }

  const skip = (page - 1) * limit;
  const reviews = await queryDoctorReviews(doctorId, skip, limit, isPublished);

  return reviews.map((review) => ({
    ...review,
    waitingTime: ReviewMapperUtil.getWaitingTime(review.waitingTime),
    appointmentDuration: ReviewMapperUtil.getAppointmentDuration(review.appointmentDuration),
  }));
}

export async function getDoctorListing(
  query: GetDoctorsInput,
  userId?: number,
  isOnPanelOnly = true,
) {
  const {
    specialityId,
    city,
    area,
    page = 1,
    symptomId,
    serviceId,
    diseaseId,
    minFee,
    maxFee,
    gender,
    isFree,
    lat,
    lng,
    consultationType,
    sortBy,
    sortDirection,
    availableToday,
    hospitalId,
  } = query;

  const limit = 12;
  const skip = (page - 1) * limit;

  let specialityIds: number[] = [];

  if (symptomId) {
    specialityIds = await getSpecialityIdsBySymptom(symptomId);
    if (specialityIds.length === 0) {
      throw new HttpError(
        400,
        `No specialities found for symptom ID ${symptomId}. This symptom may not be associated with any medical specialities.`,
      );
    }
  } else if (specialityId) {
    specialityIds = [specialityId];
  }

  const filters: DoctorSearchParams = {
    specialityIds,
    serviceId,
    diseaseId,
    city,
    area,
    minFee,
    maxFee,
    gender,
    isFree,
    lat,
    lng,
    consultationType,
    sortBy,
    sortDirection,
    availableToday,
    limit,
    skip,
    isOnPanelOnly,
    hospitalId,
  };

  const [doctors, total] = await findDoctorsWithFilters(filters);
  const doctorIds = doctors.map((d) => d.id);

  let hospitals: Record<string, unknown>[] = [];
  if (doctorIds.length > 0) {
    hospitals = await findHospitalsByDoctors({ doctorIds, city, area });
  }

  const corporateUser = userId ? await getCorporateUserDetails(userId) : null;

  const hospitalsWithDiscounts = await Promise.all(
    hospitals.map(async (hospital) => {
      const { finalDiscountFee, discountPercentage } = await calculateDiscount({
        fee: hospital.fee,
        discountFee: hospital.discountFee,
        hospitalType: hospital.hospitalType,
        isOnlinePaymentEnabled: hospital.isOnlinePaymentEnabled,
        isCorporateUser: corporateUser !== null,
        corporateAppointmentDiscount: corporateUser?.appointmentDiscountPercentage,
        corporateConsultationDiscount: corporateUser?.videoConsultationDiscountPercentage,
      });
      return { ...hospital, finalDiscountFee, discountPercentage };
    }),
  );

  const hospitalsByDoctor = hospitalsWithDiscounts.reduce(
    (acc, hospital) => {
      if (!acc[hospital.doctorId]) acc[hospital.doctorId] = [];
      acc[hospital.doctorId].push({
        doctorHospitalId: hospital.id,
        doctorId: hospital.doctorId,
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.hospitalName,
        hospitalType: hospital.hospitalType,
        hospitalArea: hospital.hospitalArea,
        hospitalCity: hospital.hospitalCity,
        fee: hospital.fee,
        isOnlinePaymentEnabled: hospital.isOnlinePaymentEnabled,
        discountFee: hospital.fee != hospital.finalDiscountFee ? hospital.finalDiscountFee : 0,
        discount: hospital.finalDiscountFee ? hospital.fee - hospital.finalDiscountFee : 0,
        discountPercentage: hospital.discountPercentage || 0,
        lat: hospital.hospital?.lat,
        lng: hospital.hospital?.lng,
        isLocationVerified: hospital.hospital?.locationVerifiedAt !== null,
      });
      return acc;
    },
    {} as Record<number, Record<string, unknown>[]>,
  );

  const formattedData = doctors.map((doc) => ({
    doctorId: doc.id,
    name: doc.name,
    experience: doc.experience,
    profilePic: doc.profilePic,
    areasOfInterest: doc.areasOfInterest,
    firstComeFirstServe: doc.firstComeFirstServe,
    satisfactionScore: doc.diagnosisScore || 0,
    rating: doc.rating || 0,
    specialityId: Number(doc.specialityId),
    specialityName: doc.specialityName,
    diagnosisScore: doc.diagnosisScore,
    degree: doc.degree,
    reviewsCount: doc.totalReviews,
    isPromotional: DoctorBadgesUtil.isPromotional(doc.id),
    isTopBooked: DoctorBadgesUtil.isTopBooked(doc.id),
    hospitals: hospitalsByDoctor[doc.id] || [],
  }));

  return {
    doctors: formattedData,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}

export async function getDoctorProfile(doctorId: number, userId?: number) {
  const profile = await findDoctorProfile(doctorId);
  if (!profile) {
    throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
  }

  const corporateUser = userId ? await getCorporateUserDetails(userId) : null;
  const rawHospitalsData = await getDoctorHospitals(doctorId);

  const hospitals = await Promise.all(
    rawHospitalsData.map(async (obj) => {
      const { finalDiscountFee, discountPercentage } = await calculateDiscount({
        fee: obj.fee,
        discountFee: obj.discountFee,
        hospitalType: obj.hospitalType,
        isOnlinePaymentEnabled: obj.isOnlinePaymentEnabled,
        isCorporateUser: corporateUser !== null,
        corporateAppointmentDiscount: corporateUser?.appointmentDiscountPercentage,
        corporateConsultationDiscount: corporateUser?.videoConsultationDiscountPercentage,
      });
      const { hospital, ...otherValues } = obj;
      return {
        ...otherValues,
        discountFee: obj.fee != finalDiscountFee ? finalDiscountFee : 0,
        discount: finalDiscountFee ? obj.fee - finalDiscountFee : 0,
        discountPercentage: discountPercentage || 0,
        doctorHospitalId: obj.id,
        isLocationVerified: hospital?.locationVerifiedAt !== null,
      };
    }),
  );

  profile.specialityId = hospitals[0]?.specialityId;
  const reviews = await getDoctorReviews(doctorId, 3, 1, 1);
  const reviewStats = await getDoctorReviewStats(doctorId);
  const experiences = await getDoctorExperiences(doctorId);
  const qualifications = await getDoctorQualifications(doctorId);
  const normalizedExperiences = DateUtil.normalizeDates(experiences);
  const normalizedQualifications = DateUtil.normalizeDates(qualifications);
  const services = await getDoctorServices(doctorId);
  const diseases = await getDoctorDiseases(profile.specialityId);
  const faqs = generateDoctorFaqs(profile, hospitals);
  const aboutMeMarkdown = profile.aboutMe ? HtmlUtil.convertHtmlToMarkdown(profile.aboutMe) : null;

  let addedToFavourites = false;
  if (userId) {
    addedToFavourites = await isDoctorFavorited(userId, doctorId);
  }

  profile.averageWaitingTime = profile.averageWaitingTime ?? "";
  profile.averageAppointmentTime = profile.averageAppointmentTime ?? "";
  profile.patientSatisfactionScore = Math.round(reviewStats.positive_satisfaction_score * 0.01 * 5);
  profile.diagnosisScore = Math.round(profile.diagnosisScore * 0.01 * 5);
  profile.staffScore = Math.round(profile.staffScore * 0.01 * 5);
  profile.clinicEnvironmentScore = Math.round(reviewStats.inclinic_score);
  const specialityName = hospitals[0]?.specialityName || "";
  const similarSpecialities = hospitals[0]?.similarSpecialities || "";
  const categoryName = hospitals[0]?.categoryName || "";
  profile.rating = profile.rating ?? 0;

  return {
    ...profile,
    aboutMe: aboutMeMarkdown,
    addedToFavourites,
    isPromotional: DoctorBadgesUtil.isPromotional(doctorId),
    isTopBooked: DoctorBadgesUtil.isTopBooked(doctorId),
    hospitals,
    reviews,
    experiences: normalizedExperiences,
    qualifications: normalizedQualifications,
    services,
    diseases,
    categoryName,
    specialityName,
    similarSpecialities,
    faqs,
  };
}

export async function findDoctorById(doctorId: number) {
  const found = await findDoctorRowById(doctorId);
  if (!found) {
    throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
  }
  return found;
}

export async function findDoctorListingById(id: number) {
  return findDoctorListingRowById(id);
}
