export type ApiHospital = {
  doctorHospitalId: number;
  doctorId: number;
  hospitalId: number;
  hospitalName: string;
  hospitalArea: string;
  hospitalCity: string;
  hospitalType?: number;
  fee: number;
  isOnlinePaymentEnabled: number;
  discountFee: number;
  discount: number;
  discountPercentage: number;
  lat: number;
  lng: number;
  isLocationVerified: boolean;
};

export type DoctorProfileResponse = {
  success: boolean;
  message: string;
  data?: {
    doctorId?: number;
    hospitals?: ApiHospital[];
  } | null;
};

export type ApiDoctor = {
  doctorId: number;
  name: string;
  experience: number;
  profilePic: string;
  areasOfInterest: string[];
  firstComeFirstServe: number;
  satisfactionScore: number;
  rating: number;
  specialityId: number;
  specialityName: string;
  diagnosisScore: number | null;
  degree: string;
  reviewsCount: number;
  isPromotional: boolean;
  isTopBooked: boolean;
  hospitals: ApiHospital[];
};

export type DoctorsListingMeta = {
  total: number;
  page: number;
  lastPage: number;
};

export type DoctorsListingResponse = {
  success: boolean;
  message: string;
  data: {
    doctors: ApiDoctor[];
    meta: DoctorsListingMeta;
  };
};

export type ValidatePromoCodeResponse = {
  success: boolean;
  message: string;
  data?: {
    code?: string;
    discountPercentage?: number;
    companyName?: string;
  } | null;
};

export type DoctorAvailableSlot = {
  time: string;
  timeSlot: number;
  available: boolean;
};

export type DoctorAvailableSlotsDay = {
  date: string;
  dayName: string;
  slots: DoctorAvailableSlot[];
};

export type DoctorAvailableSlotsResponse = {
  success: boolean;
  message: string;
  data?: {
    availableSlots?: DoctorAvailableSlotsDay[];
    message?: string;
  } | null;
};

export type WebBookVideoConsultationResponse = {
  success: boolean;
  message: string;
  data?: {
    onlineConsultationId: number;
    programId: number;
    paymentUrl: string;
  } | null;
};

export type BookedVideoSlot = {
  date: string;
  time: string;
  displayTime: string;
};
