"use client";

import { useEffect, useState } from "react";

import { DoctorCard } from "./DoctorCard";
import { OnlineDoctorsSlider } from "./OnlineDoctorsSlider";
import type { Doctor } from "@/lib/doctors-data";
import { fetchCallMyDoctors } from "@/lib/client/call-my-doctors-service";
import { fetchDoctorsListing } from "@/lib/client/doctors-listing-service";
import type { DoctorsListingFilters } from "@/lib/types/doctors-listing-filters";
import type { DoctorsListingMeta } from "@/lib/types/marham-api";

const PAGE_SIZE = 6;

type DoctorsListProps = {
  doctors: Doctor[];
  meta: DoctorsListingMeta;
  city: string;
  speciality: string;
  filters: DoctorsListingFilters;
  specName: string;
  cityName: string;
};

function OnlineDoctorsSliderShimmer() {
  return (
    <section
      className="rounded-lg border border-[var(--color-paleblue)] bg-white p-3 md:p-4 shadow-sm"
      aria-label="Loading online doctors"
      aria-busy="true"
    >
      <div className="flex gap-3 overflow-hidden px-1 md:px-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="online-doctor-card min-w-[260px] max-w-[280px] flex-shrink-0 rounded-lg border border-[var(--color-paleblue)] p-3 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="h-16 w-16 rounded-full bg-[var(--color-paleblue)]" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-3/4 rounded bg-[var(--color-paleblue)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--color-paleblue)]" />
                <div className="h-3 w-2/3 rounded bg-[var(--color-paleblue)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DoctorsList({
  doctors: initialDoctors,
  meta: initialMeta,
  city,
  speciality,
  filters,
  specName,
  cityName,
}: DoctorsListProps) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(initialMeta.page);
  const [lastPage, setLastPage] = useState(initialMeta.lastPage);
  const [loading, setLoading] = useState(false);
  const [callMyDoctors, setCallMyDoctors] = useState<Doctor[]>([]);
  const [loadingCallMy, setLoadingCallMy] = useState(false);
  const [callMyDoctorsLoaded, setCallMyDoctorsLoaded] = useState(false);

  const hasMore = visible < doctors.length || currentPage < lastPage;
  const showOnlineSlider = callMyDoctors.length > 0;
  const showOnlineSliderShimmer = loadingCallMy && !callMyDoctorsLoaded;

  useEffect(() => {
    setDoctors(initialDoctors);
    setVisible(PAGE_SIZE);
    setCurrentPage(initialMeta.page);
    setLastPage(initialMeta.lastPage);
  }, [initialDoctors, initialMeta.page, initialMeta.lastPage, city, speciality, JSON.stringify(filters)]);

  useEffect(() => {
    let cancelled = false;

    async function loadCallMyDoctors() {
      if (!filters.specialityId) {
        setCallMyDoctors([]);
        setCallMyDoctorsLoaded(true);
        return;
      }

      setLoadingCallMy(true);
      setCallMyDoctorsLoaded(false);

      try {
        const doctors = await fetchCallMyDoctors({
          specialityId: filters.specialityId,
          city,
          specialitySlug: speciality,
        });
        if (!cancelled) {
          setCallMyDoctors(doctors);
        }
      } finally {
        if (!cancelled) {
          setLoadingCallMy(false);
          setCallMyDoctorsLoaded(true);
        }
      }
    }

    void loadCallMyDoctors();

    return () => {
      cancelled = true;
    };
  }, [filters.specialityId, city, speciality]);

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
    const items = [<DoctorCard key={doctor.id} doctor={doctor} priority={index === 0} />];

    if ((showOnlineSlider || showOnlineSliderShimmer) && index === 4) {
      items.push(
        showOnlineSliderShimmer ? (
          <OnlineDoctorsSliderShimmer key="online-doctors-shimmer" />
        ) : (
          <OnlineDoctorsSlider key="online-doctors-slider" doctors={callMyDoctors} />
        ),
      );
    }

    return items;
  });

  return (
    <section aria-label="Doctor listings">
      <h2 className="sr-only">
        Top Verified {specName}s in {cityName}
      </h2>
      <div className="space-y-2 md:space-y-4">{listingItems}</div>
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
    </section>
  );
}
