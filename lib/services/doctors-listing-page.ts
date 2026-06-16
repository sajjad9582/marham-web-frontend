import type { Doctor } from "@/lib/doctors-data";
import { formatSlug } from "@/lib/doctors-data";
import { getDoctorListing } from "@/lib/services/doctors";
import { mapApiDoctors } from "@/lib/map-doctors-response";
import type { DoctorsListingFilters } from "@/lib/types/doctors-listing-filters";
import type { DoctorsListingMeta } from "@/lib/types/marham-api";

const EMPTY_META: DoctorsListingMeta = { total: 0, page: 1, lastPage: 1 };

function locationMatchesFee(
  location: Doctor["locations"][number],
  minFee?: number,
  maxFee?: number,
): boolean {
  if (minFee !== undefined && location.feeAmount < minFee) return false;
  if (maxFee !== undefined && location.feeAmount > maxFee) return false;
  return true;
}

function applyFeeFilter(doctors: Doctor[], filters: DoctorsListingFilters): Doctor[] {
  const { minFee, maxFee } = filters;
  if (minFee === undefined && maxFee === undefined) return doctors;

  return doctors
    .map((doctor) => ({
      ...doctor,
      locations: doctor.locations.filter((l) => locationMatchesFee(l, minFee, maxFee)),
    }))
    .filter((doctor) => doctor.locations.length > 0);
}

function applyClientFilters(doctors: Doctor[], filters: DoctorsListingFilters): Doctor[] {
  let result = applyFeeFilter(doctors, filters);

  if (filters.discounts) {
    result = result.filter((d) => d.locations.some((l) => l.hasDiscount));
  }

  return result;
}

export async function getDoctorsListingPageData(
  filters: DoctorsListingFilters = {},
): Promise<{ doctors: Doctor[]; meta: DoctorsListingMeta }> {
  try {
    const data = await getDoctorListing(
      {
        specialityId: filters.specialityId,
        city: filters.city ? formatSlug(filters.city) : undefined,
        page: filters.page ?? 1,
        minFee: filters.minFee,
        maxFee: filters.maxFee,
        lat: filters.lat,
        lng: filters.lng,
        consultationType: filters.consultationType,
        availableToday: filters.availableToday,
        timeSlot: filters.timeSlot,
        gender: filters.gender,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        discounts: filters.discounts,
        topReviewed: filters.topReviewed,
        onlineNow: filters.onlineNow,
      },
      undefined,
      false,
    );

    if (!data?.doctors) {
      return { doctors: [], meta: data?.meta ?? EMPTY_META };
    }

    const doctors = applyClientFilters(
      mapApiDoctors(
        data.doctors,
        filters.city ?? "lahore",
        filters.specialitySlug ?? "pediatrician",
      ),
      filters,
    );

    return { doctors, meta: data.meta ?? EMPTY_META };
  } catch (error) {
    console.error("Doctors listing error:", error);
    return { doctors: [], meta: EMPTY_META };
  }
}
