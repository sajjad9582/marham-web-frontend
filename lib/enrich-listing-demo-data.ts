import { VIDEO_HOSPITAL_NAME } from "@/lib/constants/doctor-listing";
import type { ApiDoctor, ApiHospital } from "@/lib/types/marham-api";

const DEMO_DISCOUNT_PERCENTAGE = 10;

function isVideoHospital(hospital: ApiHospital): boolean {
  return (
    hospital.hospitalType === 2 ||
    hospital.hospitalName?.trim().toLowerCase() === VIDEO_HOSPITAL_NAME.toLowerCase()
  );
}

function hasNoDiscount(hospital: ApiHospital): boolean {
  return (
    hospital.discountFee === 0 &&
    hospital.discount === 0 &&
    hospital.discountPercentage === 0
  );
}

function applyDemoDiscount(hospital: ApiHospital): ApiHospital {
  if (!hasNoDiscount(hospital) || hospital.fee <= 0) {
    return hospital;
  }

  const discountFee = Math.round(hospital.fee * (1 - DEMO_DISCOUNT_PERCENTAGE / 100));
  return {
    ...hospital,
    discountFee,
    discount: hospital.fee - discountFee,
    discountPercentage: DEMO_DISCOUNT_PERCENTAGE,
  };
}

function getLowestPhysicalFee(hospitals: ApiHospital[]): number {
  const physical = hospitals.filter((h) => !isVideoHospital(h));
  if (physical.length === 0) return hospitals[0]?.fee ?? 0;
  return Math.min(...physical.map((h) => h.fee));
}

function createSyntheticVideoHospital(
  doctor: ApiDoctor,
  reference: ApiHospital,
  fee: number,
): ApiHospital {
  return {
    doctorHospitalId: reference.doctorHospitalId,
    doctorId: doctor.doctorId,
    hospitalId: reference.hospitalId,
    hospitalName: VIDEO_HOSPITAL_NAME,
    hospitalArea: "",
    hospitalCity: reference.hospitalCity,
    hospitalType: 2,
    fee,
    isOnlinePaymentEnabled: 1,
    discountFee: 0,
    discount: 0,
    discountPercentage: 0,
    lat: 0,
    lng: 0,
    isLocationVerified: false,
  };
}

function enrichDoctorHospitals(
  doctor: ApiDoctor,
  index: number,
): ApiHospital[] {
  let hospitals = [...(doctor.hospitals ?? [])];
  const shouldAddVideo = index % 2 === 0 && !hospitals.some(isVideoHospital);

  if (shouldAddVideo && hospitals.length > 0) {
    const reference = hospitals[0];
    const fee = getLowestPhysicalFee(hospitals);
    hospitals = [createSyntheticVideoHospital(doctor, reference, fee), ...hospitals];
  }

  return hospitals.map((hospital) => {
    const isVideo = isVideoHospital(hospital);
    const shouldDiscountVideo = isVideo && index % 2 === 0;
    const shouldDiscountClinic = !isVideo && index % 4 === 0;

    if (shouldDiscountVideo || shouldDiscountClinic) {
      return applyDemoDiscount(hospital);
    }

    return hospital;
  });
}

export function enrichListingDemoData(apiDoctors: ApiDoctor[]): ApiDoctor[] {
  return apiDoctors.map((doctor, index) => {
    const shouldFastConfirm = index % 3 === 0 && doctor.firstComeFirstServe === 0;

    return {
      ...doctor,
      firstComeFirstServe: shouldFastConfirm ? 1 : doctor.firstComeFirstServe,
      hospitals: enrichDoctorHospitals(doctor, index),
    };
  });
}
