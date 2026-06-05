export type ApiHospital = {
  doctorHospitalId: number;
  doctorId: number;
  hospitalId: number;
  hospitalName: string;
  hospitalArea: string;
  hospitalCity: string;
  fee: number;
  isOnlinePaymentEnabled: number;
  discountFee: number;
  discount: number;
  discountPercentage: number;
  lat: number;
  lng: number;
  isLocationVerified: boolean;
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
