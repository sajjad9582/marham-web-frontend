export type DoctorHospitalListingDto = {
  doctorHospitalId: number;
  doctorId: number;
  hospitalId: number;
  hospitalName: string;
  hospitalArea: string;
  hospitalCity: string;
  fee: number;
  isOnlinePaymentEnabled: boolean;
  discountFee: number;
  discount: number;
  discountPercentage: number;
  lat: number;
  lng: number;
  isLocationVerified: boolean;
};

export type DoctorListingItemDto = {
  doctorId: number;
  name: string;
  experience: number;
  profilePic?: string;
  areasOfInterest?: string | string[];
  firstComeFirstServe: number;
  satisfactionScore: number;
  rating: number;
  specialityId?: number;
  specialityName?: string;
  diagnosisScore?: number;
  degree?: string;
  reviewsCount: number;
  isPromotional: boolean;
  isTopBooked: boolean;
  hospitals: DoctorHospitalListingDto[];
};

export type DoctorListingResponseDto = {
  doctors: DoctorListingItemDto[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
};
