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
  /** Online doctors currently within clinic hours, open today, not on leave */
  onlineNow?: boolean;
  availableToday?: boolean;
  timeSlot?: number;
  gender?: "male" | "female" | "all";
  sortBy?: "fee" | "experience";
  sortDirection?: "ASC" | "DESC";
  /** Filter doctors with > 100 published reviews, sorted by review count DESC */
  topReviewed?: boolean;
  /** Client-only: filter doctors with discount */
  discounts?: boolean;
};

export type DoctorsListingSearchParams = Record<string, string | string[] | undefined>;
