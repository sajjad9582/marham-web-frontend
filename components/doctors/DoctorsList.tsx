"use client";

import { useEffect, useState } from "react";
import { DoctorCard } from "./DoctorCard";
import type { Doctor } from "@/lib/doctors-data";
import { fetchDoctorsListing } from "@/lib/services/doctors-listing-service";
import type { DoctorsListingFilters } from "@/lib/types/doctors-listing-filters";
import type { DoctorsListingMeta } from "@/lib/types/marham-api";

const PAGE_SIZE = 6;

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

  return (
    <div className="space-y-4">
      {doctors.slice(0, visible).map((d) => (
        <DoctorCard key={d.id} doctor={d} />
      ))}
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
