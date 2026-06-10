export type GetDoctorsDto = {
  specialityId?: number;
  city?: string;
  area?: string;
  page?: number;
  symptomId?: number;
  serviceId?: number;
  diseaseId?: number;
  minFee?: number;
  maxFee?: number;
  gender?: "male" | "female" | "all";
  isFree?: boolean;
  lat?: number;
  lng?: number;
  consultationType?: number;
  sortBy?: "fee" | "experience";
  sortDirection?: "ASC" | "DESC";
  availableToday?: boolean;
  hospitalId?: number;
};

export type GetDoctorProfileDto = {
  doctorId: number;
};

export type GetDoctorAvailableSlotsDto = {
  doctorId: number;
  hospitalId: number;
  date?: string;
  days?: number;
};

function num(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: string | null): boolean | undefined {
  if (value == null) return undefined;
  return value === "true" || value === "1";
}

export function parseGetDoctorsDto(params: URLSearchParams): GetDoctorsDto {
  return {
    specialityId: num(params.get("specialityId")),
    city: params.get("city") ?? undefined,
    area: params.get("area") ?? undefined,
    page: num(params.get("page")) ?? 1,
    symptomId: num(params.get("symptomId")),
    serviceId: num(params.get("serviceId")),
    diseaseId: num(params.get("diseaseId")),
    minFee: num(params.get("minFee")),
    maxFee: num(params.get("maxFee")),
    gender: (params.get("gender") as GetDoctorsDto["gender"]) ?? undefined,
    isFree: bool(params.get("isFree")),
    lat: num(params.get("lat")),
    lng: num(params.get("lng")),
    consultationType: num(params.get("consultationType")),
    sortBy: (params.get("sortBy") as GetDoctorsDto["sortBy"]) ?? undefined,
    sortDirection: (params.get("sortDirection") as GetDoctorsDto["sortDirection"]) ?? undefined,
    availableToday: bool(params.get("availableToday")),
    hospitalId: num(params.get("hospitalId")),
  };
}

export function parseGetDoctorProfileDto(params: URLSearchParams): GetDoctorProfileDto {
  const doctorId = num(params.get("doctorId"));
  if (!doctorId) {
    throw new Error("doctorId is required");
  }
  return { doctorId };
}

export function parseGetDoctorAvailableSlotsDto(
  params: URLSearchParams,
): GetDoctorAvailableSlotsDto {
  const doctorId = num(params.get("doctorId"));
  const hospitalId = num(params.get("hospitalId"));
  if (!doctorId || !hospitalId) {
    throw new Error("doctorId and hospitalId are required");
  }
  return {
    doctorId,
    hospitalId,
    date: params.get("date") ?? undefined,
    days: num(params.get("days")),
  };
}
