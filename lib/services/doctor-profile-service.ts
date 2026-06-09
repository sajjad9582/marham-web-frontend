import type { Hospital } from "@/lib/doctors-data";
import { VIDEO_HOSPITAL_NAME } from "@/lib/constants/doctor-listing";
import { MARHAM_API_ENDPOINTS } from "@/lib/constants/marham-api-endpoints";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import type { ApiHospital, DoctorProfileResponse } from "@/lib/types/marham-api";

function normalizeProfileHospital(raw: ApiHospital & { id?: number }): ApiHospital {
  return {
    ...raw,
    doctorHospitalId: raw.doctorHospitalId ?? raw.id ?? 0,
  };
}

export async function fetchDoctorProfileHospitals(
  doctorId: number,
): Promise<ApiHospital[]> {
  const params = new URLSearchParams({ doctorId: String(doctorId) });
  const url = `${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.DOCTORS_PROFILE}?${params.toString()}`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.log("DoctorProfileService: profile fetch failed", {
        status: response.status,
        doctorId,
      });
      return [];
    }

    const json = (await response.json()) as DoctorProfileResponse;
    const hospitals = json.data?.hospitals ?? [];

    return hospitals.map((h) => normalizeProfileHospital(h as ApiHospital & { id?: number }));
  } catch (error) {
    console.error("DoctorProfileService: profile fetch error", error);
    return [];
  }
}

export async function resolveHospitalIds(
  doctorId: number,
  hospital: Hospital,
): Promise<{ hospitalId?: number; doctorHospitalId?: number }> {
  if (hospital.hospitalId) {
    return {
      hospitalId: hospital.hospitalId,
      doctorHospitalId: hospital.doctorHospitalId,
    };
  }

  const profileHospitals = await fetchDoctorProfileHospitals(doctorId);

  const match = profileHospitals.find((h) => {
    if (hospital.isVideo) {
      return h.hospitalType === 2 || h.hospitalName === VIDEO_HOSPITAL_NAME;
    }

    if (hospital.doctorHospitalId) {
      return h.doctorHospitalId === hospital.doctorHospitalId;
    }

    return (
      h.hospitalName === hospital.name.split(",")[0]?.trim() ||
      hospital.name.includes(h.hospitalName)
    );
  });

  if (!match) {
    console.log("DoctorProfileService: could not resolve hospitalId from profile", {
      doctorId,
      hospital,
      profileHospitals,
    });
    return {};
  }

  return {
    hospitalId: match.hospitalId,
    doctorHospitalId: match.doctorHospitalId,
  };
}
