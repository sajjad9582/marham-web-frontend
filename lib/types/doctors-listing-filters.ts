export type DoctorsListingFilters = {
  page?: number;
  specialityId?: number;
  specialitySlug?: string;
  city?: string;
  minFee?: number;
  maxFee?: number;
  lat?: number;
  lng?: number;
  consultationType?: number;
  availableToday?: boolean;
  timeSlot?: number;
  gender?: "male" | "female" | "all";
  sortBy?: "fee" | "experience";
  sortDirection?: "ASC" | "DESC";
  /** Client-only: sort fetched doctors by rating DESC */
  topReviewed?: boolean;
  /** Client-only: filter doctors with discount */
  discounts?: boolean;
};

export type DoctorsListingSearchParams = Record<string, string | string[] | undefined>;
