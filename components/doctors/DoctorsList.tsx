"use client";

import { useEffect, useMemo, useState } from "react";
import { DoctorCard } from "./DoctorCard";
import { OnlineDoctorsSlider } from "./OnlineDoctorsSlider";
import type { Doctor } from "@/lib/doctors-data";
import { pickOnlineDoctors } from "@/lib/online-doctors-from-listing";
import { fetchDoctorsListing } from "@/lib/services/doctors-listing-service";
import type { DoctorsListingFilters } from "@/lib/types/doctors-listing-filters";
import type { DoctorsListingMeta } from "@/lib/types/marham-api";

const PAGE_SIZE = 6;
const ONLINE_SLIDER_INTERVAL = 4;

type DoctorsListProps = {
  doctors: Doctor[];
  meta: DoctorsListingMeta;
  city: string;
  speciality: string;
  filters: DoctorsListingFilters;
};

export function DoctorsList({
  doctors: initialDoctors,
  meta: initialMeta,
  city,
  speciality,
  filters,
}: DoctorsListProps) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(initialMeta.page);
  const [lastPage, setLastPage] = useState(initialMeta.lastPage);
  const [loading, setLoading] = useState(false);

  const hasMore = visible < doctors.length || currentPage < lastPage;
  const onlineDoctors = useMemo(() => pickOnlineDoctors(doctors), [doctors]);
  const showOnlineSlider = onlineDoctors.length > 0;

  useEffect(() => {
    setDoctors(initialDoctors);
    setVisible(PAGE_SIZE);
    setCurrentPage(initialMeta.page);
    setLastPage(initialMeta.lastPage);
  }, [initialDoctors, initialMeta.page, initialMeta.lastPage, city, speciality, JSON.stringify(filters)]);

  const handleLoadMore = async () => {
    if (visible < doctors.length) {
      setVisible((v) => v + PAGE_SIZE);
      return;
    }

    if (currentPage >= lastPage || loading) return;

    setLoading(true);
    try {
      const data = await fetchDoctorsListing({
        ...filters,
        city,
        specialitySlug: speciality,
        page: currentPage + 1,
      });
      if (data.doctors.length === 0) return;

      setDoctors((prev) => [...prev, ...data.doctors]);
      setCurrentPage(data.meta.page);
      setLastPage(data.meta.lastPage);
      setVisible((v) => v + PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  const visibleDoctors = doctors.slice(0, visible);

  const listingItems = visibleDoctors.flatMap((doctor, index) => {
    const items = [<DoctorCard key={doctor.id} doctor={doctor} />];

    if (showOnlineSlider && (index + 1) % ONLINE_SLIDER_INTERVAL === 0) {
      items.push(
        <OnlineDoctorsSlider
          key={`online-doctors-after-${doctor.id}`}
          doctors={onlineDoctors}
        />,
      );
    }

    return items;
  });

  return (
    <div className="space-y-4">
      {listingItems}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-[var(--color-brandblue)] hover:bg-[var(--color-darknavy)] disabled:opacity-50 text-white font-semibold rounded-md px-8 py-2.5 text-sm transition-colors"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
